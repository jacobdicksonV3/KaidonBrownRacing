export const schema = gql`
  type CheckoutSession {
    url: String!
  }

  input CheckoutItemInput {
    productId: Int!
    quantity: Int!
    size: String
  }

  input ShippingAddressInput {
    name: String!
    line1: String!
    line2: String
    city: String!
    state: String!
    postalCode: String!
    country: String!
  }

  input CheckoutInput {
    items: [CheckoutItemInput!]!
    shippingAddress: ShippingAddressInput!
    customerEmail: String!
    customerPhone: String
  }

  type Mutation {
    createCheckoutSession(input: CheckoutInput!): CheckoutSession! @skipAuth
  }
`
