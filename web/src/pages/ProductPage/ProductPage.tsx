import { Metadata } from '@cedarjs/web'

import ProductCell from 'src/components/ProductCell'

interface ProductPageProps {
  id: number
}

const ProductPage = ({ id }: ProductPageProps) => {
  return (
    <>
      <Metadata title="Product" description="Kaidon Brown Racing product" />
      <ProductCell id={id} />
    </>
  )
}

export default ProductPage
