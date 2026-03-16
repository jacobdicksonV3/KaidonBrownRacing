const stats = [
  { value: '3x', label: 'NATIONAL CHAMPION', accent: 'bg-racing-red' },
  { value: '2018 \u2022 2025 \u2022 2026', label: 'CHAMPIONSHIP YEARS', accent: 'bg-gold' },
]

const StatsBar = () => (
  <section className="relative overflow-hidden bg-black py-6">
    <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #dc2626 10px, #dc2626 11px)',
    }} />

    <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-center px-4">
      {stats.map((stat, i) => (
        <div key={stat.label} className="flex items-center">
          <div className="px-6 py-3 text-center md:px-10">
            <span className="font-heading text-2xl tracking-wider text-white md:text-3xl">
              {stat.value}
            </span>
            <div className={`mx-auto mt-1.5 h-0.5 w-8 ${stat.accent}`} />
            <span className="mt-1.5 block text-[10px] tracking-[0.25em] text-white/40">
              {stat.label}
            </span>
          </div>
          {i < stats.length - 1 && (
            <div className="hidden h-10 w-px bg-white/10 md:block" />
          )}
        </div>
      ))}
    </div>
  </section>
)

export default StatsBar
