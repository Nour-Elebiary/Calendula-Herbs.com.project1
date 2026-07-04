import * as React from "react"
import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-md border-2 px-4 py-3 text-sm font-body shadow-sm transition-all placeholder:text-[var(--color-text-tertiary)] focus-visible:outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-bg-base)] resize-none",
          error ? "border-[var(--color-error)] bg-[rgba(184,50,50,0.04)] focus-visible:border-[var(--color-error)] focus-visible:ring-[rgba(184,50,50,0.3)]" : "border-[var(--color-border-default)] bg-[rgba(255,253,248,0.75)] focus-visible:border-[var(--color-green-500)] focus-visible:ring-[var(--color-focus-ring)]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
