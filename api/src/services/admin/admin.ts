import Stripe from 'stripe'
import type { QueryResolvers, MutationResolvers } from 'types/graphql'

import { db } from 'src/lib/db.js'
import {
  sendShippedEmail,
  sendReadyForCollectionEmail,
  sendCollectedEmail,
} from 'src/lib/email.js'
import { logger } from 'src/lib/logger.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export const adminStats: QueryResolvers['adminStats'] = async () => {
  const paidFilter = { status: { not: 'pending' } }

  const [totalOrders, totalRevenue, totalProducts, totalMessages, recentOrders] =
    await Promise.all([
      db.order.count({ where: paidFilter }),
      db.order.aggregate({ where: paidFilter, _sum: { totalAmount: true } }),
      db.product.count(),
      db.contactMessage.count(),
      db.order.findMany({
        where: paidFilter,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } },
      }),
    ])

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    totalProducts,
    totalMessages,
    recentOrders,
  }
}

export const adminOrders: QueryResolvers['adminOrders'] = () => {
  return db.order.findMany({
    where: { status: { not: 'pending' } },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } } },
  })
}

export const adminOrder: QueryResolvers['adminOrder'] = ({ id }) => {
  return db.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  })
}

export const adminProducts: QueryResolvers['adminProducts'] = () => {
  return db.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { attributes: { orderBy: { position: 'asc' } }, variants: true, images: { orderBy: { position: 'asc' } } },
  })
}

export const adminProduct: QueryResolvers['adminProduct'] = ({ id }) => {
  return db.product.findUnique({
    where: { id },
    include: { attributes: { orderBy: { position: 'asc' } }, variants: true, images: { orderBy: { position: 'asc' } } },
  })
}

export const adminContactMessages: QueryResolvers['adminContactMessages'] = () => {
  return db.contactMessage.findMany({ orderBy: { createdAt: 'desc' } })
}

export const adminUpdateOrderStatus: MutationResolvers['adminUpdateOrderStatus'] = async ({
  id,
  status,
}) => {
  const order = await db.order.update({ where: { id }, data: { status } })

  if (status === 'ready_for_collection') {
    await sendReadyForCollectionEmail(order.id, order.customerEmail, order.customerName)
  } else if (status === 'collected') {
    await sendCollectedEmail(order.id, order.customerEmail, order.customerName)
  }

  return order
}

export const adminShipOrder: MutationResolvers['adminShipOrder'] = async ({
  id,
  trackingNumber,
}) => {
  const order = await db.order.update({
    where: { id },
    data: {
      status: 'shipped',
      trackingNumber,
    },
  })

  await sendShippedEmail(order.id, order.customerEmail, order.customerName, trackingNumber)

  return order
}

export const adminRefundOrder: MutationResolvers['adminRefundOrder'] = async ({ id, restoreStock }) => {
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true },
  })

  if (!order) {
    return { success: false, message: 'Order not found.' }
  }

  if (order.refundedAt) {
    return { success: false, message: 'This order has already been refunded.' }
  }

  if (order.status === 'pending') {
    return { success: false, message: 'Cannot refund a pending order — payment has not been captured.' }
  }

  try {
    // Retrieve the Stripe checkout session to get the payment intent
    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId)
    const paymentIntentId = session.payment_intent as string

    if (!paymentIntentId) {
      return { success: false, message: 'No payment intent found for this order.' }
    }

    await stripe.refunds.create({ payment_intent: paymentIntentId })

    await db.order.update({
      where: { id },
      data: {
        status: 'refunded',
        refundedAt: new Date(),
      },
    })

    // Restore variant stock if requested
    if (restoreStock && order.items) {
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
            data: { stock: { increment: item.quantity } },
          })
        }
      }
    }

    return { success: true, message: restoreStock ? 'Refund issued and stock restored.' : 'Refund issued successfully.' }
  } catch (err) {
    logger.error(err, 'Stripe refund failed')
    const message = err instanceof Error ? err.message : 'Refund failed.'
    return { success: false, message }
  }
}

export const adminAddOrderNote: MutationResolvers['adminAddOrderNote'] = ({ id, notes }) => {
  return db.order.update({ where: { id }, data: { notes } })
}

export const adminCreateProduct: MutationResolvers['adminCreateProduct'] = async ({ input }) => {
  const { createProduct } = await import('src/services/products/products.js')
  return createProduct({ input })
}

export const adminUpdateProduct: MutationResolvers['adminUpdateProduct'] = async ({ id, input }) => {
  const { updateProduct } = await import('src/services/products/products.js')
  return updateProduct({ id, input })
}

export const adminDeleteProduct: MutationResolvers['adminDeleteProduct'] = ({ id }) => {
  return db.product.delete({ where: { id } })
}

export const adminDeleteContactMessage: MutationResolvers['adminDeleteContactMessage'] = ({
  id,
}) => {
  return db.contactMessage.delete({ where: { id } })
}
