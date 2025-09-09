import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
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

const MenuGroup = ({ title, items, userRole, currentPath }: {
  title: string
  items: any[]
  userRole: string
  currentPath: string
}) => {
  const [isOpen, setIsOpen] = useState(true)
  const filteredItems = items.filter(item => item.roles.includes(userRole))
  
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

  // Organized navigation structure
  const navigationGroups = {
    dashboard: {
      title: "Core Dashboards",
      items: [
        { name: 'Dashboard Hub', href: '/dashboard', icon: LayoutDashboard, roles: ['platform_admin', 'franchise_admin', 'customer_admin'], isNew: false },
        { name: 'Analytics Dashboard', href: '/analytics', icon: TrendingUp, roles: ['platform_admin', 'franchise_admin', 'customer_admin', 'society_president'], isNew: true },
      ]
    },
    society: {
      title: "Society Management",
      items: [
        { name: 'Society Hub', href: '/society-hub', icon: Home, roles: ['platform_admin', 'franchise_admin', 'customer_admin', 'society_president', 'society_secretary'], isNew: true },
        { name: 'Member Management', href: '/society-member-management', icon: Users, roles: ['platform_admin', 'franchise_admin', 'customer_admin', 'society_president', 'society_secretary'], isNew: true },
        { name: 'Staff Management', href: '/staff-management', icon: Users, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Communication Hub', href: '/community-forum', icon: MessageSquare, roles: ['platform_admin', 'franchise_admin', 'customer_admin', 'society_president', 'society_secretary'], isNew: true },
      ]
    },
    financial: {
      title: "Financial Management",
      items: [
        { name: 'Financial Hub', href: '/financial-hub', icon: DollarSign, roles: ['platform_admin', 'franchise_admin', 'customer_admin', 'society_treasurer'], isNew: true },
        { name: 'Maintenance Billing', href: '/maintenance-billing', icon: DollarSign, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'General Ledger', href: '/general-ledger', icon: DollarSign, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Income Tracker', href: '/income-tracker', icon: TrendingUp, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Expense Tracker', href: '/expense-tracker', icon: DollarSign, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Bank & Cash', href: '/bank-cash', icon: DollarSign, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Utility Tracker', href: '/utility-tracker', icon: DollarSign, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
      ]
    },
    operations: {
      title: "Operations",
      items: [
        { name: 'Routine Management', href: '/routine-management', icon: Shield, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Gatekeeper Module', href: '/gatekeeper', icon: Shield, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Security & Alerts', href: '/alerts', icon: Bell, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Amenity Management', href: '/amenity-management', icon: Home, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Event Management', href: '/events', icon: Home, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Asset Management', href: '/assets', icon: Home, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Parking Management', href: '/parking', icon: Home, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Vehicle Management', href: '/vehicles', icon: Shield, roles: ['franchise_admin', 'customer_admin'] },
      ]
    },
    visitors: {
      title: "Visitor Management System",
      items: [
        { name: 'Visitor Hub', href: '/visitor-hub', icon: Monitor, roles: ['platform_admin', 'franchise_admin', 'customer_admin'], isNew: true },
        { name: 'Visitor Dashboard', href: '/visitor-dashboard', icon: Monitor, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Check-in Kiosk', href: '/visitor-checkin', icon: UserCheck, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Hosts Management', href: '/hosts', icon: Users, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Pre-Registrations', href: '/pre-registrations', icon: Users, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Visitors', href: '/visitors', icon: Users, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
      ]
    },
    admin: {
      title: "System Administration",
      items: [
        { name: 'Admin Hub', href: '/admin-hub', icon: Globe, roles: ['platform_admin', 'franchise_admin'], isNew: true },
        { name: 'Data Management', href: '/data-management', icon: Globe, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Master Data Management', href: '/master-data-management', icon: Globe, roles: ['platform_admin', 'franchise_admin'] },
        { name: 'User Management', href: '/users', icon: Users, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Franchise Management', href: '/franchises', icon: Building2, roles: ['platform_admin'] },
        { name: 'Camera Management', href: '/cameras', icon: Camera, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Location Management', href: '/locations', icon: MapPin, roles: ['platform_admin', 'franchise_admin'] },
        { name: 'ANPR Billing', href: '/anpr-service-billing', icon: Camera, roles: ['platform_admin', 'franchise_admin'] },
        { name: 'Advertiser Management', href: '/advertiser-management', icon: TrendingUp, roles: ['platform_admin', 'franchise_admin'] },
        { name: 'Financial Management', href: '/billing', icon: DollarSign, roles: ['platform_admin', 'franchise_admin'] },
      ]
    },
    support: {
      title: "Support & Documents",
      items: [
        { name: 'Help Desk', href: '/helpdesk', icon: Headphones, roles: ['platform_admin', 'franchise_admin', 'customer_admin', 'operator', 'resident'] },
        { name: 'Document Management', href: '/documents', icon: FileText, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
        { name: 'Settings', href: '/settings', icon: Settings, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
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
            userRole={userProfile?.role || ''}
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