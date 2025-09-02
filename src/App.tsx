import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
import SocietyManagement from "@/pages/SocietyManagement";
import AdvertiserManagement from "@/pages/AdvertiserManagement";
import ANPRServiceBilling from "@/pages/ANPRServiceBilling";
import MasterDataManagement from "@/pages/MasterDataManagement";
import Hosts from "@/pages/Hosts";
import PreRegistrations from "@/pages/PreRegistrations";
import Analytics from "@/pages/Analytics";
import Franchises from "@/pages/Franchises";
import ResetPassword from "@/pages/ResetPassword";
import Billing from "@/pages/Billing";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlatformAdminDashboard } from "@/components/dashboard/PlatformAdminDashboard";
import { FranchiseAdminDashboard } from "@/components/dashboard/FranchiseAdminDashboard";
import { CustomerDashboard } from "@/components/dashboard/CustomerDashboard";
import { Button } from "@/components/ui/button"
import NotFound from "@/pages/NotFound"

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
  
  return <DashboardLayout>{children}</DashboardLayout>;
};

const DashboardRouter = () => {
  const { userProfile, loading, user } = useAuth();
  
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
  
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  switch (userProfile.role) {
    case 'platform_admin':
      return <PlatformAdminDashboard />;
    case 'franchise_admin':
    case 'franchise_user':
      return <FranchiseAdminDashboard />;
    case 'customer_admin':
    case 'customer_user':
      return <CustomerDashboard />;
    default:
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
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
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
                <ProtectedRoute>
                  <MasterDataManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/locations" 
              element={
                <ProtectedRoute>
                  <Locations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cameras" 
              element={
                <ProtectedRoute>
                  <Cameras />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vehicles" 
              element={
                <ProtectedRoute>
                  <Vehicles />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/alerts" 
              element={
                <ProtectedRoute>
                  <Alerts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
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
              path="/anpr-service-billing" 
              element={
                <ProtectedRoute>
                  <ANPRServiceBilling />
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
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
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
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              } 
            />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
