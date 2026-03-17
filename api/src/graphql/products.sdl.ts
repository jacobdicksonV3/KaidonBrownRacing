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
    images: [ProductImage!]!
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

  type ProductImage {
    id: Int!
    productId: Int!
    url: String!
    position: Int!
    attributeValue: String
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

  input ProductImageInput {
    id: Int
    url: String!
    position: Int!
    attributeValue: String
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
    images: [ProductImageInput!]
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
    images: [ProductImageInput!]
  }

  type Mutation {
    createProduct(input: CreateProductInput!): Product! @requireAuth
    updateProduct(id: Int!, input: UpdateProductInput!): Product! @requireAuth
    deleteProduct(id: Int!): Product! @requireAuth
  }
`
