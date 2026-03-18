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
  const {
    items,
    shippingAddress,
    customerName,
    customerEmail,
    customerPhone,
    couponCode,
    deliveryMethod: rawDeliveryMethod,
  } = input
  const deliveryMethod = rawDeliveryMethod || 'shipping'
  const isPickup = deliveryMethod === 'pickup'

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
  let shippingTotal = 0
  let isInternational = false

  if (isPickup) {
    // No shipping for pickup
    lineItems.push({
      price_data: {
        currency: 'aud',
        product_data: { name: 'Pickup from Track' },
        unit_amount: 0,
      },
      quantity: 1,
    })
  } else {
    const rates = await getShippingRates()
    isInternational = shippingAddress
      ? shippingAddress.country.toUpperCase() !== 'AU'
      : false
    const baseRate = isInternational ? rates.intl : rates.au

    let surcharges = 0
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (product && product.shippingSurcharge > 0) {
        surcharges += product.shippingSurcharge * item.quantity
      }
    }

    shippingTotal = baseRate + surcharges

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
  }

  // Validate and apply coupon
  let coupon = null
  let discountAmount = 0
  let stripeCouponId: string | undefined

  if (couponCode) {
    coupon = await db.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    })

    if (!coupon || !coupon.active) {
      throw new Error('Invalid coupon code')
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new Error('This coupon has expired')
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      throw new Error('This coupon has reached its usage limit')
    }

    const productTotal = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!
      return sum + product.price * item.quantity
    }, 0)

    if (productTotal < coupon.minOrderAmount) {
      throw new Error(
        `Minimum order of $${(coupon.minOrderAmount / 100).toFixed(2)} required`
      )
    }

    if (coupon.discountType === 'free_shipping') {
      // Zero out the shipping line item
      discountAmount = shippingTotal
      const shippingLineItem = lineItems[lineItems.length - 1]
      shippingLineItem.price_data!.unit_amount = 0
      shippingLineItem.price_data!.product_data!.name = 'Shipping (Free — coupon applied)'
      shippingTotal = 0
    } else if (coupon.discountType === 'percentage') {
      // Create a Stripe coupon for percentage discount
      const stripeCoupon = await stripe.coupons.create({
        percent_off: coupon.discountValue,
        duration: 'once',
        name: `${coupon.code} — ${coupon.discountValue}% off`,
      })
      stripeCouponId = stripeCoupon.id
      discountAmount = Math.round((productTotal * coupon.discountValue) / 100)
    } else if (coupon.discountType === 'fixed') {
      const stripeCoupon = await stripe.coupons.create({
        amount_off: Math.min(coupon.discountValue, productTotal),
        currency: 'aud',
        duration: 'once',
        name: `${coupon.code} — $${(coupon.discountValue / 100).toFixed(2)} off`,
      })
      stripeCouponId = stripeCoupon.id
      discountAmount = Math.min(coupon.discountValue, productTotal)
    }

    // Increment usage
    await db.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } },
    })
  }

  const productTotal = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!
    return sum + product.price * item.quantity
  }, 0)
  const totalAmount = productTotal + shippingTotal - discountAmount

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    customer_email: customerEmail,
    phone_number_collection: { enabled: false },
    success_url: `${webUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${webUrl}/cart`,
  }

  if (stripeCouponId) {
    sessionParams.discounts = [{ coupon: stripeCouponId }]
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  await db.order.create({
    data: {
      stripeSessionId: session.id,
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
      status: 'pending',
      totalAmount,
      couponCode: coupon ? coupon.code : null,
      discountAmount,
      deliveryMethod,
      shippingAddress: isPickup
        ? null
        : shippingAddress
          ? JSON.stringify({
              line1: shippingAddress.line1,
              line2: shippingAddress.line2,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postal_code: shippingAddress.postalCode,
              country: shippingAddress.country,
            })
          : null,
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
