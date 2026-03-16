import { Link, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'
import { ShoppingBag, Camera, ChevronRight, Facebook, Instagram } from 'lucide-react'

import HeroSection from 'src/components/HeroSection/HeroSection'
import StatsBar from 'src/components/StatsBar/StatsBar'

const HomePage = () => {
  return (
    <>
      <Metadata
        title="Home"
        description="Kaidon Brown Racing - 3x Australian Speedcar Champion"
      />

      <HeroSection />
      <StatsBar />

      {/* A1 Champion's Number feature */}
      <section className="relative overflow-hidden bg-black py-20">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 30px, #facc15 30px, #facc15 31px)',
        }} />
        <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
          <div className="text-center md:text-left">
            <span className="font-heading text-sm tracking-[0.3em] text-racing-red">THE HIGHEST HONOUR</span>
            <h2 className="mt-3 font-heading text-4xl tracking-wider text-white md:text-5xl">
              THE <span className="text-gold drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]">A1</span>
            </h2>
            <div className="mx-auto mt-4 h-0.5 w-16 bg-racing-red md:mx-0" />
            <p className="mt-6 text-lg leading-relaxed text-white/60">
              In Australian speedcar racing, the champion earns the right to carry the
              number <span className="font-semibold text-gold">A1</span> on
              their car. It&apos;s the ultimate mark of a national champion &mdash; and
              Kaidon has carried it three times.
            </p>
            <p className="mt-4 text-white/40">
              Normally running <span className="font-semibold text-white/70">V97</span>,
              Kaidon swaps to the A1 plate as the reigning Australian Speedcar Champion.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="flex h-48 w-48 items-center justify-center rounded-full border-4 border-gold bg-black shadow-[0_0_60px_rgba(250,204,21,0.15)] md:h-64 md:w-64">
                <div className="text-center">
                  <span className="font-heading text-7xl tracking-wider text-gold drop-shadow-[0_0_30px_rgba(250,204,21,0.5)] md:text-8xl">
                    A1
                  </span>
                  <div className="mt-1 h-0.5 w-full bg-racing-red" />
                  <span className="mt-2 block text-[10px] tracking-[0.3em] text-white/50">
                    CHAMPION
                  </span>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-racing-red font-heading text-sm text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                3x
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social media CTA — video background */}
      <section className="relative overflow-hidden py-24">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/videos/video-2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />

        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="max-w-xl">
            <h2 className="font-heading text-4xl tracking-wider text-white md:text-5xl">
              BUILT FOR{' '}
              <span className="text-racing-red">SPEED</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/70">
              Follow Kaidon on and off the track. Race day content, behind the scenes
              with the Kaidon Brown Racing team, and all the latest from the V97 camp.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://www.facebook.com/kaidonbrownracing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-sm bg-racing-red px-8 py-4 font-heading text-sm tracking-wider text-white transition-all hover:bg-racing-red-bright hover:shadow-[0_0_30px_rgba(220,38,38,0.4)]"
              >
                <Facebook className="h-5 w-5" />
                FACEBOOK
              </a>
              <a
                href="https://www.instagram.com/kaidonbrown"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-sm border-2 border-gold px-8 py-4 font-heading text-sm tracking-wider text-gold transition-all hover:bg-gold hover:text-black hover:shadow-[0_0_30px_rgba(250,204,21,0.3)]"
              >
                <Instagram className="h-5 w-5" />
                INSTAGRAM
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Photo grid */}
      <section className="relative bg-black py-24">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-racing-red to-transparent" />

        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1">
              <Camera className="h-3 w-3 text-gold" />
              <span className="text-xs font-semibold tracking-wider text-gold uppercase">
                Gallery
              </span>
            </div>
            <h2 className="font-heading text-4xl tracking-wider text-white md:text-5xl">
              ON THE <span className="text-gold">TRACK</span>
            </h2>
            <div className="mx-auto mt-4 h-1 w-20 bg-racing-red" />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2">
            <div className="group relative col-span-2 row-span-2 overflow-hidden rounded-lg">
              <img
                src="/images/cars/car-1.webp"
                alt="Racing highlight"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-racing-red/10" />
              <div className="absolute top-0 left-0 h-1 w-full bg-racing-red opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            {[2, 3, 4, 5].map((i) => (
              <div key={i} className="group relative overflow-hidden rounded-lg">
                <img
                  src={`/images/cars/car-${i}.webp`}
                  alt={`Racing highlight ${i}`}
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-racing-red/20" />
                <div className="absolute top-0 left-0 h-1 w-full bg-gold opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Shop CTA — video background */}
      <section className="relative overflow-hidden py-32">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/videos/video-5.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />

        <div className="absolute top-0 left-0 h-20 w-1 bg-gradient-to-b from-racing-red to-transparent" />
        <div className="absolute top-0 left-0 h-1 w-20 bg-gradient-to-r from-racing-red to-transparent" />
        <div className="absolute bottom-0 right-0 h-20 w-1 bg-gradient-to-t from-gold to-transparent" />
        <div className="absolute bottom-0 right-0 h-1 w-20 bg-gradient-to-l from-gold to-transparent" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1">
            <ShoppingBag className="h-3 w-3 text-gold" />
            <span className="text-xs font-semibold tracking-wider text-gold uppercase">
              Official Merchandise
            </span>
          </div>
          <h2 className="font-heading text-4xl tracking-wider text-white md:text-6xl">
            REP THE{' '}
            <span className="text-gold drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]">
              CHAMPION
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-white/60">
            Official tees, hoodies, caps, and collectables. Gear up with Kaidon Brown Racing.
          </p>
          <Link
            to={routes.shop()}
            className="mt-10 inline-flex items-center gap-2 rounded-sm bg-gold px-12 py-4 font-heading text-sm tracking-wider text-black transition-all hover:bg-gold-dark hover:shadow-[0_0_40px_rgba(250,204,21,0.3)]"
          >
            SHOP NOW
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}

export default HomePage
