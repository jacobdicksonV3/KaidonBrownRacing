export const schema = gql`
  type AdminStats {
    totalOrders: Int!
    totalRevenue: Int!
    totalProducts: Int!
    totalMessages: Int!
    recentOrders: [Order!]!
  }

  type RefundResult {
    success: Boolean!
    message: String!
  }

  type Query {
    adminStats: AdminStats! @requireAuth(roles: ["admin"])
    adminOrders: [Order!]! @requireAuth(roles: ["admin"])
    adminOrder(id: Int!): Order @requireAuth(roles: ["admin"])
    adminProducts: [Product!]! @requireAuth(roles: ["admin"])
    adminProduct(id: Int!): Product @requireAuth(roles: ["admin"])
    adminContactMessages: [ContactMessage!]! @requireAuth(roles: ["admin"])
  }

  type Mutation {
    adminUpdateOrderStatus(id: Int!, status: String!): Order! @requireAuth(roles: ["admin"])
    adminShipOrder(id: Int!, trackingNumber: String!): Order! @requireAuth(roles: ["admin"])
    adminRefundOrder(id: Int!): RefundResult! @requireAuth(roles: ["admin"])
    adminAddOrderNote(id: Int!, notes: String!): Order! @requireAuth(roles: ["admin"])
    adminCreateProduct(input: CreateProductInput!): Product! @requireAuth(roles: ["admin"])
    adminUpdateProduct(id: Int!, input: UpdateProductInput!): Product! @requireAuth(roles: ["admin"])
    adminDeleteProduct(id: Int!): Product! @requireAuth(roles: ["admin"])
    adminDeleteContactMessage(id: Int!): ContactMessage! @requireAuth(roles: ["admin"])
  }
`
