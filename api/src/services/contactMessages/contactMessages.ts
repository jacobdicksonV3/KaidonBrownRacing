import type { QueryResolvers, MutationResolvers } from 'types/graphql'

import { db } from 'src/lib/db.js'
import { verifyTurnstileToken } from 'src/lib/turnstile.js'

export const contactMessages: QueryResolvers['contactMessages'] = () => {
  return db.contactMessage.findMany({ orderBy: { createdAt: 'desc' } })
}

export const createContactMessage: MutationResolvers['createContactMessage'] = async ({ input }) => {
  const { turnstileToken, ...data } = input

  if (process.env.TURNSTILE_SECRET_KEY) {
    if (!turnstileToken) {
      throw new Error('Please complete the verification challenge.')
    }
    const valid = await verifyTurnstileToken(turnstileToken)
    if (!valid) {
      throw new Error('Verification failed. Please try again.')
    }
  }

  return db.contactMessage.create({ data })
}
