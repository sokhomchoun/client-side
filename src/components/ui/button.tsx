
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg hover:from-red-600 hover:to-orange-600 hover:shadow-xl hover:scale-105 border-0 hover:text-white",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 border-0 hover:text-white",
        outline:
          "border border-red-300 bg-background text-foreground hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-700 hover:border-red-400 dark:hover:from-red-950 dark:hover:to-orange-950 dark:hover:text-red-200",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-red-100 hover:to-orange-100 hover:text-red-800 border-0 dark:from-gray-800 dark:to-gray-700 dark:text-gray-100 dark:hover:from-red-900 dark:hover:to-orange-900 dark:hover:text-red-200",
        ghost: "bg-transparent text-foreground hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-700 border-0 dark:hover:from-red-950 dark:hover:to-orange-950 dark:hover:text-red-200",
        link: "text-red-500 underline-offset-4 hover:underline hover:text-orange-500 bg-transparent border-0 dark:text-red-400 dark:hover:text-orange-400",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Debug logging
    // console.log('Button variant:', variant);
    // console.log('Button classes:', buttonVariants({ variant, size, className }));
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        style={{
          background: variant === 'default' ? 'linear-gradient(to right, #ef4444, #f97316)' : undefined,
          color: variant === 'default' ? 'white' : undefined,
          border: '0',
          ...props.style
        }}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
