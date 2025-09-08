import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Sparkles, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export const NewFeatureBanner = () => {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/20 rounded-full">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sm">Phase 1 Enhancement Complete!</h3>
                <Badge variant="secondary" className="text-xs">NEW</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Advanced society management, financial tracking, and communication features are now available.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" asChild>
              <Link to="/society-management-enhanced">
                Explore Features
                <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}