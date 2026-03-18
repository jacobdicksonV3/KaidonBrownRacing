import { useState } from 'react'

import { back } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'
import type { CellSuccessProps, CellFailureProps } from '@cedarjs/web'
import { createCell } from '@cedarjs/web'
import { useMutation } from '@cedarjs/web'
import { toast, Toaster } from '@cedarjs/web/toast'
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Clock,
  User,
  AlertTriangle,
  RotateCcw,
  StickyNote,
  CheckCircle2,
} from 'lucide-react'

import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Textarea } from 'src/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'src/components/ui/card'

const QUERY = gql`
  query AdminOrderDetailQuery($id: Int!) {
    adminOrder(id: $id) {
      id
      stripeSessionId
      customerName
      customerEmail
      customerPhone
      status
      totalAmount
      shippingAddress
      trackingNumber
      refundedAt
      notes
      couponCode
      discountAmount
      deliveryMethod
      createdAt
      updatedAt
      items {
        id
        quantity
        size
        price
        product {
          id
          name
          imageUrl
          category
        }
      }
    }
  }
`

const UPDATE_STATUS = gql`
  mutation AdminUpdateOrderStatus($id: Int!, $status: String!) {
    adminUpdateOrderStatus(id: $id, status: $status) { id status }
  }
`

const SHIP_ORDER = gql`
  mutation AdminShipOrder($id: Int!, $trackingNumber: String!) {
    adminShipOrder(id: $id, trackingNumber: $trackingNumber) { id status trackingNumber }
  }
`

const REFUND_ORDER = gql`
  mutation AdminRefundOrder($id: Int!, $restoreStock: Boolean) {
    adminRefundOrder(id: $id, restoreStock: $restoreStock) { success message }
  }
`

const ADD_NOTE = gql`
  mutation AdminAddOrderNote($id: Int!, $notes: String!) {
    adminAddOrderNote(id: $id, notes: $notes) { id notes }
  }
`

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'destructive' | 'default' | 'secondary'; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  paid: { variant: 'success', label: 'Paid' },
  shipped: { variant: 'default', label: 'Shipped' },
  ready_for_collection: { variant: 'default', label: 'Ready for Collection' },
  collected: { variant: 'success', label: 'Collected' },
  refunded: { variant: 'destructive', label: 'Refunded' },
  cancelled: { variant: 'destructive', label: 'Cancelled' },
}

const Loading = () => (
  <div className="space-y-6">
    <Card><CardContent className="p-6"><div className="h-32 animate-pulse rounded bg-white/5" /></CardContent></Card>
    <div className="grid gap-6 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}><CardContent className="p-6"><div className="h-40 animate-pulse rounded bg-white/5" /></CardContent></Card>
      ))}
    </div>
  </div>
)

const Failure = ({ error }: CellFailureProps) => (
  <div className="text-racing-red">Error: {error?.message}</div>
)

const Empty = () => <div className="text-white/40">Order not found.</div>

const Success = ({ adminOrder: order }: CellSuccessProps) => {
  const [trackingInput, setTrackingInput] = useState(order.trackingNumber || '')
  const [noteInput, setNoteInput] = useState(order.notes || '')
  const [showRefundConfirm, setShowRefundConfirm] = useState(false)
  const [restoreStock, setRestoreStock] = useState(true)

  const isPickup = order.deliveryMethod === 'pickup'
  const isTerminal = order.status === 'refunded' || order.status === 'cancelled'

  const refetchConfig = {
    refetchQueries: ['AdminOrderDetailQuery'],
    onError: (err: Error) => toast.error(err.message),
  }

  const [updateStatus, { loading: statusUpdating }] = useMutation(UPDATE_STATUS, {
    ...refetchConfig,
    onCompleted: () => toast.success('Status updated'),
  })
  const [shipOrder, { loading: shipping }] = useMutation(SHIP_ORDER, {
    ...refetchConfig,
    onCompleted: () => toast.success('Order marked as shipped'),
  })
  const [refundOrder, { loading: refunding }] = useMutation(REFUND_ORDER, {
    onCompleted: (data) => {
      if (data.adminRefundOrder.success) {
        toast.success(data.adminRefundOrder.message)
      } else {
        toast.error(data.adminRefundOrder.message)
      }
      setShowRefundConfirm(false)
    },
    refetchQueries: ['AdminOrderDetailQuery'],
  })
  const [addNote] = useMutation(ADD_NOTE, {
    ...refetchConfig,
    onCompleted: () => toast.success('Note saved'),
  })

  const address = order.shippingAddress ? JSON.parse(order.shippingAddress) : null
  const sc = statusConfig[order.status] || statusConfig.pending
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0)

  const handleShip = () => {
    if (!trackingInput.trim()) {
      toast.error('Please enter a tracking number')
      return
    }
    shipOrder({ variables: { id: order.id, trackingNumber: trackingInput.trim() } })
  }

  // Build the status flow steps based on delivery method
  const shippingSteps = [
    { value: 'pending', label: 'Pending', desc: 'Awaiting payment', color: 'bg-yellow-500', ring: 'ring-yellow-500/30' },
    { value: 'paid', label: 'Paid', desc: 'Payment received', color: 'bg-green-500', ring: 'ring-green-500/30' },
    { value: 'shipped', label: 'Shipped', desc: 'Dispatched to customer', color: 'bg-blue-500', ring: 'ring-blue-500/30' },
  ]
  const pickupSteps = [
    { value: 'pending', label: 'Pending', desc: 'Awaiting payment', color: 'bg-yellow-500', ring: 'ring-yellow-500/30' },
    { value: 'paid', label: 'Paid', desc: 'Payment received', color: 'bg-green-500', ring: 'ring-green-500/30' },
    { value: 'ready_for_collection', label: 'Ready for Collection', desc: 'Awaiting pickup at track', color: 'bg-blue-500', ring: 'ring-blue-500/30' },
    { value: 'collected', label: 'Collected', desc: 'Customer has collected', color: 'bg-emerald-500', ring: 'ring-emerald-500/30' },
  ]

  const steps = isPickup ? pickupSteps : shippingSteps
  const currentStepIndex = steps.findIndex((s) => s.value === order.status)

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Order header banner */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-lg font-bold text-white md:text-xl">Order #{order.id}</h2>
                <Badge variant={sc.variant}>{sc.label}</Badge>
                {isPickup && <Badge variant="secondary">Pickup</Badge>}
                {order.refundedAt && (
                  <Badge variant="destructive">Refunded {new Date(order.refundedAt).toLocaleDateString()}</Badge>
                )}
              </div>
              <div className="mt-1 text-xs text-white/40 md:text-sm">
                <span>Placed {new Date(order.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 md:block md:text-right">
              <p className="text-xs text-white/40 md:text-sm">Order Total</p>
              <div className="flex items-baseline gap-2 md:block">
                <p className="font-heading text-2xl font-bold text-white md:text-3xl">${(order.totalAmount / 100).toFixed(2)}</p>
                <p className="text-xs text-white/40 md:text-sm">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Customer */}
        <Card className="overflow-hidden">
          <CardHeader className="px-4 pb-3 md:px-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-white/40" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0 overflow-hidden px-4 md:px-6">
            <dl className="min-w-0 space-y-3 text-sm">
              <div>
                <dt className="text-white/40">Name</dt>
                <dd className="mt-0.5 text-white">{order.customerName || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-white/40">Email</dt>
                <dd className="mt-0.5 text-white">{order.customerEmail || 'Not provided'}</dd>
              </div>
              {order.customerPhone && (
                <div>
                  <dt className="text-white/40">Phone</dt>
                  <dd className="mt-0.5 text-white">{order.customerPhone}</dd>
                </div>
              )}
              <div>
                <dt className="text-white/40">Stripe Session</dt>
                <dd className="mt-0.5 truncate font-mono text-xs text-white/30">{order.stripeSessionId}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Delivery / Address */}
        <Card>
          <CardHeader className="px-4 pb-3 md:px-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-white/40" />
              {isPickup ? 'Delivery' : 'Shipping Address'}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            {isPickup ? (
              <div className="rounded border border-gold/20 bg-gold/5 px-3 py-2 text-sm text-gold">
                Pickup from Track
              </div>
            ) : address ? (
              <div className="text-sm text-white/70">
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>{address.city}, {address.state} {address.postal_code}</p>
                <p>{address.country}</p>
              </div>
            ) : (
              <p className="text-sm text-white/30">No shipping address provided</p>
            )}
            {order.couponCode && (
              <div className="mt-4 rounded border border-green-500/20 bg-green-500/5 p-3">
                <div className="text-xs text-white/40">Coupon Applied</div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono text-sm text-green-400">{order.couponCode}</span>
                  <span className="text-sm text-green-400">-${(order.discountAmount / 100).toFixed(2)}</span>
                </div>
              </div>
            )}
            {order.trackingNumber && (
              <div className="mt-4 rounded border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <Truck className="h-3 w-3" />
                  Tracking Number (Australia Post)
                </div>
                <a
                  href={`https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(order.trackingNumber)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block font-mono text-sm text-gold hover:underline"
                >
                  {order.trackingNumber}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="px-4 pb-3 md:px-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-white/40" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-white/20" />
                <div>
                  <p className="text-white/70">Order placed</p>
                  <p className="text-xs text-white/30">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {order.status !== 'pending' && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-white/70">Payment received</p>
                  </div>
                </div>
              )}
              {order.status === 'ready_for_collection' && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-white/70">Ready for collection</p>
                  </div>
                </div>
              )}
              {order.status === 'collected' && (
                <>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-white/70">Ready for collection</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-white/70">Collected by customer</p>
                    </div>
                  </div>
                </>
              )}
              {order.trackingNumber && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-white/70">Shipped via Australia Post</p>
                    <a
                      href={`https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(order.trackingNumber)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-gold hover:underline"
                    >
                      {order.trackingNumber}
                    </a>
                  </div>
                </div>
              )}
              {order.refundedAt && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-red-500" />
                  <div>
                    <p className="text-white/70">Refunded</p>
                    <p className="text-xs text-white/30">{new Date(order.refundedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader className="px-4 md:px-6">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-4 w-4 text-white/40" />
            Items
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3 md:gap-4 md:px-6 md:py-4">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="h-12 w-12 flex-shrink-0 rounded-lg object-cover md:h-16 md:w-16"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{item.product.name}</p>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-white/40">
                    <span>{item.product.category}</span>
                    {item.size && <span>Size: {item.size}</span>}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-white/40 md:text-sm">x{item.quantity}</p>
                  <p className="text-sm font-medium text-white">${(item.price * item.quantity / 100).toFixed(2)}</p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-white/30">${(item.price / 100).toFixed(2)} each</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 px-4 py-3 md:px-6 md:py-4">
            <div className="flex justify-between">
              <span className="font-medium text-white/50">Total</span>
              <span className="font-heading text-lg font-bold text-white">${(order.totalAmount / 100).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Progress + Actions */}
      <Card>
        <CardHeader className="px-4 md:px-6">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-white/40" />
            Order Progress
          </CardTitle>
          <CardDescription>
            {isTerminal
              ? `This order has been ${order.status}.`
              : isPickup
                ? 'Track and update pickup order status'
                : 'Track and update shipping order status'}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          {isTerminal ? (
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-sm text-white/40">
              Status is locked — this order has been {order.status}.
            </div>
          ) : (
            <>
              {/* Step progress bar */}
              <div className="mb-6 flex items-center gap-1">
                {steps.map((step, i) => {
                  const isComplete = i < currentStepIndex
                  const isCurrent = i === currentStepIndex
                  return (
                    <div key={step.value} className="flex flex-1 items-center gap-1">
                      <div className="flex-1">
                        <div
                          className={`h-1.5 rounded-full transition-colors ${
                            isComplete || isCurrent ? step.color : 'bg-white/10'
                          }`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Step buttons */}
              <div className="space-y-2">
                {steps.map((step, i) => {
                  const isComplete = i < currentStepIndex
                  const isCurrent = i === currentStepIndex
                  const isNext = i === currentStepIndex + 1
                  return (
                    <button
                      key={step.value}
                      onClick={() => {
                        if (!isCurrent) {
                          updateStatus({ variables: { id: order.id, status: step.value } })
                        }
                      }}
                      disabled={isCurrent || statusUpdating}
                      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all md:gap-4 md:px-4 md:py-3 ${
                        isCurrent
                          ? `border-white/20 bg-white/[0.06] ring-2 ${step.ring}`
                          : isNext
                            ? 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                            : 'border-transparent bg-transparent hover:bg-white/[0.02]'
                      } disabled:cursor-default`}
                    >
                      <div
                        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold md:h-7 md:w-7 ${
                          isComplete
                            ? `${step.color} text-white`
                            : isCurrent
                              ? `${step.color} text-white ring-4 ${step.ring}`
                              : 'bg-white/10 text-white/30'
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${isCurrent || isComplete ? 'text-white' : 'text-white/40'}`}>
                          {step.label}
                        </p>
                        <p className="hidden text-xs text-white/30 md:block">{step.desc}</p>
                      </div>
                      {isCurrent && (
                        <Badge variant={sc.variant} className="flex-shrink-0">Current</Badge>
                      )}
                      {isNext && !statusUpdating && (
                        <span className="hidden flex-shrink-0 text-xs text-white/30 sm:inline">Click to advance</span>
                      )}
                    </button>
                  )
                })}

                {/* Cancel option */}
                <button
                  onClick={() => updateStatus({ variables: { id: order.id, status: 'cancelled' } })}
                  disabled={statusUpdating}
                  className="mt-2 flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left text-white/30 transition-all hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-400 md:gap-4 md:px-4 md:py-3"
                >
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/5 text-xs md:h-7 md:w-7">
                    ✕
                  </div>
                  <div>
                    <p className="text-sm font-medium">Cancel Order</p>
                  </div>
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Ship Order (only for shipping orders) + Refund */}
      <div className={`grid gap-4 md:gap-6 ${!isPickup ? 'lg:grid-cols-2' : ''}`}>
        {!isPickup && (
          <Card>
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-white/40" />
                Ship Order
              </CardTitle>
              <CardDescription>Enter a tracking number to mark as shipped</CardDescription>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <Input
                    placeholder="e.g. AP123456789AU"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    disabled={isTerminal}
                  />
                </div>
                <Button
                  className="w-full sm:w-auto"
                  onClick={handleShip}
                  disabled={shipping || isTerminal}
                >
                  {shipping ? 'Shipping...' : order.trackingNumber ? 'Update' : 'Mark Shipped'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Refund */}
        <Card>
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-white/40" />
              Refund
            </CardTitle>
            <CardDescription>Issue a full refund via Stripe</CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            {order.refundedAt ? (
              <p className="text-sm text-white/40">
                This order was refunded on {new Date(order.refundedAt).toLocaleString()}.
              </p>
            ) : order.status === 'pending' ? (
              <p className="text-sm text-white/40">
                Cannot refund — payment has not been captured yet.
              </p>
            ) : showRefundConfirm ? (
              <div className="rounded border border-red-500/30 bg-red-500/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-red-400">
                      Refund ${(order.totalAmount / 100).toFixed(2)} to {order.customerEmail || 'customer'}?
                    </p>
                    <p className="mt-1 text-xs text-white/40">This action cannot be undone.</p>
                    <label className="mt-3 flex items-center gap-2 text-sm text-white/60">
                      <input
                        type="checkbox"
                        checked={restoreStock}
                        onChange={(e) => setRestoreStock(e.target.checked)}
                        className="h-4 w-4 rounded"
                      />
                      Restore inventory stock
                    </label>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => refundOrder({ variables: { id: order.id, restoreStock } })}
                        disabled={refunding}
                      >
                        {refunding ? 'Processing...' : 'Confirm Refund'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRefundConfirm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowRefundConfirm(true)}
              >
                Issue Refund
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader className="px-4 md:px-6">
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-white/40" />
            Internal Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <Textarea
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="Add internal notes about this order..."
            rows={3}
          />
          <Button
            className="mt-3"
            size="sm"
            onClick={() => addNote({ variables: { id: order.id, notes: noteInput } })}
          >
            Save Note
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

const OrderCell = createCell({ QUERY, Loading, Empty, Failure, Success })

const AdminOrderDetailPage = ({ id }: { id: number }) => (
  <>
    <Metadata title={`Order #${id} - Admin`} />
    <Toaster />
    <div className="mb-6 flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={() => back()}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="font-heading text-2xl font-bold tracking-wider text-white">Order #{id}</h1>
    </div>
    <OrderCell id={id} />
  </>
)

export default AdminOrderDetailPage
