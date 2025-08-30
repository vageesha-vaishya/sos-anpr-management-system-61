import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, AlertCircle, Info } from "lucide-react"

interface FormFieldEnhancedProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  error?: string
  success?: string
  info?: string
  required?: boolean
  loading?: boolean
}

const FormFieldEnhanced = React.forwardRef<HTMLDivElement, FormFieldEnhancedProps>(
  ({ className, label, error, success, info, required, loading, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
          {loading && (
            <div className="w-3 h-3 animate-spin rounded-full border border-muted border-t-primary ml-1" />
          )}
        </label>
        
        <div className="relative">
          {children}
          
          {/* Status Icons */}
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="w-4 h-4 text-destructive" />
            </div>
          )}
          {success && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckCircle className="w-4 h-4 text-success" />
            </div>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="flex items-center gap-1 text-sm text-destructive animate-fade-in">
            <AlertCircle className="w-3 h-3" />
            {error}
          </div>
        )}
        {success && !error && (
          <div className="flex items-center gap-1 text-sm text-success animate-fade-in">
            <CheckCircle className="w-3 h-3" />
            {success}
          </div>
        )}
        {info && !error && !success && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Info className="w-3 h-3" />
            {info}
          </div>
        )}
      </div>
    )
  }
)
FormFieldEnhanced.displayName = "FormFieldEnhanced"

export { FormFieldEnhanced }