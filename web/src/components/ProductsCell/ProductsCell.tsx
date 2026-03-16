import type { ProductsQuery, ProductsQueryVariables } from 'types/graphql'
import type { CellSuccessProps, CellFailureProps } from '@cedarjs/web'

import ProductCard from 'src/components/ProductCard/ProductCard'

export const QUERY = gql`
  query ProductsQuery {
    products {
      id
      name
      price
      imageUrl
      category
      slug
    }
  }
`

const SkeletonCard = () => (
  <div className="overflow-hidden rounded-lg bg-surface">
    <div className="aspect-square w-full animate-pulse bg-white/5" />
    <div className="p-4">
      <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
      <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-white/10" />
      <div className="mt-3 h-5 w-20 animate-pulse rounded bg-white/10" />
    </div>
  </div>
)

export const Loading = () => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)

export const Empty = () => (
  <div className="py-12 text-center text-white/40">No products available yet.</div>
)

export const Failure = ({ error }: CellFailureProps<ProductsQueryVariables>) => (
  <div className="py-12 text-center text-racing-red">Error: {error?.message}</div>
)

export const Success = ({ products }: CellSuccessProps<ProductsQuery, ProductsQueryVariables>) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {products.map((product) => (
      <ProductCard
        key={product.id}
        id={product.id}
        name={product.name}
        price={product.price}
        imageUrl={product.imageUrl}
        category={product.category}
      />
    ))}
  </div>
)
