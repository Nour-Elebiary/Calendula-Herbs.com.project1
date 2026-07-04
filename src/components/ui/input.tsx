import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border-2 px-4 py-3 text-sm font-body shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--color-text-tertiary)] focus-visible:outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-bg-base)]",
          error ? "border-[var(--color-error)] bg-[rgba(184,50,50,0.04)] focus-visible:border-[var(--color-error)] focus-visible:ring-[rgba(184,50,50,0.3)]" : "border-[var(--color-border-default)] bg-[rgba(255,253,248,0.75)] focus-visible:border-[var(--color-green-500)] focus-visible:ring-[var(--color-focus-ring)]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
