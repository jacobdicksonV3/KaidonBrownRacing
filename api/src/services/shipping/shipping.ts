import type { QueryResolvers } from 'types/graphql'

import { db } from 'src/lib/db.js'

async function getShippingRates() {
  const settings = await db.siteSetting.findMany({
    where: { key: { in: ['shipping_rate_au', 'shipping_rate_intl'] } },
  })

  const auSetting = settings.find((s) => s.key === 'shipping_rate_au')
  const intlSetting = settings.find((s) => s.key === 'shipping_rate_intl')

  return {
    au: auSetting ? parseInt(auSetting.value, 10) : parseInt(process.env.SHIPPING_RATE_AU || '1000', 10),
    intl: intlSetting ? parseInt(intlSetting.value, 10) : parseInt(process.env.SHIPPING_RATE_INTL || '2500', 10),
  }
}

export { getShippingRates }

export const calculateShipping: QueryResolvers['calculateShipping'] = async ({
  country,
  items,
}) => {
  const rates = await getShippingRates()
  const isInternational = country.toUpperCase() !== 'AU'
  const baseRate = isInternational ? rates.intl : rates.au

  const productIds = items.map((i) => i.productId)
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, shippingSurcharge: true },
  })

  let surcharges = 0
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)
    if (product && product.shippingSurcharge > 0) {
      surcharges += product.shippingSurcharge * item.quantity
    }
  }

  return {
    baseRate,
    surcharges,
    total: baseRate + surcharges,
    country: country.toUpperCase(),
    isInternational,
  }
}
