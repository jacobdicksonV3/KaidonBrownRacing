import { useEffect, useRef, useState } from 'react'

import { Link, routes } from '@cedarjs/router'
import { ChevronDown } from 'lucide-react'

const HeroSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.playbackRate = 0.8
      video.addEventListener('canplay', () => setLoaded(true), { once: true })
    }
  }, [])

  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden">
      {/* Video background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      >
        <source src="/videos/video-1.mp4" type="video/mp4" />
      </video>

      {/* Dark overlays */}
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-darker via-transparent to-darker" />

      {/* Red accent lines */}
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-racing-red via-gold to-racing-red" />
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-racing-red via-gold to-racing-red" />

      {/* Content */}
      <div className="relative z-10 px-4 text-center">
        <p className="animate-fade-in-up font-heading text-sm tracking-[0.4em] text-gold md:text-lg">
          3X AUSTRALIAN SPEEDCAR CHAMPION
        </p>

        <h1 className="animate-fade-in-up-delay-1 mt-6 font-heading text-6xl leading-none tracking-wider text-white md:text-9xl">
          KAIDON
          <br />
          <span className="text-racing-red drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]">
            BROWN
          </span>
        </h1>

        <div className="animate-fade-in-up-delay-2 mx-auto mt-6 flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-gold md:w-20" />
          <p className="font-heading text-sm tracking-[0.2em] text-white/80 md:text-base">
            2018 &bull; 2025 &bull; 2026
          </p>
          <div className="h-px w-12 bg-gold md:w-20" />
        </div>

        <div className="animate-fade-in-up-delay-3 mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to={routes.about()}
            className="animate-pulse-glow rounded-sm bg-racing-red px-10 py-4 font-heading text-sm tracking-wider text-white transition-all hover:bg-racing-red-bright hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]"
          >
            DISCOVER MORE
          </Link>
          <Link
            to={routes.shop()}
            className="rounded-sm border-2 border-gold px-10 py-4 font-heading text-sm tracking-wider text-gold transition-all hover:bg-gold hover:text-black hover:shadow-[0_0_30px_rgba(250,204,21,0.3)]"
          >
            SHOP MERCH
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-8 w-8 text-gold/70" />
      </div>
    </section>
  )
}

export default HeroSection
