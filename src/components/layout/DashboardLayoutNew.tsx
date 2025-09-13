import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Building2,
  Camera,
  Car,
  CreditCard,
  DollarSign,
  FileText,
  Grid3x3,
  Home,
  Megaphone,
  Settings,
  Shield,
  Users,
  Calendar,
  HelpCircle,
  LogOut,
  ChevronDown,
  Monitor,
  MapPin,
  Bell,
  Gamepad2,
  ParkingCircle,
  UserCog,
  Building,
  User,
  BarChart3,
  Activity,
  UserCheck,
  MessageCircle,
  Wrench,
  Receipt,
  TrendingUp,
  UserPlus,
  ClipboardCheck,
  Zap,
  Cog
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Database } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

// Define navigation groups with their items - SOS System Structure
const navigationGroups = [
  {
    label: "SOS Dashboard",
    icon: Home,
    items: [
      { name: 'Main Dashboard', href: '/', icon: Grid3x3, minimumRole: 'customer' },
      { name: 'Analytics & Reports', href: '/analytics', icon: BarChart3, minimumRole: 'society_admin' },
      { name: 'System Status', href: '/platform-admin', icon: Activity, minimumRole: 'platform_admin' },
    ]
  },
  {
    label: "Operations Management",
    icon: Shield,
    items: [
      { name: 'Security & Monitoring', href: '/cameras', icon: Camera, minimumRole: 'society_admin' },
      { name: 'Access Control', href: '/vehicles', icon: Car, minimumRole: 'society_admin' },
      { name: 'Alert Management', href: '/alerts', icon: Bell, minimumRole: 'society_admin' },
      { name: 'Emergency Response', href: '/helpdesk', icon: Zap, minimumRole: 'society_admin' },
    ]
  },
  {
    label: "Society Administration",
    icon: Building2,
    items: [
      { name: 'Member Management', href: '/residents', icon: Users, minimumRole: 'society_admin' },
      { name: 'Staff Management', href: '/staff-management', icon: UserCog, minimumRole: 'society_admin' },
      { name: 'Communication Hub', href: '/announcements', icon: MessageCircle, minimumRole: 'society_admin' },
      { name: 'Event Management', href: '/events', icon: Calendar, minimumRole: 'society_admin' },
      { name: 'Amenity Management', href: '/amenity-management', icon: Gamepad2, minimumRole: 'society_admin' },
    ]
  },
  {
    label: "Financial Management",
    icon: DollarSign,
    items: [
      { name: 'Billing & Payments', href: '/billing', icon: CreditCard, minimumRole: 'society_admin' },
      { name: 'Maintenance Charges', href: '/maintenance-billing', icon: Receipt, minimumRole: 'society_admin' },
      { name: 'Expense Tracking', href: '/expense-tracker', icon: TrendingUp, minimumRole: 'society_admin' },
      { name: 'Financial Reports', href: '/financial-reports', icon: FileText, minimumRole: 'society_admin' },
      { name: 'SOS Service Billing', href: '/sos-service-billing', icon: Monitor, minimumRole: 'franchise_admin' },
    ]
  },
  {
    label: "Visitor Management",
    icon: UserCheck,
    items: [
      { name: 'Visitor Registration', href: '/visitors', icon: Users, minimumRole: 'society_admin' },
      { name: 'Check-in/Check-out', href: '/visitor-checkin', icon: ClipboardCheck, minimumRole: 'customer' },
      { name: 'Pre-approvals', href: '/pre-registrations', icon: UserPlus, minimumRole: 'society_admin' },
      { name: 'Host Management', href: '/hosts', icon: User, minimumRole: 'society_admin' },
    ]
  },
  {
    label: "System Administration",
    icon: Cog,
    items: [
      { name: 'User Management', href: '/users', icon: Users, minimumRole: 'platform_admin' },
      { name: 'Organization Setup', href: '/locations', icon: Building, minimumRole: 'platform_admin' },
      { name: 'Settings & Configuration', href: '/settings', icon: Settings, minimumRole: 'customer' },
      { name: 'Master Data Management', href: '/master-data-management', icon: Database, minimumRole: 'platform_admin' },
      { name: 'Support & Help', href: '/helpdesk', icon: HelpCircle, minimumRole: 'customer' },
    ]
  }
]

// MenuGroup component for rendering collapsible menu groups
const MenuGroup: React.FC<{
  group: typeof navigationGroups[0]
  isCollapsed: boolean
}> = ({ group, isCollapsed }) => {
  const { hasMinimumRole } = usePermissions()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(true)
  
  // Filter items based on user permissions (memoized)
  const accessibleItems = React.useMemo(() =>
    group.items.filter(item => hasMinimumRole(item.minimumRole as any)),
    [group.items, hasMinimumRole]
  )
  
  // Check if any item in this group is active (memoized)
  const isGroupActive = React.useMemo(() =>
    accessibleItems.some(item => 
      location.pathname === item.href || 
      (item.href !== '/' && location.pathname.startsWith(item.href))
    ),
    [accessibleItems, location.pathname]
  )

  // Auto-expand if group has active item
  React.useEffect(() => {
    if (isGroupActive) {
      setIsOpen(true)
    }
  }, [isGroupActive])
  
  // Don't render group if no accessible items (after all hooks are called)
  if (accessibleItems.length === 0) return null

  return (
    <SidebarGroup>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <SidebarGroupLabel className="group/label text-xs font-medium uppercase tracking-wider text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer flex items-center justify-between w-full p-2 rounded-md hover:bg-sidebar-accent">
            <div className="flex items-center">
              <group.icon className="mr-2 h-4 w-4" />
              {!isCollapsed && group.label}
            </div>
            {!isCollapsed && (
              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/label:rotate-180" />
            )}
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent className="transition-all duration-200 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <SidebarGroupContent>
            <SidebarMenu>
              {accessibleItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/' && location.pathname.startsWith(item.href))
                
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive} className="ml-4">
                      <Link to={item.href} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.name}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  )
}

// AppSidebar component
const AppSidebar: React.FC = () => {
  const { userProfile, signOut } = useAuth()
  const sidebar = useSidebar()
  const collapsed = sidebar.state === 'collapsed'

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'platform_admin': return 'destructive'
      case 'franchise_admin': return 'default'
      case 'society_admin': return 'secondary'
      default: return 'outline'
    }
  }

  const formatRoleName = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <Sidebar className="border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-sidebar-primary" />
            <span className="text-lg font-bold text-sidebar-foreground">SOS System</span>
          </div>
          <SidebarTrigger />
        </div>
        {!collapsed && userProfile && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {userProfile.full_name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium text-sidebar-foreground">
                  {userProfile.full_name}
                </p>
                <p className="text-xs text-sidebar-foreground/70">
                  {userProfile.email}
                </p>
                <Badge variant={getRoleBadgeVariant(userProfile.role || '')}>
                  {formatRoleName(userProfile.role || '')}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        {navigationGroups.map((group, index) => (
          <MenuGroup
            key={group.label}
            group={group}
            isCollapsed={collapsed}
          />
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export const DashboardLayoutNew = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ErrorBoundary>
          <AppSidebar />
        </ErrorBoundary>
        <ErrorBoundary>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </ErrorBoundary>
      </div>
    </SidebarProvider>
  )
}