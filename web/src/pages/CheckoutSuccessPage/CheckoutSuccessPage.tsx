import { useEffect } from 'react'

import { Link, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'
import { CheckCircle } from 'lucide-react'

import { useCart } from 'src/components/CartProvider/CartProvider'

const CheckoutSuccessPage = () => {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Metadata title="Order Confirmed" />
      <section className="mx-auto max-w-lg px-4 py-16 text-center md:py-24">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 md:h-16 md:w-16" />
        <h1 className="mt-6 font-heading text-2xl text-white md:text-3xl">ORDER CONFIRMED</h1>
        <p className="mt-4 text-sm text-white/50 md:text-base">
          Thanks for your purchase! You&apos;ll receive a confirmation email shortly.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Link
            to={routes.shop()}
            className="rounded border border-white/20 px-6 py-3 font-heading text-sm tracking-wider text-white/60 transition-colors hover:border-gold hover:text-gold md:px-8"
          >
            CONTINUE SHOPPING
          </Link>
          <Link
            to={routes.home()}
            className="rounded bg-racing-red px-6 py-3 font-heading text-sm tracking-wider text-white transition-colors hover:bg-red-700 md:px-8"
          >
            BACK TO HOME
          </Link>
        </div>
      </section>
    </>
  )
}

export default CheckoutSuccessPage
