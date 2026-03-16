import { db } from 'api/src/lib/db.js'

export default async () => {
  try {
    const products = [
      {
        name: 'KBR Team Tee',
        slug: 'kbr-team-tee',
        description:
          'Official Kaidon Brown Racing team t-shirt. 100% cotton with screen-printed KBR logo.',
        price: 4500,
        imageUrl: '/images/cars/car-1.webp',
        category: 'Apparel',
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', '2XL']),
      },
      {
        name: 'KBR Champion Hoodie',
        slug: 'kbr-champion-hoodie',
        description:
          '3x Champion commemorative hoodie. Heavyweight fleece with embroidered championship years.',
        price: 8500,
        imageUrl: '/images/cars/car-2.webp',
        category: 'Apparel',
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', '2XL']),
      }
    ]

    for (const product of products) {
      await db.product.upsert({
        where: { slug: product.slug },
        create: product,
        update: product,
      })
    }

    console.info(`  Seeded ${products.length} products.`)

    // Default shipping settings
    const shippingDefaults = [
      { key: 'shipping_rate_au', value: '1000' },
      { key: 'shipping_rate_intl', value: '2500' },
    ]

    for (const setting of shippingDefaults) {
      await db.siteSetting.upsert({
        where: { key: setting.key },
        create: setting,
        update: {},
      })
    }

    console.info(`  Seeded ${shippingDefaults.length} default settings.\n`)
  } catch (error) {
    console.error(error)
  }
}
