import { Metadata } from '@cedarjs/web'

import SectionHeading from 'src/components/SectionHeading/SectionHeading'
import GalleryGrid from 'src/components/GalleryGrid/GalleryGrid'

const GalleryPage = () => {
  return (
    <>
      <Metadata title="Gallery" description="Photos and videos of Kaidon Brown Racing" />

      <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <SectionHeading title="GALLERY" subtitle="Photos and videos from the track" />
        <GalleryGrid />
      </section>
    </>
  )
}

export default GalleryPage
