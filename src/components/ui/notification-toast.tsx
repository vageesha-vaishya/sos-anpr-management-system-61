import React from 'react'
import { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Toaster() {
  const { toasts } = useToast()

  const getIcon = (variant?: string) => {
    switch (variant) {
      case 'destructive':
        return <AlertCircle className="w-5 h-5" />
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getVariantStyles = (variant?: string) => {
    switch (variant) {
      case 'destructive':
        return 'border-destructive/50 bg-destructive/10 text-destructive'
      case 'success':
        return 'border-success/50 bg-success/10 text-success'
      case 'warning':
        return 'border-warning/50 bg-warning/10 text-warning'
      default:
        return 'border-primary/50 bg-primary/10 text-primary'
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props}
            className={cn(
              'animate-slide-in-right border-2 backdrop-blur-sm',
              getVariantStyles(variant)
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getIcon(variant)}
              </div>
              <div className="flex-1">
                {title && <ToastTitle className="text-base font-semibold">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-sm opacity-90">
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose className="hover:scale-110 transition-transform" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}