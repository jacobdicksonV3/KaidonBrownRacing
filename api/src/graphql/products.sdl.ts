export const schema = gql`
  type Product {
    id: Int!
    name: String!
    slug: String!
    description: String!
    price: Int!
    imageUrl: String!
    category: String!
    sizes: String!
    shippingSurcharge: Int!
    active: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    attributes: [ProductAttribute!]!
    variants: [ProductVariant!]!
  }

  type ProductAttribute {
    id: Int!
    productId: Int!
    name: String!
    values: String!
    position: Int!
  }

  type ProductVariant {
    id: Int!
    productId: Int!
    options: String!
    sku: String
    price: Int
    stock: Int!
  }

  type Query {
    products: [Product!]! @skipAuth
    product(id: Int!): Product @skipAuth
  }

  input AttributeInput {
    id: Int
    name: String!
    values: String!
    position: Int
  }

  input VariantInput {
    id: Int
    options: String!
    sku: String
    price: Int
    stock: Int!
  }

  input CreateProductInput {
    name: String!
    slug: String!
    description: String!
    price: Int!
    imageUrl: String!
    category: String!
    sizes: String
    shippingSurcharge: Int
    attributes: [AttributeInput!]
    variants: [VariantInput!]
  }

  input UpdateProductInput {
    name: String
    slug: String
    description: String
    price: Int
    imageUrl: String
    category: String
    sizes: String
    shippingSurcharge: Int
    active: Boolean
    attributes: [AttributeInput!]
    variants: [VariantInput!]
  }

  type Mutation {
    createProduct(input: CreateProductInput!): Product! @requireAuth
    updateProduct(id: Int!, input: UpdateProductInput!): Product! @requireAuth
    deleteProduct(id: Int!): Product! @requireAuth
  }
`
