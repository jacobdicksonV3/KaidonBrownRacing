export const schema = gql`
  type ShippingQuote {
    baseRate: Int!
    surcharges: Int!
    total: Int!
    country: String!
    isInternational: Boolean!
  }

  input ShippingItemInput {
    productId: Int!
    quantity: Int!
  }

  type Query {
    calculateShipping(country: String!, items: [ShippingItemInput!]!): ShippingQuote! @skipAuth
  }
`
