export const schema = gql`
  type SiteSetting {
    key: String!
    value: String!
  }

  type Query {
    siteSettings: [SiteSetting!]! @skipAuth
    siteSetting(key: String!): SiteSetting @skipAuth
  }

  input UpdateSettingsInput {
    key: String!
    value: String!
  }

  type Mutation {
    updateSiteSettings(settings: [UpdateSettingsInput!]!): [SiteSetting!]! @requireAuth(roles: ["admin"])
  }
`
