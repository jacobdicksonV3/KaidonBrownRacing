import type { QueryResolvers, OrderRelationResolvers, OrderItemRelationResolvers } from 'types/graphql'

import { db } from 'src/lib/db.js'

export const orders: QueryResolvers['orders'] = () => {
  return db.order.findMany({ orderBy: { createdAt: 'desc' } })
}

export const order: QueryResolvers['order'] = ({ id }) => {
  return db.order.findUnique({ where: { id } })
}

export const Order: OrderRelationResolvers = {
  items: (_obj, { root }) => {
    return db.order.findUnique({ where: { id: root.id } }).items()
  },
}

export const OrderItem: OrderItemRelationResolvers = {
  product: (_obj, { root }) => {
    return db.orderItem.findUnique({ where: { id: root.id } }).product()
  },
}
