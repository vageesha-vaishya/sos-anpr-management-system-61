import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
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
  Menu,
  X,
  Database,
  UserCheck,
  Calendar,
  UserPlus,
  Monitor,
  Globe,
  Building2,
  DollarSign,
  Home,
  TrendingUp,
  MessageSquare,
  CalendarDays,
  CreditCard,
  User,
  UserCog,
  Headphones,
  Package,
  Car,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { userProfile, signOut, signingOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navRef = useRef<HTMLElement>(null)

  // Keyboard navigation for sidebar
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!navRef.current) return
    
    const scrollAmount = 100
    const pageScrollAmount = navRef.current.clientHeight - 50
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        navRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' })
        break
      case 'ArrowUp':
        e.preventDefault()
        navRef.current.scrollBy({ top: -scrollAmount, behavior: 'smooth' })
        break
      case 'PageDown':
        e.preventDefault()
        navRef.current.scrollBy({ top: pageScrollAmount, behavior: 'smooth' })
        break
      case 'PageUp':
        e.preventDefault()
        navRef.current.scrollBy({ top: -pageScrollAmount, behavior: 'smooth' })
        break
      case 'Home':
        e.preventDefault()
        navRef.current.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'End':
        e.preventDefault()
        navRef.current.scrollTo({ top: navRef.current.scrollHeight, behavior: 'smooth' })
        break
    }
  }

  const navigation = [
    { name: 'Dashboard Hub', href: '/dashboard', icon: LayoutDashboard, roles: ['platform_admin', 'franchise_admin', 'customer_admin'], isNew: true },
    
    // 🚀 Enhanced Phase 1 Features
    { name: '⭐ Enhanced Society Mgmt', href: '/society-management-enhanced', icon: Home, roles: ['platform_admin', 'franchise_admin', 'customer_admin', 'society_president', 'society_secretary'], isNew: true },
    { name: '👥 Member Management', href: '/society-member-management', icon: Users, roles: ['platform_admin', 'franchise_admin', 'customer_admin', 'society_president', 'society_secretary'], isNew: true },
    { name: '💰 Financial Management', href: '/society-books', icon: DollarSign, roles: ['platform_admin', 'franchise_admin', 'customer_admin', 'society_treasurer'], isNew: true },
    { name: '📢 Communication Hub', href: '/community-forum', icon: MessageSquare, roles: ['platform_admin', 'franchise_admin', 'customer_admin', 'society_president', 'society_secretary'], isNew: true },
    { name: '📊 Analytics Dashboard', href: '/analytics', icon: TrendingUp, roles: ['platform_admin', 'franchise_admin', 'customer_admin', 'society_president'], isNew: true },
    
    // Core Society Management Modules
    { name: '🏠 Routine Management', href: '/routine-management', icon: Users, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
    { name: '🏢 Society Management', href: '/society-management-new', icon: Home, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
    { name: '🛡️ Gatekeeper Module', href: '/gatekeeper', icon: Shield, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
    
    // Individual Module Access (Existing Features)
    { name: 'Resident Portal', href: '/resident-portal', icon: User, roles: ['customer_admin', 'customer_user'] },
    { name: 'Community Forum', href: '/community-forum', icon: MessageSquare, roles: ['platform_admin', 'franchise_admin', 'customer_admin', 'customer_user'] },
    { name: 'Amenity Management', href: '/amenity-management', icon: CalendarDays, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
    { name: 'Help Desk', href: '/helpdesk', icon: Headphones, roles: ['platform_admin', 'franchise_admin', 'customer_admin', 'operator', 'resident'] },
    { name: 'Events', href: '/events', icon: Calendar, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
    { name: 'Assets', href: '/assets', icon: Package, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
    { name: 'Parking', href: '/parking', icon: Car, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
    { name: 'Documents', href: '/documents', icon: FileText, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
    { name: 'Staff Management', href: '/staff-management', icon: UserCog, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
    
    // System Management
    { name: 'Data Management', href: '/data-management', icon: Database, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
    { name: 'Master Data Management', href: '/master-data-management', icon: Globe, roles: ['platform_admin', 'franchise_admin'] },
    { name: 'Maintenance Billing', href: '/maintenance-billing', icon: CreditCard, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
    { name: 'Financial Management', href: '/billing', icon: DollarSign, roles: ['platform_admin', 'franchise_admin'] },
    { name: 'ANPR Service Billing', href: '/anpr-service-billing', icon: Camera, roles: ['platform_admin', 'franchise_admin'] },
    { name: 'Legacy Society Mgmt', href: '/society-management', icon: Home, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
    { name: 'Advertiser Management', href: '/advertiser-management', icon: TrendingUp, roles: ['platform_admin', 'franchise_admin'] },
    { name: 'Franchises', href: '/franchises', icon: Building2, roles: ['platform_admin'] },
    { name: 'Locations', href: '/locations', icon: MapPin, roles: ['platform_admin', 'franchise_admin'] },
    { name: 'Cameras', href: '/cameras', icon: Camera, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
    { name: 'Vehicles', href: '/vehicles', icon: Shield, roles: ['franchise_admin', 'customer_admin'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['platform_admin', 'franchise_admin', 'customer_admin', 'society_president', 'society_secretary'] },
    { name: 'Alerts', href: '/alerts', icon: Bell, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
    
    // VMS Navigation Items
    { name: 'Visitor Dashboard', href: '/visitor-dashboard', icon: Monitor, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
    { name: 'Visitors', href: '/visitors', icon: Users, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
    { name: 'Check-in Kiosk', href: '/visitor-checkin', icon: UserCheck, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
    { name: 'Hosts', href: '/hosts', icon: UserPlus, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
    { name: 'Pre-Registrations', href: '/pre-registrations', icon: Calendar, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['platform_admin', 'franchise_admin', 'customer_admin'] },
  ]

  const filteredNavigation = navigation.filter(item => 
    userProfile?.role && item.roles.includes(userProfile.role)
  )

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
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-0 relative overflow-hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Glossy overlay effect */}
        <div 
          className="absolute inset-0 bg-sidebar-glossy pointer-events-none"
          style={{
            background: `linear-gradient(135deg, hsla(var(--sidebar-glossy)) 0%, transparent 50%, hsla(var(--sidebar-glossy)) 100%)`
          }}
        />
        {/* Shadow overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 20px hsla(var(--sidebar-shadow))`
          }}
        />
        <div className="flex flex-col h-full relative z-10">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-sidebar-primary" />
              <span className="text-lg font-bold text-sidebar-foreground">ADDA System</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
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

          {/* Navigation */}
          <nav 
            ref={navRef}
            className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide focus:outline-none"
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground relative",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                  asChild
                >
                  <Link to={item.href}>
                    <item.icon className="w-5 h-5 mr-3" />
                    <span className="flex-1 text-left">{item.name}</span>
                    {(item as any).isNew && (
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        NEW
                      </Badge>
                    )}
                  </Link>
                </Button>
              )
            })}
          </nav>

          {/* Sign out button */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={signOut}
              disabled={signingOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              {signingOut ? "Signing Out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="hidden sm:inline-flex">
                {userProfile?.status === 'active' ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}