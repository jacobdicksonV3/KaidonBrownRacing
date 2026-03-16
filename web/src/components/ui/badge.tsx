import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from 'src/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-racing-red text-white',
        secondary: 'border-transparent bg-white/10 text-white/70',
        success: 'border-transparent bg-green-900/50 text-green-400',
        warning: 'border-transparent bg-yellow-900/50 text-yellow-400',
        destructive: 'border-transparent bg-red-900/50 text-red-400',
        outline: 'border-white/20 text-white/70',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
