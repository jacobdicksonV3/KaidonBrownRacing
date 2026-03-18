export const schema = gql`
  type Coupon {
    id: Int!
    code: String!
    discountType: String!
    discountValue: Int!
    minOrderAmount: Int!
    maxUses: Int
    usedCount: Int!
    expiresAt: DateTime
    active: Boolean!
    createdAt: DateTime!
  }

  type CouponValidation {
    valid: Boolean!
    discountType: String
    discountValue: Int
    discountAmount: Int
    message: String!
  }

  input CreateCouponInput {
    code: String!
    discountType: String!
    discountValue: Int
    minOrderAmount: Int
    maxUses: Int
    expiresAt: DateTime
    active: Boolean
  }

  input UpdateCouponInput {
    code: String
    discountType: String
    discountValue: Int
    minOrderAmount: Int
    maxUses: Int
    expiresAt: DateTime
    active: Boolean
  }

  type Query {
    validateCoupon(code: String!, subtotal: Int!): CouponValidation! @skipAuth
    adminCoupons: [Coupon!]! @requireAuth(roles: ["admin"])
  }

  type Mutation {
    adminCreateCoupon(input: CreateCouponInput!): Coupon!
      @requireAuth(roles: ["admin"])
    adminUpdateCoupon(id: Int!, input: UpdateCouponInput!): Coupon!
      @requireAuth(roles: ["admin"])
    adminDeleteCoupon(id: Int!): Coupon! @requireAuth(roles: ["admin"])
  }
`
