import { useState } from 'react'

import type { FindProductQuery, FindProductQueryVariables } from 'types/graphql'
import type { CellSuccessProps, CellFailureProps } from '@cedarjs/web'
import { toast, Toaster } from '@cedarjs/web/toast'

import { useCart } from 'src/components/CartProvider/CartProvider'

export const QUERY = gql`
  query FindProductQuery($id: Int!) {
    product(id: $id) {
      id
      name
      slug
      description
      price
      imageUrl
      category
      attributes {
        id
        name
        values
        position
      }
      variants {
        id
        options
        sku
        price
        stock
      }
    }
  }
`

export const Loading = () => (
  <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      <div className="aspect-square w-full animate-pulse rounded-lg bg-white/5" />
      <div className="flex flex-col justify-center">
        <div className="h-3 w-20 animate-pulse rounded bg-white/5" />
        <div className="mt-3 h-8 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="mt-3 h-6 w-24 animate-pulse rounded bg-white/10" />
        <div className="mt-6 h-4 w-full animate-pulse rounded bg-white/5" />
        <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-white/5" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-white/5" />
        <div className="mt-8 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-12 animate-pulse rounded bg-white/5" />
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <div className="h-12 w-28 animate-pulse rounded bg-white/5" />
          <div className="h-12 flex-1 animate-pulse rounded bg-white/10" />
        </div>
      </div>
    </div>
  </div>
)

export const Empty = () => (
  <div className="py-12 text-center text-white/40">Product not found.</div>
)

export const Failure = ({ error }: CellFailureProps<FindProductQueryVariables>) => (
  <div className="py-12 text-center text-racing-red">Error: {error?.message}</div>
)

export const Success = ({ product }: CellSuccessProps<FindProductQuery, FindProductQueryVariables>) => {
  const { addItem } = useCart()
  const attrs = (product.attributes || []).map((a) => ({
    ...a,
    parsedValues: JSON.parse(a.values) as string[],
  }))
  const parsedVariants = (product.variants || []).map((v) => ({
    ...v,
    parsedOptions: JSON.parse(v.options) as Record<string, string>,
  }))
  const hasVariants = parsedVariants.length > 0

  // Track selected value per attribute
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    if (!hasVariants || attrs.length === 0) return {}
    // Default to first variant's options
    return parsedVariants[0]?.parsedOptions || {}
  })
  const [qty, setQty] = useState(1)

  // Find matching variant for current selections
  const selectedVariant = parsedVariants.find((v) =>
    Object.entries(selections).every(([key, val]) => v.parsedOptions[key] === val)
  )

  const displayPrice = selectedVariant?.price || product.price
  const inStock = hasVariants ? (selectedVariant?.stock ?? 0) > 0 : true
  const maxQty = hasVariants ? (selectedVariant?.stock ?? 1) : 99

  const handleSelect = (attrName: string, value: string) => {
    setSelections((prev) => ({ ...prev, [attrName]: value }))
    setQty(1)
  }

  // Check if a specific option value is available (has any variant in stock with that value)
  const isOptionAvailable = (attrName: string, value: string) => {
    return parsedVariants.some(
      (v) => v.parsedOptions[attrName] === value && v.stock > 0
    )
  }

  const handleAdd = () => {
    if (hasVariants && !inStock) return
    const sizeLabel = Object.values(selections).join(' / ')
    addItem(
      {
        id: product.id,
        name: product.name,
        price: displayPrice,
        imageUrl: product.imageUrl,
        size: sizeLabel || undefined,
      },
      qty
    )
    toast.success('Added to cart')
  }

  return (
    <>
      <Toaster />
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <div className="overflow-hidden rounded-lg">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-xs tracking-wider text-gold uppercase">{product.category}</span>
            <h1 className="mt-2 font-heading text-2xl text-white md:text-3xl">{product.name}</h1>
            <p className="mt-2 text-xl font-bold text-white md:text-2xl">${(displayPrice / 100).toFixed(2)}</p>
            <p className="mt-4 text-sm text-white/50 md:text-base">{product.description}</p>

            {attrs.map((attr) => (
              <div key={attr.id} className="mt-6">
                <label className="mb-2 block text-sm text-white/60">{attr.name}</label>
                <div className="flex flex-wrap gap-2">
                  {attr.parsedValues.map((val) => {
                    const selected = selections[attr.name] === val
                    const available = isOptionAvailable(attr.name, val)
                    return (
                      <button
                        key={val}
                        onClick={() => handleSelect(attr.name, val)}
                        disabled={!available}
                        className={`rounded border px-3 py-2 text-sm transition-colors md:px-4 ${
                          selected
                            ? 'border-gold bg-gold text-black'
                            : !available
                              ? 'cursor-not-allowed border-white/10 text-white/20 line-through'
                              : 'border-white/20 text-white/60 hover:border-gold'
                        }`}
                      >
                        {val}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {hasVariants && selectedVariant && selectedVariant.stock <= 3 && selectedVariant.stock > 0 && (
              <p className="mt-2 text-xs text-gold">Only {selectedVariant.stock} left</p>
            )}

            <div className="mt-6 flex items-center gap-3 md:gap-4">
              <div className="flex items-center rounded border border-white/20">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2 text-white/50 hover:text-white"
                >
                  -
                </button>
                <span className="px-3 py-2 text-sm text-white">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(maxQty, qty + 1))}
                  className="px-3 py-2 text-white/50 hover:text-white"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={hasVariants && !inStock}
                className="flex-1 rounded bg-racing-red px-6 py-3 font-heading text-sm tracking-wider text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {hasVariants && !inStock ? 'OUT OF STOCK' : 'ADD TO CART'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
