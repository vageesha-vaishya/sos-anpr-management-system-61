import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Download, Printer, QrCode, Shield, Clock } from 'lucide-react'

interface BadgePreviewProps {
  template: any
  isOpen: boolean
  onClose: () => void
}

const sampleVisitor = {
  name: 'John Doe',
  company: 'ABC Corporation',
  purpose: 'Business Meeting',
  host: 'Jane Smith',
  expires: '5:00 PM',
  date: new Date().toLocaleDateString()
}

export const BadgePreview = ({ template, isOpen, onClose }: BadgePreviewProps) => {
  if (!template) return null

  const { design_config, security_features, name, template_type } = template

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Badge Preview: {name}
            <Badge variant="outline">{template_type}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Badge Preview */}
          <div className="flex justify-center">
            <Card 
              className="w-80 h-52 p-4 relative border-2"
              style={{ 
                backgroundColor: `hsl(${design_config?.backgroundColor || '0 0% 100%'})`,
                color: `hsl(${design_config?.textColor || '222.2 84% 4.9%'})`
              }}
            >
              {/* Logo positioned based on config */}
              {design_config?.logoPosition === 'top' && (
                <div className="flex justify-center mb-3">
                  <div className="w-16 h-10 bg-primary/20 rounded flex items-center justify-center text-xs">
                    LOGO
                  </div>
                </div>
              )}

              {/* Main content area */}
              <div className={`
                ${design_config?.logoPosition === 'left' ? 'ml-12' : ''}
                ${design_config?.logoPosition === 'right' ? 'mr-12' : ''}
                text-center
              `}>
                <div 
                  className="font-bold mb-1"
                  style={{ fontSize: `${design_config?.fontSize || 14}px` }}
                >
                  {sampleVisitor.name}
                </div>
                
                <div className="text-sm mb-2 opacity-80">
                  VISITOR
                </div>

                {design_config?.layout === 'detailed' && (
                  <>
                    <div className="text-xs mb-1 opacity-70">
                      {sampleVisitor.company}
                    </div>
                    <div className="text-xs mb-1 opacity-70">
                      Host: {sampleVisitor.host}
                    </div>
                  </>
                )}

                {security_features?.expiration && (
                  <div className="text-xs flex items-center justify-center gap-1 mt-2">
                    <Clock className="w-3 h-3" />
                    Expires: {sampleVisitor.expires}
                  </div>
                )}
              </div>

              {/* Side logos */}
              {design_config?.logoPosition === 'left' && (
                <div className="absolute left-2 top-4 w-8 h-8 bg-primary/20 rounded flex items-center justify-center text-xs">
                  L
                </div>
              )}
              
              {design_config?.logoPosition === 'right' && (
                <div className="absolute right-2 top-4 w-8 h-8 bg-primary/20 rounded flex items-center justify-center text-xs">
                  L
                </div>
              )}

              {/* Bottom logo */}
              {design_config?.logoPosition === 'bottom' && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-16 h-6 bg-primary/20 rounded flex items-center justify-center text-xs">
                    LOGO
                  </div>
                </div>
              )}

              {/* Security features */}
              <div className="absolute bottom-2 right-2 flex gap-1">
                {security_features?.qrCode && (
                  <div className="w-6 h-6 bg-foreground/10 rounded flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                )}
                {security_features?.watermark && (
                  <div className="w-6 h-6 bg-foreground/10 rounded flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Template Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Template Details</h3>
              <div className="space-y-1 text-sm">
                <div><strong>Name:</strong> {name}</div>
                <div><strong>Type:</strong> {template_type}</div>
                <div><strong>Layout:</strong> {design_config?.layout || 'standard'}</div>
                <div><strong>Logo Position:</strong> {design_config?.logoPosition || 'top'}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Security Features</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  QR Code: {security_features?.qrCode ? 'Yes' : 'No'}
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Watermark: {security_features?.watermark ? 'Yes' : 'No'}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Expiration: {security_features?.expiration ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Test Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}