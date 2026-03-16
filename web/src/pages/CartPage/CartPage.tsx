import { useState, useEffect } from 'react'

import { Link, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'
import { useMutation, useQuery } from '@cedarjs/web'
import { Trash2, Minus, Plus, Truck } from 'lucide-react'

import SectionHeading from 'src/components/SectionHeading/SectionHeading'
import { useCart } from 'src/components/CartProvider/CartProvider'

const CREATE_CHECKOUT_SESSION = gql`
  mutation CreateCheckoutSessionMutation($input: CheckoutInput!) {
    createCheckoutSession(input: $input) {
      url
    }
  }
`

const CALCULATE_SHIPPING = gql`
  query CalculateShipping($country: String!, $items: [ShippingItemInput!]!) {
    calculateShipping(country: $country, items: $items) {
      baseRate
      surcharges
      total
      isInternational
    }
  }
`

const COUNTRIES = [
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'JP', name: 'Japan' },
  { code: 'DE', name: 'Germany' },
  { code: 'SG', name: 'Singapore' },
]

const inputClass =
  'w-full rounded border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-racing-red focus:outline-none'

const CartPage = () => {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()
  const [address, setAddress] = useState({
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'AU',
  })

  const shippingItems = items.map((i) => ({ productId: i.id, quantity: i.quantity }))

  const { data: shippingData, loading: shippingLoading } = useQuery(CALCULATE_SHIPPING, {
    variables: { country: address.country, items: shippingItems },
    skip: items.length === 0,
  })

  const shippingTotal = shippingData?.calculateShipping?.total || 0
  const grandTotal = totalPrice + shippingTotal

  const [checkout, { loading }] = useMutation(CREATE_CHECKOUT_SESSION, {
    onCompleted: (data) => {
      window.location.href = data.createCheckoutSession.url
    },
  })

  const handleCheckout = () => {
    if (!address.name || !address.line1 || !address.city || !address.state || !address.postalCode) {
      alert('Please fill in all required shipping fields.')
      return
    }
    checkout({
      variables: {
        input: {
          items: items.map((i) => ({
            productId: i.id,
            quantity: i.quantity,
            size: i.size,
          })),
          shippingAddress: {
            name: address.name,
            line1: address.line1,
            line2: address.line2 || undefined,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          },
        },
      },
    })
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAddress((prev) => ({ ...prev, [field]: e.target.value }))

  if (items.length === 0) {
    return (
      <>
        <Metadata title="Cart" />
        <section className="mx-auto max-w-3xl px-4 py-16 text-center">
          <SectionHeading title="YOUR CART" />
          <p className="text-white/50">Your cart is empty.</p>
          <Link
            to={routes.shop()}
            className="mt-6 inline-block rounded bg-racing-red px-8 py-3 font-heading text-sm tracking-wider text-white transition-colors hover:bg-red-700"
          >
            BROWSE SHOP
          </Link>
        </section>
      </>
    )
  }

  return (
    <>
      <Metadata title="Cart" description="Your shopping cart" />
      <section className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <SectionHeading title="YOUR CART" />

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left: Items + Shipping Address */}
          <div className="space-y-6">
            {/* Cart items */}
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className="rounded-lg bg-surface p-4"
                >
                  <div className="flex items-start gap-3 md:items-center md:gap-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-16 w-16 flex-shrink-0 rounded object-cover md:h-20 md:w-20"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-heading text-sm text-white">{item.name}</h3>
                      {item.size && (
                        <p className="text-xs text-white/40">Size: {item.size}</p>
                      )}
                      <p className="mt-1 font-bold text-white">${(item.price / 100).toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id, item.size)}
                      className="flex-shrink-0 text-white/30 hover:text-racing-red"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 md:ml-20 md:mt-0 md:border-0 md:pt-0">
                    <div className="flex items-center rounded border border-white/10">
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        className="px-3 py-1.5 text-white/50 hover:text-white"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="px-3 py-1.5 text-white/50 hover:text-white"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-heading text-sm text-white/70">
                      ${((item.price * item.quantity) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping address */}
            <div className="rounded-lg border border-white/5 bg-surface p-4 md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Truck className="h-4 w-4 text-white/40" />
                <h3 className="font-heading text-sm font-bold tracking-wider text-white">
                  SHIPPING ADDRESS
                </h3>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs text-white/40">Full Name *</label>
                  <input className={inputClass} value={address.name} onChange={set('name')} placeholder="John Smith" required />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs text-white/40">Address Line 1 *</label>
                  <input className={inputClass} value={address.line1} onChange={set('line1')} placeholder="123 Main St" required />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs text-white/40">Address Line 2</label>
                  <input className={inputClass} value={address.line2} onChange={set('line2')} placeholder="Apt, unit, etc." />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/40">City *</label>
                  <input className={inputClass} value={address.city} onChange={set('city')} placeholder="Melbourne" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/40">State *</label>
                  <input className={inputClass} value={address.state} onChange={set('state')} placeholder="VIC" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/40">Postcode *</label>
                  <input className={inputClass} value={address.postalCode} onChange={set('postalCode')} placeholder="3000" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/40">Country *</label>
                  <select className={`${inputClass} [&>option]:bg-[#1a1a1a] [&>option]:text-white`} value={address.country} onChange={set('country')}>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-[#1a1a1a] text-white">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div>
            <div className="sticky top-24 rounded-lg border border-white/5 bg-surface p-4 md:p-6">
              <h3 className="font-heading text-sm font-bold tracking-wider text-white">
                ORDER SUMMARY
              </h3>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Subtotal</span>
                  <span className="text-white">${(totalPrice / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">
                    Shipping {shippingData?.calculateShipping?.isInternational ? '(Intl)' : '(AU)'}
                  </span>
                  <span className="text-white">
                    {shippingLoading ? '...' : `$${(shippingTotal / 100).toFixed(2)}`}
                  </span>
                </div>
                {shippingData?.calculateShipping?.surcharges > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/30">Includes item surcharges</span>
                    <span className="text-white/30">
                      +${(shippingData.calculateShipping.surcharges / 100).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2">
                  <div className="flex justify-between">
                    <span className="font-heading text-base font-bold text-white">Total</span>
                    <span className="font-heading text-xl font-bold text-white">
                      ${(grandTotal / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="mt-6 w-full rounded bg-racing-red px-8 py-3 font-heading text-sm tracking-wider text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'PROCESSING...' : 'CHECKOUT'}
              </button>

              <p className="mt-3 text-center text-xs text-white/20">
                You&apos;ll be redirected to Stripe for payment
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default CartPage
