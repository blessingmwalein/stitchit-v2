import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm shadow-sm transition-colors outline-none",
          "placeholder:text-muted-foreground selection:bg-accent selection:text-foreground",
          "focus:border-ring focus:ring-2 focus:ring-ring/20",
          "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60",
          "dark:bg-gray-800 dark:border-gray-700 dark:text-foreground",
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
