import Stripe from 'stripe'
import type { MutationResolvers } from 'types/graphql'

import { db } from 'src/lib/db.js'
import { getShippingRates } from 'src/services/shipping/shipping.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export const createCheckoutSession: MutationResolvers['createCheckoutSession'] = async ({
  input,
}) => {
  const { items, shippingAddress } = input
  const productIds = items.map((i) => i.productId)
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
  })

  const webUrl = process.env.WEB_URL || 'http://localhost:8910'

  // Build product line items
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)
    if (!product) throw new Error(`Product ${item.productId} not found`)

    const imageUrl = product.imageUrl.startsWith('http')
      ? product.imageUrl
      : `${webUrl}${product.imageUrl}`

    return {
      price_data: {
        currency: 'aud',
        product_data: {
          name: product.name + (item.size ? ` (${item.size})` : ''),
          images: [imageUrl],
        },
        unit_amount: product.price,
      },
      quantity: item.quantity,
    }
  })

  // Calculate shipping
  const rates = await getShippingRates()
  const isInternational = shippingAddress.country.toUpperCase() !== 'AU'
  const baseRate = isInternational ? rates.intl : rates.au

  let surcharges = 0
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)
    if (product && product.shippingSurcharge > 0) {
      surcharges += product.shippingSurcharge * item.quantity
    }
  }

  const shippingTotal = baseRate + surcharges

  // Add shipping as a line item
  lineItems.push({
    price_data: {
      currency: 'aud',
      product_data: {
        name: `Shipping (${isInternational ? 'International' : 'Australia'})`,
      },
      unit_amount: shippingTotal,
    },
    quantity: 1,
  })

  const productTotal = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!
    return sum + product.price * item.quantity
  }, 0)
  const totalAmount = productTotal + shippingTotal

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${webUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${webUrl}/cart`,
  })

  await db.order.create({
    data: {
      stripeSessionId: session.id,
      customerName: shippingAddress.name,
      customerEmail: '',
      status: 'pending',
      totalAmount,
      shippingAddress: JSON.stringify({
        line1: shippingAddress.line1,
        line2: shippingAddress.line2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.postalCode,
        country: shippingAddress.country,
      }),
      items: {
        create: items.map((item) => {
          const product = products.find((p) => p.id === item.productId)!
          return {
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            price: product.price,
          }
        }),
      },
    },
  })

  return { url: session.url! }
}
