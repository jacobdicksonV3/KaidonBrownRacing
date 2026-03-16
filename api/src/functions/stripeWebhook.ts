import type { APIGatewayEvent } from 'aws-lambda'
import Stripe from 'stripe'

import { db } from 'src/lib/db.js'
import { sendOrderConfirmationEmail } from 'src/lib/email.js'
import { logger } from 'src/lib/logger.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export const handler = async (event: APIGatewayEvent) => {
  const sig = event.headers['stripe-signature']

  if (!sig) {
    return { statusCode: 400, body: 'Missing stripe-signature header' }
  }

  let stripeEvent: Stripe.Event

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body!,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    logger.error(err, 'Stripe webhook signature verification failed')
    return { statusCode: 400, body: 'Webhook signature verification failed' }
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object as Stripe.Checkout.Session

    try {
      const customerName = session.customer_details?.name || session.shipping_details?.name || ''
      const customerEmail = session.customer_details?.email || ''

      const order = await db.order.update({
        where: { stripeSessionId: session.id },
        data: {
          status: 'paid',
          customerName,
          customerEmail,
          shippingAddress: session.shipping_details
            ? JSON.stringify(session.shipping_details.address)
            : undefined,
        },
        include: {
          items: {
            include: { product: { select: { name: true } } },
          },
        },
      })

      logger.info({ sessionId: session.id, orderId: order.id }, 'Order marked as paid')

      // Send confirmation emails
      await sendOrderConfirmationEmail({
        orderId: order.id,
        customerName,
        customerEmail,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          size: item.size,
          price: item.price,
        })),
      })
    } catch (err) {
      logger.error(err, 'Failed to update order')
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) }
}
