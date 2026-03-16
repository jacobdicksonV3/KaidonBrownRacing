import { useState } from 'react'

const carImages = Array.from({ length: 7 }, (_, i) => ({
  src: `/images/cars/car-${i + 1}.webp`,
  alt: `Kaidon Brown speedcar photo ${i + 1}`,
  category: 'cars',
}))

const driverImages = Array.from({ length: 6 }, (_, i) => ({
  src: `/images/driver/driver-${i + 1}.webp`,
  alt: `Kaidon Brown driver photo ${i + 1}`,
  category: 'driver',
}))

const videos = Array.from({ length: 5 }, (_, i) => ({
  src: `/videos/video-${i + 1}.mp4`,
  category: 'videos',
}))

type Tab = 'all' | 'cars' | 'driver' | 'videos'

const GalleryGrid = () => {
  const [tab, setTab] = useState<Tab>('all')

  const allImages = [...carImages, ...driverImages]
  const filteredImages = tab === 'all' || tab === 'videos'
    ? allImages
    : allImages.filter((img) => img.category === tab)

  const showVideos = tab === 'all' || tab === 'videos'

  const tabs: { label: string; value: Tab }[] = [
    { label: 'All', value: 'all' },
    { label: 'Cars', value: 'cars' },
    { label: 'Driver', value: 'driver' },
    { label: 'Videos', value: 'videos' },
  ]

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-center gap-2 md:mb-8">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`rounded px-3 py-2 font-heading text-xs tracking-wider transition-colors md:px-4 ${
              tab === t.value
                ? 'bg-racing-red text-white'
                : 'bg-surface text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab !== 'videos' && (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
          {filteredImages.map((img) => (
            <div key={img.src} className="group overflow-hidden rounded-lg">
              <img
                src={img.src}
                alt={img.alt}
                className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {showVideos && (
        <div className={tab !== 'videos' ? 'mt-6 md:mt-8' : ''}>
          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            {videos.map((video) => (
              <div key={video.src} className="overflow-hidden rounded-lg">
                <video
                  src={video.src}
                  controls
                  preload="metadata"
                  className="aspect-video w-full bg-black"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryGrid
