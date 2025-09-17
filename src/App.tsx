import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PermissionProvider } from "@/contexts/PermissionContext";
import { SessionManager } from "@/components/auth/SessionManager";
import { useState, useEffect } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import { DataManagement } from "@/pages/DataManagement";
import Locations from "@/pages/Locations";
import Cameras from "@/pages/Cameras";
import Vehicles from "@/pages/Vehicles";
import Users from "@/pages/Users";
import Alerts from "@/pages/Alerts";
import Settings from "@/pages/Settings";
import Visitors from "@/pages/Visitors";
import VisitorCheckin from "@/pages/VisitorCheckin";
import VisitorDashboard from "@/pages/VisitorDashboard";
import Announcements from "@/pages/Announcements";
import Residents from "@/pages/Residents";
import AdminPortal from "@/pages/AdminPortal";
import HomeServices from "@/pages/HomeServices";
import SocietyManagement from "@/pages/SocietyManagement";
import AdvertiserManagement from "@/pages/AdvertiserManagement";
import SOSServiceBilling from "@/pages/SOSServiceBilling";
import MasterDataManagement from "@/pages/MasterDataManagement";
import Hosts from "@/pages/Hosts";
import PreRegistrations from "@/pages/PreRegistrations";
import ResidentPortal from "@/pages/ResidentPortal";
import AmenityManagement from "@/pages/AmenityManagement";
import CommunityForum from "@/pages/CommunityForum";
import MaintenanceBilling from "@/pages/MaintenanceBilling";
import Analytics from "@/pages/Analytics";
import Franchises from "@/pages/Franchises";
import ResetPassword from "@/pages/ResetPassword";
import Billing from "@/pages/Billing";
import StaffManagement from "@/pages/StaffManagement";
import HelpDesk from "@/pages/HelpDesk";
import EventManagement from "@/pages/EventManagement";
import AssetManagement from "@/pages/AssetManagement";
import ParkingManagement from "@/pages/ParkingManagement";
import DocumentManagement from "@/pages/DocumentManagement";
import RoutineManagement from "@/pages/RoutineManagement";
import SocietyManagementNew from "@/pages/SocietyManagementNew";
import SocietyManagementEnhanced from "@/pages/SocietyManagementEnhanced";
import SocietyMemberManagement from "@/pages/SocietyMemberManagement";
import GatekeeperModule from "@/pages/GatekeeperModule";
import GeneralLedger from "@/pages/GeneralLedger";
import IncomeTracker from "@/pages/IncomeTracker";
import ExpenseTracker from "@/pages/ExpenseTracker";
import BankCash from "@/pages/BankCash";
import UtilityTracker from "@/pages/UtilityTracker";
import AdvancedAmenityBooking from "@/pages/AdvancedAmenityBooking";
import { DashboardLayoutNew } from "@/components/layout/DashboardLayoutNew";
import SocietyManagementHub from "@/pages/hubs/SocietyManagementHub";
import FinancialManagementHub from "@/pages/hubs/FinancialManagementHub";
import OperationsHub from "@/pages/hubs/OperationsHub";
import VisitorManagementHub from "@/pages/hubs/VisitorManagementHub";
import SystemAdminHub from "@/pages/hubs/SystemAdminHub";
import { PlatformAdminDashboard } from "@/components/dashboard/PlatformAdminDashboard";
import { FranchiseAdminDashboard } from "@/components/dashboard/FranchiseAdminDashboard";
import { CustomerDashboard } from "@/components/dashboard/CustomerDashboard";
import { Button } from "@/components/ui/button"
import NotFound from "@/pages/NotFound"
import { NavigationProvider } from "@/contexts/NavigationContext"
import FinancialReports from "@/pages/FinancialReports"

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <DashboardLayoutNew>{children}</DashboardLayoutNew>;
};

const DashboardRouter = () => {
  const { userProfile, loading, user, profileError, forceRefresh } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  console.log('DashboardRouter state:', { 
    user: !!user, 
    userProfile: !!userProfile, 
    loading, 
    profileError,
    role: userProfile?.role 
  });
  
  // Set timeout for loading state
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.warn('Dashboard loading timeout - showing recovery options');
        setLoadingTimeout(true);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);

  const handleForceRefresh = async () => {
    setRefreshing(true);
    try {
      await forceRefresh();
    } catch (error) {
      console.error('Force refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !loadingTimeout) {
    console.log('DashboardRouter: Loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
          <p className="text-xs text-muted-foreground">Validating your session...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    console.log('DashboardRouter: No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }
  
  if (!userProfile || loadingTimeout || profileError) {
    console.log('DashboardRouter: Profile issue detected, showing recovery options');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Dashboard Loading Issue</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {profileError || (loadingTimeout 
                ? 'Loading timed out. Your session may need to be refreshed.' 
                : 'Unable to load your user profile.')}
            </p>
            {profileError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-4">
                <p className="text-xs text-destructive">{profileError}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Button 
              onClick={handleForceRefresh}
              disabled={refreshing}
              className="w-full"
            >
              {refreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Refreshing...
                </>
              ) : (
                'Force Refresh Session'
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Reload Page
            </Button>
            <Button 
              variant="ghost"
              onClick={() => window.location.href = '/auth'}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="text-xs text-muted-foreground cursor-pointer">Debug Info</summary>
              <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto">
{JSON.stringify({
  user: !!user,
  userProfile: !!userProfile,
  loading,
  profileError,
  loadingTimeout,
  userId: user?.id
}, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
  
  console.log('DashboardRouter: Rendering dashboard for role:', userProfile.role);
  
  switch (userProfile.role) {
    case 'platform_admin':
      return <PlatformAdminDashboard />;
    case 'franchise_admin':
      return <FranchiseAdminDashboard />;
    case 'customer_admin':
    case 'operator':
    case 'resident':
    case 'society_president':
    case 'society_secretary':
    case 'society_treasurer':
    case 'society_committee_member':
    case 'tenant':
    case 'owner':
    case 'family_member':
      return <CustomerDashboard />;
    default:
      console.error('DashboardRouter: Invalid role:', userProfile.role);
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold">Invalid Role</p>
            <p className="text-sm text-muted-foreground">Role: {userProfile.role}</p>
            <Button onClick={() => window.location.href = '/auth'}>
              Back to Login
            </Button>
          </div>
        </div>
      );
  }
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <PermissionProvider>
            <SessionManager timeoutMinutes={30} warningMinutes={5}>
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <NavigationProvider>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/data-management" 
              element={
                <ProtectedRoute>
                  <DataManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/master-data-management" 
              element={
                <RoleProtectedRoute minimumRole="customer_admin">
                  <ProtectedRoute>
                    <MasterDataManagement />
                  </ProtectedRoute>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/locations" 
              element={
                <RoleProtectedRoute permission="manage_locations">
                  <ProtectedRoute>
                    <Locations />
                  </ProtectedRoute>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/cameras" 
              element={
                <RoleProtectedRoute permission="manage_cameras">
                  <ProtectedRoute>
                    <Cameras />
                  </ProtectedRoute>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/vehicles" 
              element={
                <RoleProtectedRoute permission="manage_vehicles">
                  <ProtectedRoute>
                    <Vehicles />
                  </ProtectedRoute>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <RoleProtectedRoute permission="manage_users">
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/alerts" 
              element={
                <RoleProtectedRoute permission="manage_alerts">
                  <ProtectedRoute>
                    <Alerts />
                  </ProtectedRoute>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <RoleProtectedRoute permission="manage_settings">
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/visitors" 
              element={
                <ProtectedRoute>
                  <Visitors />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/visitor-checkin" 
              element={
                <ProtectedRoute>
                  <VisitorCheckin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/visitor-dashboard" 
              element={
                <ProtectedRoute>
                  <VisitorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/society-management" 
              element={
                <ProtectedRoute>
                  <SocietyManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/advertiser-management" 
              element={
                <ProtectedRoute>
                  <AdvertiserManagement />
                </ProtectedRoute>
              } 
            />
              <Route 
                path="/sos-service-billing" 
                element={
                  <ProtectedRoute>
                    <SOSServiceBilling />
                  </ProtectedRoute>
                } 
              />
            <Route
              path="/hosts" 
              element={
                <ProtectedRoute>
                  <Hosts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pre-registrations" 
              element={
                <ProtectedRoute>
                  <PreRegistrations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resident-portal" 
              element={
                <ProtectedRoute>
                  <ResidentPortal />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/amenity-management" 
              element={
                <ProtectedRoute>
                  <AmenityManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/community-forum" 
              element={
                <ProtectedRoute>
                  <CommunityForum />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/maintenance-billing" 
              element={
                <ProtectedRoute>
                  <MaintenanceBilling />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <RoleProtectedRoute permission="view_analytics">
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/franchises" 
              element={
                <ProtectedRoute>
                  <Franchises />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/billing" 
              element={
                <RoleProtectedRoute permission="manage_billing">
                  <ProtectedRoute>
                    <Billing />
                  </ProtectedRoute>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/staff-management" 
              element={
                <ProtectedRoute>
                  <StaffManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/helpdesk" 
              element={
                <ProtectedRoute>
                  <HelpDesk />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/events" 
              element={
                <ProtectedRoute>
                  <EventManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/platform-admin" 
              element={
                <RoleProtectedRoute minimumRole="platform_admin">
                  <ProtectedRoute>
                    <PlatformAdminDashboard />
                  </ProtectedRoute>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/financial-reports" 
              element={
                <RoleProtectedRoute permission="view_analytics">
                  <ProtectedRoute>
                    <FinancialReports />
                  </ProtectedRoute>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/society-member-management" 
              element={
                <RoleProtectedRoute permission="manage_residents">
                  <ProtectedRoute>
                    <SocietyMemberManagement />
                  </ProtectedRoute>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/announcements" 
              element={
                <ProtectedRoute>
                  <Announcements />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assets" 
              element={
                <ProtectedRoute>
                  <AssetManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/parking" 
              element={
                <ProtectedRoute>
                  <ParkingManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/documents" 
              element={
                <ProtectedRoute>
                  <DocumentManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/routine-management" 
              element={
                <ProtectedRoute>
                  <RoutineManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/society-management-new" 
              element={
                <ProtectedRoute>
                  <SocietyManagementNew />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/society-management-enhanced" 
              element={
                <ProtectedRoute>
                  <SocietyManagementEnhanced />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/society-books" 
              element={<Navigate to="/financial-hub?tab=books" replace />}
            />
            <Route 
              path="/gatekeeper" 
              element={
                <ProtectedRoute>
                  <GatekeeperModule />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/residents" 
              element={
                <ProtectedRoute>
                  <Residents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-portal" 
              element={
                <ProtectedRoute>
                  <AdminPortal />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/home-services" 
              element={
                <ProtectedRoute>
                  <HomeServices />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/society-books-management" 
              element={<Navigate to="/financial-hub?tab=books" replace />}
            />
            <Route 
              path="/general-ledger" 
              element={
                <ProtectedRoute>
                  <GeneralLedger />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/income-tracker" 
              element={
                <ProtectedRoute>
                  <IncomeTracker />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/expense-tracker" 
              element={
                <ProtectedRoute>
                  <ExpenseTracker />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bank-cash" 
              element={
                <ProtectedRoute>
                  <BankCash />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/utility-tracker" 
              element={
                <ProtectedRoute>
                  <UtilityTracker />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/advanced-amenity-booking" 
              element={
                <ProtectedRoute>
                  <AdvancedAmenityBooking />
                </ProtectedRoute>
              } 
            />
            {/* Hub Pages */}
            <Route 
              path="/society-hub" 
              element={
                <ProtectedRoute>
                  <SocietyManagementHub />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/financial-hub" 
              element={
                <ProtectedRoute>
                  <FinancialManagementHub />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/operations-hub" 
              element={
                <ProtectedRoute>
                  <OperationsHub />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/visitor-hub" 
              element={
                <ProtectedRoute>
                  <VisitorManagementHub />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-hub" 
              element={
                <ProtectedRoute>
                  <SystemAdminHub />
                </ProtectedRoute>
              } 
            />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
            </Routes>
                </NavigationProvider>
              </BrowserRouter>
            </SessionManager>
          </PermissionProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
