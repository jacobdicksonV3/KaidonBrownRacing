import { useState } from 'react'

import { Metadata } from '@cedarjs/web'
import { useMutation, useQuery } from '@cedarjs/web'
import { toast, Toaster } from '@cedarjs/web/toast'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'

import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'

const ADMIN_COUPONS = gql`
  query AdminCouponsQuery {
    adminCoupons {
      id
      code
      discountType
      discountValue
      minOrderAmount
      maxUses
      usedCount
      expiresAt
      active
      createdAt
    }
  }
`

const CREATE_COUPON = gql`
  mutation AdminCreateCoupon($input: CreateCouponInput!) {
    adminCreateCoupon(input: $input) {
      id
    }
  }
`

const UPDATE_COUPON = gql`
  mutation AdminUpdateCoupon($id: Int!, $input: UpdateCouponInput!) {
    adminUpdateCoupon(id: $id, input: $input) {
      id
    }
  }
`

const DELETE_COUPON = gql`
  mutation AdminDeleteCoupon($id: Int!) {
    adminDeleteCoupon(id: $id) {
      id
    }
  }
`

interface CouponFormData {
  code: string
  discountType: string
  discountValue: string
  minOrderAmount: string
  maxUses: string
  expiresAt: string
  active: boolean
}

const defaultForm: CouponFormData = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderAmount: '',
  maxUses: '',
  expiresAt: '',
  active: true,
}

const inputClass =
  'w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-racing-red focus:outline-none'

const selectClass =
  'w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-racing-red focus:outline-none [&>option]:bg-[#1a1a1a] [&>option]:text-white'

const AdminCouponsPage = () => {
  const { data, loading, refetch } = useQuery(ADMIN_COUPONS)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<CouponFormData>(defaultForm)

  const refetchConfig = {
    onCompleted: () => {
      refetch()
      setShowForm(false)
      setEditingId(null)
      setForm(defaultForm)
    },
    onError: (err: Error) => toast.error(err.message),
  }

  const [createCoupon, { loading: creating }] = useMutation(CREATE_COUPON, {
    ...refetchConfig,
    onCompleted: () => {
      refetchConfig.onCompleted()
      toast.success('Coupon created')
    },
  })
  const [updateCoupon, { loading: updating }] = useMutation(UPDATE_COUPON, {
    ...refetchConfig,
    onCompleted: () => {
      refetchConfig.onCompleted()
      toast.success('Coupon updated')
    },
  })
  const [deleteCoupon] = useMutation(DELETE_COUPON, {
    onCompleted: () => {
      refetch()
      toast.success('Coupon deleted')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleEdit = (coupon: any) => {
    setEditingId(coupon.id)
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue:
        coupon.discountType === 'free_shipping'
          ? ''
          : coupon.discountType === 'percentage'
            ? String(coupon.discountValue)
            : String(coupon.discountValue / 100),
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount / 100) : '',
      maxUses: coupon.maxUses != null ? String(coupon.maxUses) : '',
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
        : '',
      active: coupon.active,
    })
    setShowForm(true)
  }

  const handleSubmit = () => {
    if (!form.code.trim()) {
      toast.error('Code is required')
      return
    }

    const input: any = {
      code: form.code.trim(),
      discountType: form.discountType,
      discountValue:
        form.discountType === 'free_shipping'
          ? 0
          : form.discountType === 'percentage'
            ? parseInt(form.discountValue) || 0
            : Math.round((parseFloat(form.discountValue) || 0) * 100),
      minOrderAmount: form.minOrderAmount
        ? Math.round(parseFloat(form.minOrderAmount) * 100)
        : 0,
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      active: form.active,
    }

    if (editingId) {
      updateCoupon({ variables: { id: editingId, input } })
    } else {
      createCoupon({ variables: { input } })
    }
  }

  const formatDiscount = (coupon: any) => {
    if (coupon.discountType === 'percentage') return `${coupon.discountValue}% off`
    if (coupon.discountType === 'fixed')
      return `$${(coupon.discountValue / 100).toFixed(2)} off`
    return 'Free shipping'
  }

  const coupons = data?.adminCoupons || []

  return (
    <>
      <Metadata title="Coupons - Admin" />
      <Toaster />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold tracking-wider text-white">
          Coupons
        </h1>
        <Button
          onClick={() => {
            setEditingId(null)
            setForm(defaultForm)
            setShowForm(!showForm)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Coupon
        </Button>
      </div>

      {/* Create/Edit form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Coupon' : 'New Coupon'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="mb-1 text-xs text-white/40">Code *</Label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, code: e.target.value }))
                  }
                  placeholder="e.g. RACE20"
                />
              </div>
              <div>
                <Label className="mb-1 text-xs text-white/40">Discount Type</Label>
                <select
                  className={selectClass}
                  value={form.discountType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, discountType: e.target.value }))
                  }
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>
              {form.discountType !== 'free_shipping' && (
                <div>
                  <Label className="mb-1 text-xs text-white/40">
                    {form.discountType === 'percentage'
                      ? 'Discount (%)'
                      : 'Discount ($)'}
                  </Label>
                  <Input
                    type="number"
                    value={form.discountValue}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, discountValue: e.target.value }))
                    }
                    placeholder={
                      form.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 10.00'
                    }
                  />
                </div>
              )}
              <div>
                <Label className="mb-1 text-xs text-white/40">
                  Min Order Amount ($)
                </Label>
                <Input
                  type="number"
                  value={form.minOrderAmount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, minOrderAmount: e.target.value }))
                  }
                  placeholder="0 = no minimum"
                />
              </div>
              <div>
                <Label className="mb-1 text-xs text-white/40">Max Uses</Label>
                <Input
                  type="number"
                  value={form.maxUses}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, maxUses: e.target.value }))
                  }
                  placeholder="Empty = unlimited"
                />
              </div>
              <div>
                <Label className="mb-1 text-xs text-white/40">Expires At</Label>
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, expiresAt: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, active: e.target.checked }))
                    }
                    className="h-4 w-4 rounded"
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={creating || updating}
              >
                {creating || updating
                  ? 'Saving...'
                  : editingId
                    ? 'Update Coupon'
                    : 'Create Coupon'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setForm(defaultForm)
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coupons list */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <div className="h-32 animate-pulse rounded bg-white/5" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-6 text-center text-white/40">
              <Tag className="mx-auto mb-2 h-8 w-8 text-white/20" />
              <p>No coupons yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {coupons.map((coupon: any) => (
                <div
                  key={coupon.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-heading text-sm font-bold tracking-wider text-white">
                        {coupon.code}
                      </span>
                      <Badge variant={coupon.active ? 'success' : 'secondary'}>
                        {coupon.active ? 'Active' : 'Inactive'}
                      </Badge>
                      {coupon.expiresAt &&
                        new Date(coupon.expiresAt) < new Date() && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                    </div>
                    <div className="mt-1 flex gap-4 text-xs text-white/40">
                      <span>{formatDiscount(coupon)}</span>
                      <span>
                        Used: {coupon.usedCount}
                        {coupon.maxUses != null ? `/${coupon.maxUses}` : ''}
                      </span>
                      {coupon.minOrderAmount > 0 && (
                        <span>
                          Min: ${(coupon.minOrderAmount / 100).toFixed(2)}
                        </span>
                      )}
                      {coupon.expiresAt && (
                        <span>
                          Expires:{' '}
                          {new Date(coupon.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(coupon)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (
                          confirm(
                            `Delete coupon ${coupon.code}?`
                          )
                        ) {
                          deleteCoupon({
                            variables: { id: coupon.id },
                          })
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default AdminCouponsPage
