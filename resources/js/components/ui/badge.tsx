import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

// Helper badge components for different states
export const OrderStateBadge = ({ state }: { state: string }) => {
  const stateColors: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
    DRAFT: { variant: 'secondary' },
    PENDING_DEPOSIT: { variant: 'default', className: 'bg-yellow-500 text-white' },
    DEPOSIT_PAID: { variant: 'default', className: 'bg-blue-500 text-white' },
    IN_PRODUCTION: { variant: 'default', className: 'bg-[#FF8A50] text-white' },
    READY_FOR_DISPATCH: { variant: 'default', className: 'bg-teal-500 text-white' },
    DISPATCHED: { variant: 'default', className: 'bg-purple-500 text-white' },
    CLOSED: { variant: 'default', className: 'bg-green-600 text-white' },
    ARCHIVED: { variant: 'outline' },
  };

  const config = stateColors[state] || { variant: 'outline' as const };
  const label = state.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return <Badge variant={config.variant} className={config.className}>{label}</Badge>;
};

export const ProductionStateBadge = ({ state }: { state: string }) => {
  const stateColors: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
    PLANNED: { variant: 'secondary' },
    MATERIALS_ALLOCATED: { variant: 'default', className: 'bg-blue-500 text-white' },
    TUFTING: { variant: 'default', className: 'bg-[#FF8A50] text-white' },
    FINISHING: { variant: 'default', className: 'bg-purple-500 text-white' },
    QUALITY_CHECK: { variant: 'default', className: 'bg-yellow-500 text-white' },
    COMPLETED: { variant: 'default', className: 'bg-green-500 text-white' },
    // Legacy states (lowercase)
    pending: { variant: 'secondary' },
    materials_allocated: { variant: 'default', className: 'bg-blue-500 text-white' },
    in_progress: { variant: 'default', className: 'bg-[#FF8A50] text-white' },
    quality_check: { variant: 'default', className: 'bg-yellow-500 text-white' },
    completed: { variant: 'default', className: 'bg-green-500 text-white' },
    cancelled: { variant: 'destructive' },
  };

  const config = stateColors[state] || { variant: 'outline' as const };
  const label = state.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return <Badge variant={config.variant} className={config.className}>{label}</Badge>;
};

export const PurchaseStateBadge = ({ state }: { state: string }) => {
  const stateColors: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
    draft: { variant: 'secondary' },
    sent: { variant: 'default', className: 'bg-blue-500 text-white' },
    confirmed: { variant: 'default', className: 'bg-purple-500 text-white' },
    received: { variant: 'default', className: 'bg-green-500 text-white' },
    closed: { variant: 'outline' },
  };

  const config = stateColors[state] || { variant: 'outline' as const };
  const label = state.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return <Badge variant={config.variant} className={config.className}>{label}</Badge>;
};

export { Badge, badgeVariants }
