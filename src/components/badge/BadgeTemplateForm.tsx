import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BadgeDesigner } from './BadgeDesigner'
import { BadgePreview } from './BadgePreview'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

const formSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  template_type: z.enum(['visitor', 'contractor', 'vip', 'emergency']),
  active: z.boolean(),
  design_config: z.object({
    backgroundColor: z.string(),
    textColor: z.string(),
    fontSize: z.number(),
    logoPosition: z.enum(['top', 'bottom', 'left', 'right']),
    layout: z.enum(['standard', 'compact', 'detailed'])
  }),
  security_features: z.object({
    qrCode: z.boolean(),
    watermark: z.boolean(),
    expiration: z.boolean()
  })
})

type FormData = z.infer<typeof formSchema>

interface BadgeTemplateFormProps {
  template?: any
  onSave: () => void
  onCancel: () => void
}

export const BadgeTemplateForm = ({ template, onSave, onCancel }: BadgeTemplateFormProps) => {
  const [loading, setLoading] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template?.name || '',
      template_type: template?.template_type || 'visitor',
      active: template?.active ?? true,
      design_config: template?.design_config || {
        backgroundColor: '0 0% 100%',
        textColor: '222.2 84% 4.9%',
        fontSize: 14,
        logoPosition: 'top',
        layout: 'standard'
      },
      security_features: template?.security_features || {
        qrCode: true,
        watermark: false,
        expiration: true
      }
    }
  })

  const watchedValues = form.watch()

  useEffect(() => {
    setPreviewData(watchedValues)
  }, [watchedValues])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    
    try {
      if (template) {
        const { error } = await supabase
          .from('badge_templates')
          .update({
            name: data.name,
            template_type: data.template_type,
            design_config: data.design_config,
            security_features: data.security_features,
            active: data.active
          })
          .eq('id', template.id)

        if (error) throw error
        
        toast({
          title: 'Success',
          description: 'Badge template updated successfully'
        })
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user?.id)
          .single()

        const { error } = await supabase
          .from('badge_templates')
          .insert({
            name: data.name,
            template_type: data.template_type,
            design_config: data.design_config,
            security_features: data.security_features,
            active: data.active,
            organization_id: profile?.organization_id
          })

        if (error) throw error
        
        toast({
          title: 'Success',
          description: 'Badge template created successfully'
        })
      }
      
      onSave()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save badge template',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter template name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="template_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="visitor">Visitor</SelectItem>
                      <SelectItem value="contractor">Contractor</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Template</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Make this template available for badge printing
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Security Features</h3>
              
              <FormField
                control={form.control}
                name="security_features.qrCode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">QR Code</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Include QR code for verification
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="security_features.watermark"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Watermark</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Add security watermark to badge
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="security_features.expiration"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Expiration Time</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Show badge expiration time
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="design">
            <BadgeDesigner 
              designConfig={form.watch('design_config')}
              onDesignChange={(newConfig) => form.setValue('design_config', newConfig)}
            />
          </TabsContent>

          <TabsContent value="preview">
            <div className="flex justify-center">
              <div className="w-80 h-52 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50">
                <div className="text-center">
                  <div className="text-sm font-medium mb-2">Badge Preview</div>
                  <div className="text-xs text-muted-foreground">
                    Template: {form.watch('name') || 'Untitled'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Type: {form.watch('template_type')}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Form>
  )
}