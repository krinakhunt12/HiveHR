import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../utils/cn"

const buttonVariants: any = (variants: any) => {
  const { variant, size } = variants;
  const baseStyles = "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";
  
  const variantStyles: any = {
    default: "bg-primary text-white shadow-sm hover:bg-primary/90",
    primary: "bg-primary text-white shadow-sm hover:bg-primary/90",
    destructive: "bg-error text-white shadow-sm hover:bg-error/90",
    outline: "border border-border bg-surface text-main hover:bg-bg",
    secondary: "bg-bg text-main hover:bg-border",
    ghost: "hover:bg-bg text-muted hover:text-main",
    link: "text-primary underline-offset-4 hover:underline font-semibold",
  };

  const sizeStyles: any = {
    default: "h-10 px-4",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  return cn(baseStyles, variantStyles[variant || "default"], sizeStyles[size || "default"]);
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "primary"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
