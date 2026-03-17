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
  CreditCard,
  MapPin,
  Clock,
  User,
  Hash,
  AlertTriangle,
  RotateCcw,
  StickyNote,
} from 'lucide-react'

import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Textarea } from 'src/components/ui/textarea'
import { Label } from 'src/components/ui/label'
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
  mutation AdminRefundOrder($id: Int!) {
    adminRefundOrder(id: $id) { success message }
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

  const refetchConfig = {
    refetchQueries: ['AdminOrderDetailQuery'],
    onError: (err: Error) => toast.error(err.message),
  }

  const [updateStatus] = useMutation(UPDATE_STATUS, {
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

  return (
    <div className="space-y-6">
      {/* Order header banner */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-heading text-xl font-bold text-white">Order #{order.id}</h2>
                <Badge variant={sc.variant}>{sc.label}</Badge>
                {order.refundedAt && (
                  <Badge variant="destructive">Refunded {new Date(order.refundedAt).toLocaleDateString()}</Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-white/40">
                Placed {new Date(order.createdAt).toLocaleString()} &middot; Updated {new Date(order.updatedAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/40">Order Total</p>
              <p className="font-heading text-3xl font-bold text-white">${(order.totalAmount / 100).toFixed(2)}</p>
              <p className="text-sm text-white/40">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer & Shipping */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-white/40" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
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
                <dd className="mt-0.5 max-w-full truncate font-mono text-xs text-white/30">{order.stripeSessionId}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-white/40" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {address ? (
              <div className="text-sm text-white/70">
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>{address.city}, {address.state} {address.postal_code}</p>
                <p>{address.country}</p>
              </div>
            ) : (
              <p className="text-sm text-white/30">No shipping address provided</p>
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-white/40" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-4 w-4 text-white/40" />
            Items
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{item.product.name}</p>
                  <div className="mt-0.5 flex gap-3 text-xs text-white/40">
                    <span>{item.product.category}</span>
                    {item.size && <span>Size: {item.size}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/40">x{item.quantity}</p>
                  <p className="font-medium text-white">${(item.price * item.quantity / 100).toFixed(2)}</p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-white/30">${(item.price / 100).toFixed(2)} each</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 px-6 py-4">
            <div className="flex justify-between">
              <span className="font-medium text-white/50">Total</span>
              <span className="font-heading text-lg font-bold text-white">${(order.totalAmount / 100).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ship order */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-white/40" />
              Ship Order
            </CardTitle>
            <CardDescription>Enter a tracking number to mark as shipped</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="e.g. AP123456789AU"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  disabled={order.status === 'refunded' || order.status === 'cancelled'}
                />
              </div>
              <Button
                onClick={handleShip}
                disabled={shipping || order.status === 'refunded' || order.status === 'cancelled'}
              >
                {shipping ? 'Shipping...' : order.trackingNumber ? 'Update' : 'Mark Shipped'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Refund */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-white/40" />
              Refund
            </CardTitle>
            <CardDescription>Issue a full refund via Stripe</CardDescription>
          </CardHeader>
          <CardContent>
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
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => refundOrder({ variables: { id: order.id } })}
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

      {/* Notes + Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-white/40" />
              Internal Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-white/40" />
              Update Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.status === 'refunded' ? (
              <p className="text-sm text-white/40">Status is locked — order has been refunded.</p>
            ) : (
              <div className="space-y-1">
                {[
                  { value: 'pending', label: 'Pending', desc: 'Awaiting payment', dot: 'bg-yellow-500' },
                  { value: 'paid', label: 'Paid', desc: 'Payment received', dot: 'bg-green-500' },
                  { value: 'shipped', label: 'Shipped', desc: 'Dispatched to customer', dot: 'bg-blue-500' },
                  { value: 'cancelled', label: 'Cancelled', desc: 'Order cancelled', dot: 'bg-red-500' },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => updateStatus({ variables: { id: order.id, status: s.value } })}
                    className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-left text-sm transition-colors ${
                      order.status === s.value
                        ? 'bg-white/10 text-white'
                        : 'text-white/50 hover:bg-white/5 hover:text-white/70'
                    }`}
                  >
                    <div className={`h-2 w-2 flex-shrink-0 rounded-full ${s.dot}`} />
                    <div className="flex-1">
                      <span className="font-medium">{s.label}</span>
                      <span className="ml-2 text-xs text-white/30">{s.desc}</span>
                    </div>
                    {order.status === s.value && (
                      <span className="text-xs text-white/30">Current</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
