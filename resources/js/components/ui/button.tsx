import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#FF8A50] to-[#FF9B71] text-white shadow-md hover:shadow-lg hover:from-[#FF7A40] hover:to-[#FF8B61] transform hover:scale-105",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105",
        outline:
          "border-2 border-[#FF8A50] bg-white shadow-sm hover:bg-gradient-to-r hover:from-[#FF8A50] hover:to-[#FF9B71] hover:text-white hover:shadow-md transform hover:scale-105",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 shadow-sm hover:shadow-md hover:from-gray-200 hover:to-gray-300 transform hover:scale-105",
        ghost: "hover:bg-orange-50 hover:text-[#FF8A50]",
        link: "text-[#FF8A50] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2 has-[>svg]:px-4",
        sm: "h-8 rounded-full px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-full px-8 has-[>svg]:px-6 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
