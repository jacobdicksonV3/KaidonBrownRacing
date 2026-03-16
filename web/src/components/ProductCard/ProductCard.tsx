import { Link, routes } from '@cedarjs/router'

interface ProductCardProps {
  id: number
  name: string
  price: number
  imageUrl: string
  category: string
}

const ProductCard = ({ id, name, price, imageUrl, category }: ProductCardProps) => (
  <Link
    to={routes.product({ id })}
    className="group overflow-hidden rounded-lg bg-surface transition-transform hover:-translate-y-1"
  >
    <div className="overflow-hidden">
      <img
        src={imageUrl}
        alt={name}
        className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
    </div>
    <div className="p-4">
      <span className="text-xs tracking-wider text-gold uppercase">{category}</span>
      <h3 className="mt-1 font-heading text-sm text-white">{name}</h3>
      <p className="mt-2 text-lg font-bold text-white">${(price / 100).toFixed(2)}</p>
    </div>
  </Link>
)

export default ProductCard
