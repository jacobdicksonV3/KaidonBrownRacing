interface SectionHeadingProps {
  title: string
  subtitle?: string
}

const SectionHeading = ({ title, subtitle }: SectionHeadingProps) => (
  <div className="mb-8 text-center">
    <h2 className="font-heading text-3xl tracking-wider text-white md:text-4xl">
      {title}
    </h2>
    {subtitle && (
      <p className="mt-2 text-white/50">{subtitle}</p>
    )}
    <div className="mx-auto mt-4 h-1 w-16 bg-gradient-to-r from-racing-red to-gold" />
  </div>
)

export default SectionHeading
