export const schema = gql`
  type ContactMessage {
    id: Int!
    name: String!
    email: String!
    message: String!
    createdAt: DateTime!
  }

  type Query {
    contactMessages: [ContactMessage!]! @requireAuth
  }

  input CreateContactMessageInput {
    name: String!
    email: String!
    message: String!
    turnstileToken: String
  }

  type Mutation {
    createContactMessage(input: CreateContactMessageInput!): ContactMessage! @skipAuth
  }
`
