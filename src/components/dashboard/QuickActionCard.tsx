import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickActionCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  className?: string
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon: Icon,
  href,
  variant = 'default',
  className
}) => {
  const variantStyles = {
    default: 'hover:border-primary/50 hover:shadow-primary/10',
    success: 'hover:border-success/50 hover:shadow-success/10',
    warning: 'hover:border-warning/50 hover:shadow-warning/10',
    destructive: 'hover:border-destructive/50 hover:shadow-destructive/10'
  }

  const iconStyles = {
    default: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive'
  }

  return (
    <Card className={cn(
      'transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-transparent',
      variantStyles[variant],
      className
    )}>
      <CardContent className="p-6">
        <Button variant="ghost" size="xl" className="w-full h-auto p-0 hover:bg-transparent" asChild>
          <Link to={href} className="flex flex-col items-center text-center space-y-4">
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300',
              variant === 'default' && 'bg-primary/10 group-hover:bg-primary/20',
              variant === 'success' && 'bg-success/10 group-hover:bg-success/20',
              variant === 'warning' && 'bg-warning/10 group-hover:bg-warning/20',
              variant === 'destructive' && 'bg-destructive/10 group-hover:bg-destructive/20'
            )}>
              <Icon className={cn('w-8 h-8', iconStyles[variant])} />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}