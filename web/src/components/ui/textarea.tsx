import * as React from 'react'

import { cn } from 'src/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[60px] w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-sm text-white shadow-sm placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-racing-red disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
