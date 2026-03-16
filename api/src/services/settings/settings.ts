import type { QueryResolvers, MutationResolvers } from 'types/graphql'

import { db } from 'src/lib/db.js'

export const siteSettings: QueryResolvers['siteSettings'] = () => {
  return db.siteSetting.findMany()
}

export const siteSetting: QueryResolvers['siteSetting'] = ({ key }) => {
  return db.siteSetting.findUnique({ where: { key } })
}

export const updateSiteSettings: MutationResolvers['updateSiteSettings'] = async ({
  settings,
}) => {
  for (const { key, value } of settings) {
    await db.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    })
  }
  return db.siteSetting.findMany()
}
