import { Metadata } from '@cedarjs/web'
import type { CellSuccessProps, CellFailureProps } from '@cedarjs/web'
import { DollarSign, ShoppingCart, Package, Mail } from 'lucide-react'

import { Card, CardHeader, CardTitle, CardContent } from 'src/components/ui/card'
import { Badge } from 'src/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'src/components/ui/table'

const QUERY = gql`
  query AdminStatsQuery {
    adminStats {
      totalOrders
      totalRevenue
      totalProducts
      totalMessages
      recentOrders {
        id
        customerEmail
        status
        totalAmount
        createdAt
      }
    }
  }
`

const statusVariant = (status: string) => {
  switch (status) {
    case 'paid': return 'success' as const
    case 'pending': return 'warning' as const
    case 'cancelled': return 'destructive' as const
    default: return 'secondary' as const
  }
}

const Loading = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i}><CardContent className="p-6"><div className="h-16 animate-pulse rounded bg-white/5" /></CardContent></Card>
    ))}
  </div>
)

const Failure = ({ error }: CellFailureProps) => (
  <div className="text-racing-red">Error: {error?.message}</div>
)

const Success = ({ adminStats: stats }: CellSuccessProps) => (
  <>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[
        { label: 'Total Revenue', value: `$${(stats.totalRevenue / 100).toFixed(2)}`, icon: DollarSign },
        { label: 'Orders', value: stats.totalOrders, icon: ShoppingCart },
        { label: 'Products', value: stats.totalProducts, icon: Package },
        { label: 'Messages', value: stats.totalMessages, icon: Mail },
      ].map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 uppercase">{stat.label}</p>
                <p className="mt-1 font-heading text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <stat.icon className="h-8 w-8 text-white/10" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {stats.recentOrders.length === 0 ? (
          <p className="py-4 text-sm text-white/40">No orders yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-white">#{order.id}</TableCell>
                  <TableCell>{order.customerEmail || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">${(order.totalAmount / 100).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  </>
)

const AdminDashboardPage = () => {
  return (
    <>
      <Metadata title="Admin Dashboard" />
      <h1 className="mb-6 font-heading text-2xl font-bold tracking-wider text-white">Dashboard</h1>
      <AdminDashboardCell />
    </>
  )
}

// Inline cell
import { createCell } from '@cedarjs/web'
const AdminDashboardCell = createCell({ QUERY, Loading, Failure, Success })

export default AdminDashboardPage
