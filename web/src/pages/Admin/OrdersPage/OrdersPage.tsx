import { useState } from 'react'

import { Link, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'
import type { CellSuccessProps, CellFailureProps } from '@cedarjs/web'
import { createCell } from '@cedarjs/web'
import { ChevronRight, ShoppingCart, Search } from 'lucide-react'

import { Badge } from 'src/components/ui/badge'
import { Input } from 'src/components/ui/input'
import { Card, CardContent } from 'src/components/ui/card'

const QUERY = gql`
  query AdminOrdersQuery {
    adminOrders {
      id
      customerName
      customerEmail
      status
      totalAmount
      trackingNumber
      createdAt
      items {
        id
        quantity
        product {
          name
          imageUrl
        }
      }
    }
  }
`

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'destructive' | 'default' | 'secondary'; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  paid: { variant: 'success', label: 'Paid' },
  shipped: { variant: 'default', label: 'Shipped' },
  refunded: { variant: 'destructive', label: 'Refunded' },
  cancelled: { variant: 'destructive', label: 'Cancelled' },
}

const statuses = ['all', 'pending', 'paid', 'shipped', 'refunded', 'cancelled'] as const

const Loading = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-20 animate-pulse rounded-lg bg-white/5" />
    ))}
  </div>
)

const Empty = () => (
  <Card>
    <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
      <ShoppingCart className="h-10 w-10 text-white/10" />
      <p className="text-white/40">No orders yet.</p>
    </CardContent>
  </Card>
)

const Failure = ({ error }: CellFailureProps) => (
  <div className="text-racing-red">Error: {error?.message}</div>
)

const Success = ({ adminOrders: orders }: CellSuccessProps) => {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filtered = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const matches =
        String(order.id).includes(q) ||
        (order.customerName || '').toLowerCase().includes(q) ||
        (order.customerEmail || '').toLowerCase().includes(q)
      if (!matches) return false
    }
    return true
  })

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  return (
    <>
      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((s) => {
            const count = s === 'all' ? orders.length : (statusCounts[s] || 0)
            const active = statusFilter === s
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                }`}
              >
                {s === 'all' ? 'All' : s}
                <span className={`ml-1.5 ${active ? 'text-white/50' : 'text-white/20'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            placeholder="Search by name, email, or order #"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 sm:w-64"
          />
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-white/30">
          No orders match your filters.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => {
            const sc = statusConfig[order.status] || statusConfig.pending
            const thumbs = order.items.slice(0, 3).map((i) => i.product.imageUrl)
            const count = order.items.reduce((sum, i) => sum + i.quantity, 0)
            const displayName = order.customerName || order.customerEmail || 'Unknown'

            return (
              <Link
                key={order.id}
                to={routes.adminOrderDetail({ id: order.id })}
                className="group block"
              >
                <div className="flex items-center gap-4 rounded-lg border border-white/5 bg-surface px-4 py-3 transition-colors hover:border-white/10 hover:bg-white/[0.04]">
                  {/* Product thumbnails */}
                  <div className="hidden flex-shrink-0 sm:flex">
                    <div className="flex -space-x-2">
                      {thumbs.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt=""
                          className="h-10 w-10 rounded-lg border-2 border-surface object-cover"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Order info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-sm font-bold text-white">
                        #{order.id}
                      </span>
                      <span className="text-sm text-white/70">&mdash;</span>
                      <span className="truncate text-sm font-medium text-white">
                        {displayName}
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Badge variant={sc.variant} className="text-[10px]">{sc.label}</Badge>
                      {order.trackingNumber && (
                        <Badge variant="outline" className="text-[10px]">Tracked</Badge>
                      )}
                      <span className="text-xs text-white/30">
                        {count} item{count !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-white/30">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <span className="font-heading text-lg font-bold text-white">
                      ${(order.totalAmount / 100).toFixed(2)}
                    </span>
                  </div>

                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-white/20 transition-colors group-hover:text-white/50" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}

const OrdersCell = createCell({ QUERY, Loading, Empty, Failure, Success })

const AdminOrdersPage = () => (
  <>
    <Metadata title="Orders - Admin" />
    <h1 className="mb-6 font-heading text-2xl font-bold tracking-wider text-white">Orders</h1>
    <OrdersCell />
  </>
)

export default AdminOrdersPage
