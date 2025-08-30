import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: string
    direction: 'up' | 'down'
  }
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  loading?: boolean
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  loading = false
}) => {
  const iconStyles = {
    default: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive'
  }

  const trendStyles = {
    up: 'text-success',
    down: 'text-destructive'
  }

  if (loading) {
    return (
      <Card className="animate-pulse border-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-muted rounded w-24 animate-glow"></div>
          <div className="h-10 w-10 bg-muted rounded-lg animate-float"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted rounded w-20 mb-2 animate-glow"></div>
          <div className="h-3 bg-muted rounded w-32 animate-glow"></div>
        </CardContent>
      </Card>
    )
  }

    return (
      <Card className="transition-all duration-300 hover:shadow-xl hover:scale-105 animate-fade-in border-2 hover:border-primary/20 group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {title}
          </CardTitle>
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3',
            variant === 'default' && 'bg-primary/10 group-hover:bg-primary/20',
            variant === 'success' && 'bg-success/10 group-hover:bg-success/20',
            variant === 'warning' && 'bg-warning/10 group-hover:bg-warning/20',
            variant === 'destructive' && 'bg-destructive/10 group-hover:bg-destructive/20'
          )}>
            <Icon className={cn('h-6 w-6 transition-all duration-300', iconStyles[variant])} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground mb-2 transition-all duration-300 group-hover:text-4xl">
            {typeof value === 'number' ? (
              <AnimatedCounter value={value} />
            ) : (
              value
            )}
          </div>
        <div className="flex items-center justify-between">
          {description && (
            <p className="text-xs text-muted-foreground flex-1">
              {description}
            </p>
          )}
          {trend && (
            <Badge variant="outline" className={cn('ml-2', trendStyles[trend.direction])}>
              {trend.direction === 'up' ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {trend.value}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}