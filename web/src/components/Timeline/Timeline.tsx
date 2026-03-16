const events = [
  { year: '2018', title: 'First Australian Speedcar Championship', description: 'Claimed his first national title in a breakout season, becoming the youngest-ever Australian Speedcar Champion at just 17 years old. Earned the right to carry the A1 plate.' },
  { year: '2019-24', title: 'Consistent Contender', description: 'Remained a front-runner in the Australian speedcar scene, racking up feature wins across the country in the V97. Also competed in the USA at the Chili Bowl Nationals.' },
  { year: '2025', title: 'Second Championship', description: 'Returned to the top step with a dominant campaign, securing his second national crown and reclaiming the A1.' },
  { year: '2026', title: 'Three-peat', description: 'Made history with back-to-back titles, becoming a 3x Australian Speedcar Champion. The A1 stays on the Kaidon Brown Racing car.' },
]

const Timeline = () => (
  <div className="mx-auto max-w-3xl">
    {events.map((event, i) => (
      <div key={event.year} className="group relative flex gap-8 pb-16 last:pb-0">
        {/* Line + dot */}
        <div className="flex flex-col items-center">
          <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-racing-red bg-black font-heading text-sm text-racing-red transition-colors group-hover:bg-racing-red group-hover:text-white">
            {event.year.slice(0, 4)}
          </div>
          {i < events.length - 1 && (
            <div className="w-px flex-1 bg-gradient-to-b from-racing-red/40 to-white/10" />
          )}
        </div>

        {/* Content card */}
        <div className="-mt-1 flex-1 rounded-lg border border-white/5 bg-white/[0.02] p-6 transition-colors group-hover:border-racing-red/20 group-hover:bg-white/[0.04]">
          <div className="mb-2 flex items-center gap-3">
            <span className="font-heading text-xs tracking-[0.2em] text-gold">{event.year}</span>
            {(event.year === '2018' || event.year === '2025' || event.year === '2026') && (
              <span className="rounded bg-racing-red/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-racing-red">
                CHAMPION
              </span>
            )}
          </div>
          <h3 className="font-heading text-lg tracking-wide text-white">{event.title}</h3>
          <p className="mt-2 leading-relaxed text-white/50">{event.description}</p>
        </div>
      </div>
    ))}
  </div>
)

export default Timeline
