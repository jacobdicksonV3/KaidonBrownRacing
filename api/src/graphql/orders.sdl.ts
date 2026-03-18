export const schema = gql`
  type Order {
    id: Int!
    stripeSessionId: String!
    customerName: String!
    customerEmail: String!
    customerPhone: String!
    status: String!
    totalAmount: Int!
    shippingAddress: String
    trackingNumber: String
    refundedAt: DateTime
    notes: String
    couponCode: String
    discountAmount: Int!
    deliveryMethod: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    items: [OrderItem!]!
  }

  type OrderItem {
    id: Int!
    orderId: Int!
    productId: Int!
    quantity: Int!
    size: String
    price: Int!
    product: Product!
  }

  type Query {
    orders: [Order!]! @requireAuth
    order(id: Int!): Order @requireAuth
  }
`
