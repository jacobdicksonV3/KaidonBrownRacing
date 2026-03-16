import { Metadata } from '@cedarjs/web'

import Timeline from 'src/components/Timeline/Timeline'

const AboutPage = () => {
  return (
    <>
      <Metadata title="About" description="About Kaidon Brown - 3x Australian Speedcar Champion" />

      {/* Hero banner with driver photo */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/driver/driver-4.webp"
            alt="Kaidon Brown"
            className="h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40 md:bg-none" />
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        </div>

        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl items-end px-4 pb-12 pt-32 md:items-center md:py-24">
          <div className="max-w-xl">
            <div className="mb-4 h-1 w-12 bg-racing-red" />
            <p className="font-heading text-sm tracking-[0.3em] text-gold">ABOUT THE DRIVER</p>
            <h1 className="mt-3 font-heading text-5xl leading-tight text-white md:text-6xl">
              KAIDON<br />
              <span className="text-racing-red">BROWN</span>
            </h1>
            <p className="mt-6 text-base leading-relaxed text-white/70 md:text-lg">
              Kaidon Brown is a 3x Australian Speedcar Champion, having claimed national titles in
              2018, 2025, and 2026. Racing car V97 out of the Kaidon Brown Racing stable, Kaidon
              has established himself as one of the most dominant forces in Australian speedcar
              racing.
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/70 md:text-lg">
              A fourth-generation speedcar driver with a family deeply rooted in motorsport,
              Kaidon&apos;s passion for racing was forged from a young age. His aggressive yet
              calculated driving style has seen him consistently at the front of the field across
              tracks throughout Australia &mdash; and as the reigning champion, he carries the
              prestigious <span className="font-semibold text-gold">A1</span> plate.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-racing-red via-gold to-racing-red" />
      </section>

      {/* Quick stats strip */}
      <section className="bg-black py-8">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-4 md:flex md:flex-wrap md:items-center md:justify-center md:gap-16">
          {[
            { value: '3x', label: 'CHAMPION' },
            { value: '17', label: 'AGE AT FIRST TITLE' },
            { value: '4TH GEN', label: 'RACING FAMILY' },
            { value: 'A1', label: 'CHAMPION PLATE' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="font-heading text-3xl text-white md:text-4xl">{stat.value}</span>
              <span className="mt-1 block text-[10px] tracking-[0.25em] text-white/40">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline section */}
      <section className="relative overflow-hidden bg-black py-16 md:py-24">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 30px, #dc2626 30px, #dc2626 31px)',
        }} />
        <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-racing-red/40 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center md:mb-16">
            <span className="font-heading text-sm tracking-[0.3em] text-racing-red">THE JOURNEY</span>
            <h2 className="mt-3 font-heading text-3xl tracking-wider text-white md:text-5xl">
              CAREER <span className="text-gold">TIMELINE</span>
            </h2>
            <div className="mx-auto mt-4 h-1 w-20 bg-gradient-to-r from-racing-red to-gold" />
            <p className="mt-4 text-sm text-white/40 md:text-base">From rising talent to three-time champion</p>
          </div>
          <Timeline />
        </div>
      </section>

      {/* The Car section — stacks on mobile, side by side on desktop */}
      <section className="relative overflow-hidden bg-black">
        <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="mx-auto grid max-w-7xl md:grid-cols-2">
          <div className="relative min-h-[300px] md:min-h-[500px]">
            <img
              src="/images/cars/car-2.webp"
              alt="V97 Speedcar"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:bg-none" />
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-transparent to-black" />
          </div>

          <div className="flex flex-col justify-center px-4 py-12 md:py-24 md:pl-12 md:pr-4">
            <div className="mb-4 h-1 w-12 bg-gold" />
            <span className="font-heading text-sm tracking-[0.3em] text-gold">THE MACHINE</span>
            <h2 className="mt-3 font-heading text-3xl tracking-wider text-white md:text-5xl">
              V97 <span className="text-racing-red">SPEEDCAR</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-white/60 md:text-lg">
              Kaidon races the V97 Kaidon Brown Racing speedcar, prepared and maintained to the
              highest standards by his family team. As the reigning Australian champion, the car
              carries the coveted A1 plate.
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/60 md:text-lg">
              Speedcars are open-wheel, open-cockpit race cars that
              compete on short oval dirt tracks, delivering intense wheel-to-wheel racing at
              thrilling speeds.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

export default AboutPage
