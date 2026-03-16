import { Link, routes } from '@cedarjs/router'
import { ShoppingBag } from 'lucide-react'

import { useCart } from 'src/components/CartProvider/CartProvider'

const CartIcon = () => {
  const { totalItems } = useCart()

  return (
    <Link to={routes.cart()} className="relative text-gray-300 transition-colors hover:text-gold">
      <ShoppingBag size={20} />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-racing-red text-[10px] font-bold text-white">
          {totalItems}
        </span>
      )}
    </Link>
  )
}

export default CartIcon
