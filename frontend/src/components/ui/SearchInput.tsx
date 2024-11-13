"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

/**
 * Creates a search input that has an embedded clear button if there is text. Requires
 * the following props:
 * 
 * - `className`: Any styling or customisation settings for the search input bar.
 * - `value`: The current value of the search input.
 * - `onInputChange`: Input event handler when the search input is changed.
 * - `onClearInput`: Button event handler when the clear input (X) button is clicked.
 * 
 * @returns 
 */
export default function SearchInput({ className, value, onInputChange, onClearInput } : { className : string, value : string, onInputChange : (e: React.ChangeEvent<HTMLInputElement>) => void, onClearInput : () => void }) {
  return (
    <div className={ "relative w-full max-w-sm " + className }>
      <Input
        type="text"
        placeholder="Search..."
        value={value}
        name="search"
        onChange={onInputChange}
        className="pr-10"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-70 hover:opacity-100 transition-opacity"
          onClick={onClearInput}
          aria-label="Clear search"
        >
          <X className="h-4 w-4 text-primary" />
        </Button>
      )}
    </div>
  )
}