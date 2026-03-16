import type { QueryResolvers, MutationResolvers, ProductRelationResolvers } from 'types/graphql'

import { db } from 'src/lib/db.js'

export const products: QueryResolvers['products'] = () => {
  return db.product.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
  })
}

export const product: QueryResolvers['product'] = ({ id }) => {
  return db.product.findUnique({ where: { id } })
}

export const Product: ProductRelationResolvers = {
  attributes: (_obj, { root }) => {
    return db.product
      .findUnique({ where: { id: root.id } })
      .attributes({ orderBy: { position: 'asc' } })
  },
  variants: (_obj, { root }) => {
    return db.product.findUnique({ where: { id: root.id } }).variants()
  },
}

export const createProduct: MutationResolvers['createProduct'] = ({ input }) => {
  const { attributes, variants, ...productData } = input
  return db.product.create({
    data: {
      ...productData,
      attributes: attributes?.length
        ? {
            create: attributes.map((a, i) => ({
              name: a.name,
              values: a.values,
              position: a.position ?? i,
            })),
          }
        : undefined,
      variants: variants?.length
        ? {
            create: variants.map((v) => ({
              options: v.options,
              sku: v.sku,
              price: v.price,
              stock: v.stock,
            })),
          }
        : undefined,
    },
  })
}

export const updateProduct: MutationResolvers['updateProduct'] = async ({ id, input }) => {
  const { attributes, variants, ...productData } = input

  const ops: Parameters<typeof db.$transaction>[0] = []

  if (attributes) {
    // Delete old attributes and recreate
    ops.push(db.productAttribute.deleteMany({ where: { productId: id } }))
    for (let i = 0; i < attributes.length; i++) {
      const a = attributes[i]
      ops.push(
        db.productAttribute.create({
          data: { productId: id, name: a.name, values: a.values, position: a.position ?? i },
        })
      )
    }
  }

  if (variants) {
    const existing = await db.productVariant.findMany({ where: { productId: id } })
    const incomingIds = variants.filter((v) => v.id).map((v) => v.id!)
    const toDelete = existing.filter((e) => !incomingIds.includes(e.id))

    for (const v of toDelete) {
      ops.push(db.productVariant.delete({ where: { id: v.id } }))
    }
    for (const v of variants) {
      if (v.id) {
        ops.push(
          db.productVariant.update({
            where: { id: v.id },
            data: { options: v.options, sku: v.sku, price: v.price, stock: v.stock },
          })
        )
      } else {
        ops.push(
          db.productVariant.create({
            data: { productId: id, options: v.options, sku: v.sku, price: v.price, stock: v.stock },
          })
        )
      }
    }
  }

  if (ops.length > 0) {
    await db.$transaction(ops)
  }

  return db.product.update({ where: { id }, data: productData })
}

export const deleteProduct: MutationResolvers['deleteProduct'] = ({ id }) => {
  return db.product.delete({ where: { id } })
}
