import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primaryLight shadow-none",
        destructive:
          "bg-error text-white hover:opacity-90 shadow-none",
        outline:
          "border border-border bg-surface text-textPrimary hover:bg-background hover:text-primary transition-colors",
        secondary:
          "bg-background text-textPrimary hover:bg-border",
        ghost: "hover:bg-background hover:text-textPrimary",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-sm rounded-md",
        lg: "h-12 px-8 text-base rounded-md",
        icon: "h-10 w-10",
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
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          loading && "animate-pulse cursor-wait"
        )}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        <div className="flex items-center justify-center gap-2">
          {loading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {children}
        </div>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

