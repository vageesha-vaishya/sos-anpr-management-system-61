import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions, Permission } from '@/hooks/usePermissions'
import { Badge } from '@/components/ui/badge'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  Camera, 
  MapPin, 
  Shield, 
  Bell,
  LogOut,
  Home,
  DollarSign,
  TrendingUp,
  MessageSquare,
  UserCheck,
  Monitor,
  Globe,
  Building2,
  Headphones,
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const MenuGroup = ({ title, items, currentPath }: {
  title: string
  items: any[]
  currentPath: string
}) => {
  const [isOpen, setIsOpen] = useState(true)
  const { hasPermission, hasAnyPermission, hasMinimumRole, role } = usePermissions()
  
  const filteredItems = items.filter(item => {
    // Check permissions first
    if (item.permissions) {
      return item.requireAll 
        ? item.permissions.every((p: Permission) => hasPermission(p))
        : hasAnyPermission(item.permissions)
    }
    
    // Check minimum role
    if (item.minimumRole) {
      return hasMinimumRole(item.minimumRole)
    }
    
    // Fallback to role-based filtering for backward compatibility
    if (item.roles && role) {
      return item.roles.includes(role)
    }
    
    return false
  })
  
  if (filteredItems.length === 0) return null

  const hasActiveItem = filteredItems.some(item => currentPath === item.href)

  return (
    <SidebarGroup>
      <SidebarGroupLabel 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        {title}
        {filteredItems.some(item => item.isNew) && (
          <Badge variant="secondary" className="text-[10px] px-1 py-0">NEW</Badge>
        )}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {filteredItems.map((item) => {
            const isActive = currentPath === item.href
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link to={item.href}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    {item.isNew && (
                      <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-auto">
                        NEW
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

const AppSidebar = () => {
  const { userProfile, signOut, signingOut } = useAuth()
  const location = useLocation()

  // Organized navigation structure with permission-based filtering
  const navigationGroups = {
    dashboard: {
      title: "Core Dashboards",
      items: [
        { name: 'Dashboard Hub', href: '/dashboard', icon: LayoutDashboard, permissions: ['view_dashboard'], isNew: false },
        { name: 'Analytics Dashboard', href: '/analytics', icon: TrendingUp, permissions: ['view_analytics'], isNew: true },
      ]
    },
    society: {
      title: "Society Management",
      items: [
        { name: 'Society Hub', href: '/society-hub', icon: Home, permissions: ['manage_residents'], isNew: true },
        { name: 'Member Management', href: '/society-member-management', icon: Users, permissions: ['manage_residents'], isNew: true },
        { name: 'Staff Management', href: '/staff-management', icon: Users, permissions: ['manage_staff'], isNew: true },
        { name: 'Communication Hub', href: '/community-forum', icon: MessageSquare, permissions: ['manage_residents'], isNew: true },
      ]
    },
    financial: {
      title: "Financial Management",
      items: [
        { name: 'Financial Hub', href: '/financial-hub', icon: DollarSign, permissions: ['manage_finances'], isNew: true },
        { name: 'Maintenance Billing', href: '/maintenance-billing', icon: DollarSign, permissions: ['manage_billing'], isNew: true },
        { name: 'General Ledger', href: '/general-ledger', icon: DollarSign, permissions: ['manage_finances'], isNew: true },
        { name: 'Income Tracker', href: '/income-tracker', icon: TrendingUp, permissions: ['manage_finances'], isNew: true },
        { name: 'Expense Tracker', href: '/expense-tracker', icon: DollarSign, permissions: ['manage_finances'], isNew: true },
        { name: 'Bank & Cash', href: '/bank-cash', icon: DollarSign, permissions: ['manage_finances'], isNew: true },
        { name: 'Utility Tracker', href: '/utility-tracker', icon: DollarSign, permissions: ['manage_finances'], isNew: true },
      ]
    },
    operations: {
      title: "Operations",
      items: [
        { name: 'Routine Management', href: '/routine-management', icon: Shield, minimumRole: 'customer_admin' },
        { name: 'Gatekeeper Module', href: '/gatekeeper', icon: Shield, minimumRole: 'customer_admin' },
        { name: 'Security & Alerts', href: '/alerts', icon: Bell, permissions: ['manage_alerts'] },
        { name: 'Amenity Management', href: '/amenity-management', icon: Home, permissions: ['manage_amenities'] },
        { name: 'Event Management', href: '/events', icon: Home, permissions: ['manage_events'] },
        { name: 'Asset Management', href: '/assets', icon: Home, minimumRole: 'customer_admin' },
        { name: 'Parking Management', href: '/parking', icon: Home, minimumRole: 'customer_admin' },
        { name: 'Vehicle Management', href: '/vehicles', icon: Shield, permissions: ['manage_vehicles'] },
      ]
    },
    visitors: {
      title: "Visitor Management System",
      items: [
        { name: 'Visitor Hub', href: '/visitor-hub', icon: Monitor, permissions: ['manage_visitors'], isNew: true },
        { name: 'Visitor Dashboard', href: '/visitor-dashboard', icon: Monitor, permissions: ['manage_visitors'] },
        { name: 'Check-in Kiosk', href: '/visitor-checkin', icon: UserCheck, permissions: ['manage_visitors'] },
        { name: 'Hosts Management', href: '/hosts', icon: Users, permissions: ['manage_visitors'] },
        { name: 'Pre-Registrations', href: '/pre-registrations', icon: Users, permissions: ['manage_visitors'] },
        { name: 'Visitors', href: '/visitors', icon: Users, permissions: ['manage_visitors'] },
      ]
    },
    admin: {
      title: "System Administration",
      items: [
        { name: 'Admin Hub', href: '/admin-hub', icon: Globe, minimumRole: 'franchise_admin', isNew: true },
        { name: 'Data Management', href: '/data-management', icon: Globe, minimumRole: 'customer_admin' },
        { name: 'Master Data Management', href: '/master-data-management', icon: Globe, minimumRole: 'franchise_admin' },
        { name: 'User Management', href: '/users', icon: Users, permissions: ['manage_users'] },
        { name: 'Franchise Management', href: '/franchises', icon: Building2, permissions: ['manage_organizations'] },
        { name: 'Camera Management', href: '/cameras', icon: Camera, permissions: ['manage_cameras'] },
        { name: 'Location Management', href: '/locations', icon: MapPin, permissions: ['manage_locations'] },
        { name: 'ANPR Billing', href: '/anpr-service-billing', icon: Camera, minimumRole: 'franchise_admin' },
        { name: 'Advertiser Management', href: '/advertiser-management', icon: TrendingUp, minimumRole: 'franchise_admin' },
        { name: 'Financial Management', href: '/billing', icon: DollarSign, permissions: ['manage_billing'] },
      ]
    },
    support: {
      title: "Support & Documents",
      items: [
        { name: 'Help Desk', href: '/helpdesk', icon: Headphones, permissions: ['view_dashboard'] },
        { name: 'Document Management', href: '/documents', icon: FileText, permissions: ['manage_documents'] },
        { name: 'Settings', href: '/settings', icon: Settings, permissions: ['manage_settings'] },
      ]
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'platform_admin': return 'destructive'
      case 'franchise_admin': return 'default'
      case 'customer_admin': return 'secondary'
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
            <span className="text-lg font-bold text-sidebar-foreground">ADDA System</span>
          </div>
          <SidebarTrigger />
        </div>
        {/* User info */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="space-y-2">
            <p className="text-sm font-medium text-sidebar-foreground">
              {userProfile?.full_name}
            </p>
            <p className="text-xs text-sidebar-foreground/70">
              {userProfile?.email}
            </p>
            <Badge variant={getRoleBadgeVariant(userProfile?.role || '')}>
              {formatRoleName(userProfile?.role || '')}
            </Badge>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        {Object.entries(navigationGroups).map(([key, group]) => (
          <MenuGroup
            key={key}
            title={group.title}
            items={group.items}
            currentPath={location.pathname}
          />
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} disabled={signingOut}>
              <LogOut className="w-4 h-4" />
              <span>{signingOut ? "Signing Out..." : "Sign Out"}</span>
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
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}