import { useState } from 'react'

import { navigate, routes, back } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'
import type { CellSuccessProps, CellFailureProps } from '@cedarjs/web'
import { createCell } from '@cedarjs/web'
import { useMutation } from '@cedarjs/web'
import { toast, Toaster } from '@cedarjs/web/toast'
import { ArrowLeft, Plus, Trash2, X, Layers, Package } from 'lucide-react'

import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Textarea } from 'src/components/ui/textarea'
import { Label } from 'src/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'src/components/ui/card'
import { Badge } from 'src/components/ui/badge'
import ImageUpload from 'src/components/ImageUpload/ImageUpload'
import MultiImageUpload, { type ProductImageItem } from 'src/components/MultiImageUpload/MultiImageUpload'

const QUERY = gql`
  query AdminProductEditQuery($id: Int!) {
    adminProduct(id: $id) {
      id
      name
      slug
      description
      price
      imageUrl
      category
      shippingSurcharge
      active
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
      images {
        id
        url
        position
        attributeValue
      }
    }
  }
`

const UPDATE_PRODUCT = gql`
  mutation AdminUpdateProductMutation($id: Int!, $input: UpdateProductInput!) {
    adminUpdateProduct(id: $id, input: $input) { id }
  }
`

interface Attribute {
  key: string
  name: string
  values: string[]
}

interface VariantRow {
  key: string
  dbId?: number
  options: Record<string, string>
  sku: string
  price: string
  stock: string
}

const generateVariants = (attributes: Attribute[], existing: VariantRow[]): VariantRow[] => {
  const withValues = attributes.filter((a) => a.name && a.values.length > 0)
  if (withValues.length === 0) return []

  const combos: Record<string, string>[] = [{}]
  for (const attr of withValues) {
    const newCombos: Record<string, string>[] = []
    for (const combo of combos) {
      for (const val of attr.values) {
        newCombos.push({ ...combo, [attr.name]: val })
      }
    }
    combos.length = 0
    combos.push(...newCombos)
  }

  return combos.map((options) => {
    const label = JSON.stringify(options)
    const match = existing.find((v) => JSON.stringify(v.options) === label)
    return match
      ? { ...match, key: match.key }
      : { key: crypto.randomUUID(), options, sku: '', price: '', stock: '0' }
  })
}

const Loading = () => (
  <Card><CardContent className="p-6"><div className="h-64 animate-pulse rounded bg-white/5" /></CardContent></Card>
)
const Empty = () => <div className="text-white/40">Product not found.</div>
const Failure = ({ error }: CellFailureProps) => <div className="text-racing-red">Error: {error?.message}</div>

const Success = ({ adminProduct: product }: CellSuccessProps) => {
  const [form, setForm] = useState({
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: String(product.price / 100),
    imageUrl: product.imageUrl,
    category: product.category,
    shippingSurcharge: product.shippingSurcharge ? String(product.shippingSurcharge / 100) : '',
    active: product.active,
  })

  const [attributes, setAttributes] = useState<Attribute[]>(
    product.attributes.map((a) => ({
      key: crypto.randomUUID(),
      name: a.name,
      values: JSON.parse(a.values),
    }))
  )

  const [variants, setVariants] = useState<VariantRow[]>(
    product.variants.map((v) => ({
      key: crypto.randomUUID(),
      dbId: v.id,
      options: JSON.parse(v.options),
      sku: v.sku || '',
      price: v.price ? String(v.price / 100) : '',
      stock: String(v.stock),
    }))
  )

  const [productImages, setProductImages] = useState<ProductImageItem[]>(
    (product.images || []).map((img) => ({
      key: crypto.randomUUID(),
      url: img.url,
      position: img.position,
      attributeValue: img.attributeValue || '',
    }))
  )

  const [newValue, setNewValue] = useState<Record<string, string>>({})

  const [update, { loading }] = useMutation(UPDATE_PRODUCT, {
    onCompleted: () => {
      toast.success('Product updated')
      navigate(routes.adminProducts())
    },
    onError: (err) => toast.error(err.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    update({
      variables: {
        id: product.id,
        input: {
          name: form.name,
          slug: form.slug,
          description: form.description,
          price: Math.round(parseFloat(form.price) * 100),
          imageUrl: form.imageUrl,
          category: form.category,
          shippingSurcharge: form.shippingSurcharge ? Math.round(parseFloat(form.shippingSurcharge) * 100) : 0,
          active: form.active,
          sizes: JSON.stringify(
            attributes.length === 1
              ? attributes[0].values
              : variants.map((v) => Object.values(v.options).join(' / '))
          ),
          attributes: attributes.filter((a) => a.name && a.values.length).map((a, i) => ({
            name: a.name,
            values: JSON.stringify(a.values),
            position: i,
          })),
          variants: variants.filter((v) => Object.keys(v.options).length).map((v) => ({
            id: v.dbId || undefined,
            options: JSON.stringify(v.options),
            sku: v.sku || null,
            price: v.price ? Math.round(parseFloat(v.price) * 100) : null,
            stock: parseInt(v.stock) || 0,
          })),
          images: productImages.map((img, i) => ({
            url: img.url,
            position: i,
            attributeValue: img.attributeValue || null,
          })),
        },
      },
    })
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const addAttribute = () => {
    setAttributes((prev) => [...prev, { key: crypto.randomUUID(), name: '', values: [] }])
  }

  const updateAttributeName = (key: string, name: string) => {
    setAttributes((prev) => prev.map((a) => (a.key === key ? { ...a, name } : a)))
  }

  const addValueToAttribute = (key: string) => {
    const val = (newValue[key] || '').trim()
    if (!val) return
    setAttributes((prev) =>
      prev.map((a) =>
        a.key === key && !a.values.includes(val) ? { ...a, values: [...a.values, val] } : a
      )
    )
    setNewValue((prev) => ({ ...prev, [key]: '' }))
  }

  const removeValueFromAttribute = (key: string, value: string) => {
    setAttributes((prev) =>
      prev.map((a) => (a.key === key ? { ...a, values: a.values.filter((v) => v !== value) } : a))
    )
  }

  const removeAttribute = (key: string) => {
    setAttributes((prev) => prev.filter((a) => a.key !== key))
    setVariants([])
  }

  const handleGenerateVariants = () => {
    setVariants(generateVariants(attributes, variants))
  }

  const updateVariant = (key: string, field: 'sku' | 'price' | 'stock', value: string) => {
    setVariants((prev) => prev.map((v) => (v.key === key ? { ...v, [field]: value } : v)))
  }

  const totalStock = variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Product Details</CardTitle>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                className="h-4 w-4 rounded"
                id="active"
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={set('name')} className="mt-1" />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={set('slug')} className="mt-1" />
            </div>
            <div>
              <Label>Base Price (AUD)</Label>
              <Input type="number" step="0.01" value={form.price} onChange={set('price')} className="mt-1" />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={form.category} onChange={set('category')} className="mt-1" />
            </div>
            <div>
              <Label>Shipping Surcharge (AUD) <span className="text-white/30">extra per item</span></Label>
              <Input type="number" step="0.01" value={form.shippingSurcharge} onChange={set('shippingSurcharge')} className="mt-1" placeholder="0.00" />
            </div>
            <div className="md:col-span-2">
              <Label>Main Product Image</Label>
              <ImageUpload value={form.imageUrl} onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))} />
            </div>
            <div className="md:col-span-2">
              <Label>Additional Images</Label>
              <MultiImageUpload
                images={productImages}
                onChange={setProductImages}
                attributeValues={attributes.flatMap((a) => a.values)}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={set('description')} className="mt-1" rows={4} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attributes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-white/40" />
            Attributes
          </CardTitle>
          <CardDescription>Define options like Size, Colour, etc.</CardDescription>
        </CardHeader>
        <CardContent>
          {attributes.length > 0 && (
            <div className="mb-4 space-y-4">
              {attributes.map((attr) => (
                <div key={attr.key} className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-3">
                    <Input
                      placeholder="Attribute name (e.g. Size)"
                      value={attr.name}
                      onChange={(e) => updateAttributeName(attr.key, e.target.value)}
                      className="max-w-[200px]"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeAttribute(attr.key)}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>

                  {attr.values.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {attr.values.map((val) => (
                        <Badge key={val} variant="secondary" className="gap-1 pr-1">
                          {val}
                          <button
                            type="button"
                            onClick={() => removeValueFromAttribute(attr.key, val)}
                            className="ml-1 rounded-full p-0.5 hover:bg-white/10"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <Input
                      placeholder="Add value (e.g. S, M, L)"
                      value={newValue[attr.key] || ''}
                      onChange={(e) => setNewValue((prev) => ({ ...prev, [attr.key]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addValueToAttribute(attr.key)
                        }
                      }}
                      className="max-w-[200px]"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => addValueToAttribute(attr.key)}>
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
              <Plus className="mr-1 h-3 w-3" />
              Add Attribute
            </Button>
            {attributes.some((a) => a.values.length > 0) && (
              <Button type="button" size="sm" onClick={handleGenerateVariants}>
                {variants.length > 0 ? 'Regenerate Variants' : 'Generate Variants'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Variants / Inventory */}
      {variants.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-white/40" />
                  Variants & Inventory
                </CardTitle>
                <CardDescription>{variants.length} variant{variants.length !== 1 ? 's' : ''}</CardDescription>
              </div>
              <Badge variant={totalStock > 0 ? 'success' : 'destructive'}>
                {totalStock} total stock
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="hidden grid-cols-[1fr_120px_120px_100px] gap-3 px-1 text-xs text-white/30 md:grid">
                <span>Variant</span>
                <span>SKU</span>
                <span>Price Override</span>
                <span>Stock</span>
              </div>

              {variants.map((v) => (
                <div
                  key={v.key}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 md:grid-cols-[1fr_120px_120px_100px] md:items-center md:border-0 md:bg-transparent md:p-1"
                >
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(v.options).map(([attr, val]) => (
                      <Badge key={attr} variant="outline" className="text-xs">
                        {attr}: {val}
                      </Badge>
                    ))}
                  </div>
                  <div>
                    <span className="mb-1 block text-xs text-white/30 md:hidden">SKU</span>
                    <Input
                      placeholder="Optional"
                      value={v.sku}
                      onChange={(e) => updateVariant(v.key, 'sku', e.target.value)}
                    />
                  </div>
                  <div>
                    <span className="mb-1 block text-xs text-white/30 md:hidden">Price Override</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Base"
                      value={v.price}
                      onChange={(e) => updateVariant(v.key, 'price', e.target.value)}
                    />
                  </div>
                  <div>
                    <span className="mb-1 block text-xs text-white/30 md:hidden">Stock</span>
                    <Input
                      type="number"
                      value={v.stock}
                      onChange={(e) => updateVariant(v.key, 'stock', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => back()}>Cancel</Button>
      </div>
    </form>
  )
}

const ProductEditCell = createCell({ QUERY, Loading, Empty, Failure, Success })

const AdminProductEditPage = ({ id }: { id: number }) => (
  <>
    <Metadata title="Edit Product - Admin" />
    <Toaster />
    <div className="mb-6 flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={() => back()}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="font-heading text-2xl font-bold tracking-wider text-white">Edit Product</h1>
    </div>
    <ProductEditCell id={id} />
  </>
)

export default AdminProductEditPage
