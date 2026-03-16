import { navigate, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'
import type { CellSuccessProps, CellFailureProps } from '@cedarjs/web'
import { createCell } from '@cedarjs/web'
import { useMutation } from '@cedarjs/web'
import { toast, Toaster } from '@cedarjs/web/toast'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'

import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import { Card, CardContent } from 'src/components/ui/card'

const QUERY = gql`
  query AdminProductsQuery {
    adminProducts {
      id
      name
      slug
      price
      imageUrl
      category
      active
      createdAt
      variants {
        id
        options
        stock
      }
    }
  }
`

const DELETE_PRODUCT = gql`
  mutation AdminDeleteProduct($id: Int!) {
    adminDeleteProduct(id: $id) {
      id
    }
  }
`

const Loading = () => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-48 animate-pulse rounded-lg bg-white/5" />
    ))}
  </div>
)

const Empty = () => (
  <Card>
    <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
      <Package className="h-10 w-10 text-white/10" />
      <p className="text-white/40">No products yet.</p>
      <Button size="sm" onClick={() => navigate(routes.adminProductNew())}>
        <Plus className="mr-1 h-3 w-3" />
        Create your first product
      </Button>
    </CardContent>
  </Card>
)

const Failure = ({ error }: CellFailureProps) => (
  <div className="text-racing-red">Error: {error?.message}</div>
)

const Success = ({ adminProducts: products }: CellSuccessProps) => {
  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    onCompleted: () => toast.success('Product deleted'),
    refetchQueries: ['AdminProductsQuery'],
  })

  const handleDelete = (e: React.MouseEvent, id: number, name: string) => {
    e.stopPropagation()
    if (confirm(`Delete "${name}"?`)) {
      deleteProduct({ variables: { id } })
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const totalStock = product.variants.reduce((s, v) => s + v.stock, 0)
        const hasVariants = product.variants.length > 0

        return (
          <div
            key={product.id}
            onClick={() => navigate(routes.adminProductEdit({ id: product.id }))}
            className="group cursor-pointer overflow-hidden rounded-lg border border-white/5 bg-surface transition-colors hover:border-white/10 hover:bg-white/[0.04]"
          >
            {/* Image */}
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Badges overlay */}
              <div className="absolute bottom-2 left-2 flex gap-1.5">
                <Badge variant={product.active ? 'success' : 'secondary'} className="text-[10px]">
                  {product.active ? 'Active' : 'Inactive'}
                </Badge>
                {hasVariants && (
                  <Badge
                    variant={totalStock > 0 ? 'outline' : 'destructive'}
                    className="text-[10px]"
                  >
                    {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                  </Badge>
                )}
              </div>

              {/* Actions overlay */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 bg-black/60 backdrop-blur-sm hover:bg-black/80"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(routes.adminProductEdit({ id: product.id }))
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 bg-black/60 backdrop-blur-sm hover:bg-red-900/80"
                  onClick={(e) => handleDelete(e, product.id, product.name)}
                >
                  <Trash2 className="h-3 w-3 text-red-400" />
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-medium text-white">{product.name}</h3>
                  <p className="text-xs text-white/40">{product.category}</p>
                </div>
                <span className="flex-shrink-0 font-heading text-base font-bold text-white">
                  ${(product.price / 100).toFixed(2)}
                </span>
              </div>
              {hasVariants && (
                <div className="mt-2 text-xs text-white/30">
                  {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const ProductsCell = createCell({ QUERY, Loading, Empty, Failure, Success })

const AdminProductsPage = () => (
  <>
    <Metadata title="Products - Admin" />
    <Toaster />
    <div className="mb-6 flex items-center justify-between">
      <h1 className="font-heading text-2xl font-bold tracking-wider text-white">Products</h1>
      <Button onClick={() => navigate(routes.adminProductNew())}>
        <Plus className="mr-2 h-4 w-4" />
        New Product
      </Button>
    </div>
    <ProductsCell />
  </>
)

export default AdminProductsPage
