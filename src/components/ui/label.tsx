import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "@/lib/utils"

interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  error?: boolean
  required?: boolean
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, error, required, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors block mb-2 flex items-center gap-1",
      error ? "text-[var(--color-error)]" : "text-[var(--color-text-secondary)]",
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="text-[var(--color-error)] font-semibold">*</span>}
  </LabelPrimitive.Root>
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
