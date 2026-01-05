import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface DatePickerProps {
  date?: Date
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  id,
}: DatePickerProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      onDateChange(new Date(value))
    } else {
      onDateChange(undefined)
    }
  }

  const formatDateForInput = (date?: Date) => {
    if (!date) return ""
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  return (
    <Input
      id={id}
      type="date"
      value={formatDateForInput(date)}
      onChange={handleDateChange}
      disabled={disabled}
      className={cn("w-full", className)}
      placeholder={placeholder}
    />
  )
}
