import type { QueryResolvers, MutationResolvers } from 'types/graphql'

import { db } from 'src/lib/db.js'

export const validateCoupon: QueryResolvers['validateCoupon'] = async ({
  code,
  subtotal,
}) => {
  const coupon = await db.coupon.findUnique({
    where: { code: code.toUpperCase() },
  })

  if (!coupon) {
    return { valid: false, message: 'Coupon not found' }
  }

  if (!coupon.active) {
    return { valid: false, message: 'This coupon is no longer active' }
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, message: 'This coupon has expired' }
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, message: 'This coupon has reached its usage limit' }
  }

  if (subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order of $${(coupon.minOrderAmount / 100).toFixed(2)} required`,
    }
  }

  let discountAmount = 0
  if (coupon.discountType === 'percentage') {
    discountAmount = Math.round((subtotal * coupon.discountValue) / 100)
  } else if (coupon.discountType === 'fixed') {
    discountAmount = Math.min(coupon.discountValue, subtotal)
  }
  // free_shipping: discountAmount stays 0, handled in checkout

  return {
    valid: true,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    message:
      coupon.discountType === 'free_shipping'
        ? 'Free shipping applied!'
        : coupon.discountType === 'percentage'
          ? `${coupon.discountValue}% off applied!`
          : `$${(coupon.discountValue / 100).toFixed(2)} off applied!`,
  }
}

export const adminCoupons: QueryResolvers['adminCoupons'] = () => {
  return db.coupon.findMany({ orderBy: { createdAt: 'desc' } })
}

export const adminCreateCoupon: MutationResolvers['adminCreateCoupon'] =
  async ({ input }) => {
    return db.coupon.create({
      data: {
        code: input.code.toUpperCase(),
        discountType: input.discountType,
        discountValue: input.discountValue ?? 0,
        minOrderAmount: input.minOrderAmount ?? 0,
        maxUses: input.maxUses ?? null,
        expiresAt: input.expiresAt ?? null,
        active: input.active ?? true,
      },
    })
  }

export const adminUpdateCoupon: MutationResolvers['adminUpdateCoupon'] =
  async ({ id, input }) => {
    return db.coupon.update({
      where: { id },
      data: {
        ...(input.code !== undefined && { code: input.code.toUpperCase() }),
        ...(input.discountType !== undefined && {
          discountType: input.discountType,
        }),
        ...(input.discountValue !== undefined && {
          discountValue: input.discountValue,
        }),
        ...(input.minOrderAmount !== undefined && {
          minOrderAmount: input.minOrderAmount,
        }),
        ...(input.maxUses !== undefined && { maxUses: input.maxUses }),
        ...(input.expiresAt !== undefined && { expiresAt: input.expiresAt }),
        ...(input.active !== undefined && { active: input.active }),
      },
    })
  }

export const adminDeleteCoupon: MutationResolvers['adminDeleteCoupon'] =
  async ({ id }) => {
    return db.coupon.delete({ where: { id } })
  }
