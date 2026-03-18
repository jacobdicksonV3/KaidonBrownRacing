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

  // On some hosts (e.g. Vercel) the body arrives base64-encoded
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body!, 'base64').toString('utf-8')
    : event.body!

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
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

      // Decrement variant stock for each order item
      for (const item of order.items) {
        if (!item.size) continue
        const variants = await db.productVariant.findMany({
          where: { productId: item.productId },
        })
        const match = variants.find((v) => {
          const opts = JSON.parse(v.options) as Record<string, string>
          return Object.values(opts).join(' / ') === item.size
        })
        if (match) {
          await db.productVariant.update({
            where: { id: match.id },
            data: { stock: { decrement: item.quantity } },
          })
        }
      }

      // Send confirmation emails
      await sendOrderConfirmationEmail({
        orderId: order.id,
        customerName,
        customerEmail,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        deliveryMethod: order.deliveryMethod,
        couponCode: order.couponCode,
        discountAmount: order.discountAmount,
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
