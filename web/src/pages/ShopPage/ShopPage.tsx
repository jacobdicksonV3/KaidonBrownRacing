import { Metadata } from '@cedarjs/web'

import SectionHeading from 'src/components/SectionHeading/SectionHeading'
import ProductsCell from 'src/components/ProductsCell'

const ShopPage = () => {
  return (
    <>
      <Metadata title="Shop" description="Official Kaidon Brown Racing merchandise" />

      <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <SectionHeading title="OFFICIAL MERCH" subtitle="Rep the 3x Australian Speedcar Champion" />
        <ProductsCell />
      </section>
    </>
  )
}

export default ShopPage
