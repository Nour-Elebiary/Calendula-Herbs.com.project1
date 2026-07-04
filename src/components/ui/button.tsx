import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 min-h-11 px-6 py-2",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-green-600)] text-[var(--color-text-inverse)] shadow hover:bg-[var(--color-green-500)] active:scale-95 border-2 border-[var(--color-green-600)]",
        destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600 border-2 border-red-500",
        outline: "border-2 border-[var(--color-border-default)] bg-transparent hover:bg-[var(--color-bg-base)] hover:border-[var(--color-border-accent)]",
        secondary: "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] shadow-sm hover:bg-[var(--color-bg-surface)]",
        ghost: "hover:bg-[var(--color-bg-base)] hover:text-[var(--color-text-primary)] text-[var(--color-text-secondary)]",
        link: "text-[var(--color-green-600)] underline-offset-4 hover:underline",
        accent: "bg-[var(--color-calendula-500)] text-[var(--color-text-inverse)] hover:bg-[var(--color-calendula-400)] border-2 border-[var(--color-calendula-500)]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-full px-8 text-base",
        icon: "h-11 w-11 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
