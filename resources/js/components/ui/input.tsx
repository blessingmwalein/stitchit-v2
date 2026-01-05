import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        
        "rounded-full flex h-10 w-full min-w-0 border border-gray-300 bg-white px-3.5 py-2 text-sm shadow-sm transition-colors outline-none",
        "placeholder:text-muted-foreground selection:bg-accent selection:text-foreground",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "focus:border-ring focus:ring-2 focus:ring-ring/20",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60",
        "dark:bg-gray-800 dark:border-gray-700 dark:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Input }
