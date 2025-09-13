import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface NavigationState {
  breadcrumbs: Array<{
    label: string;
    path: string;
    timestamp: number;
  }>;
  previousPage: {
    label: string;
    path: string;
  } | null;
  formStates: Record<string, any>;
  filterStates: Record<string, any>;
}

interface NavigationContextType {
  navigationState: NavigationState;
  addBreadcrumb: (label: string, path: string) => void;
  goBack: () => void;
  saveFormState: (pageKey: string, formData: any) => void;
  getFormState: (pageKey: string) => any;
  saveFilterState: (pageKey: string, filterData: any) => void;
  getFilterState: (pageKey: string) => any;
  clearNavigationState: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const STORAGE_KEY = 'sos_navigation_state';

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [navigationState, setNavigationState] = useState<NavigationState>(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      breadcrumbs: [],
      previousPage: null,
      formStates: {},
      filterStates: {}
    };
  });

  // Save to session storage whenever state changes
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(navigationState));
  }, [navigationState]);

  // Route labels mapping
  const routeLabels: Record<string, string> = {
    '/': 'SOS Dashboard',
    '/society-admin': 'Society Dashboard',
    '/franchise-admin': 'Franchise Dashboard',
    '/platform-admin': 'Platform Dashboard',
    '/analytics': 'Analytics & Reports',
    '/alerts': 'Alert Management',
    '/society-management': 'Society Administration',
    '/residents': 'Member Management',
    '/staff-management': 'Staff Management',
    '/billing': 'Billing & Payments',
    '/maintenance-billing': 'Maintenance Charges',
    '/expense-tracker': 'Expense Tracking',
    '/visitors': 'Visitor Management',
    '/visitor-checkin': 'Visitor Check-in',
    '/pre-registrations': 'Pre-approvals',
    '/hosts': 'Host Management',
    '/cameras': 'Security & Monitoring',
    '/vehicles': 'Access Control',
    '/amenity-management': 'Amenity Management',
    '/event-management': 'Event Management',
    '/announcements': 'Communication Hub',
    '/users': 'User Management',
    '/settings': 'Settings & Configuration',
    '/help-desk': 'Support & Help',
    '/sos-service-billing': 'SOS Service Billing',
    '/organizations': 'Organization Setup',
  };

  const addBreadcrumb = (label: string, path: string) => {
    setNavigationState(prev => {
      const newBreadcrumb = { label, path, timestamp: Date.now() };
      const filteredBreadcrumbs = prev.breadcrumbs.filter(b => b.path !== path);
      
      return {
        ...prev,
        breadcrumbs: [...filteredBreadcrumbs, newBreadcrumb].slice(-5), // Keep last 5
        previousPage: prev.breadcrumbs.length > 0 ? {
          label: prev.breadcrumbs[prev.breadcrumbs.length - 1].label,
          path: prev.breadcrumbs[prev.breadcrumbs.length - 1].path
        } : null
      };
    });
  };

  const goBack = () => {
    if (navigationState.previousPage) {
      window.history.back();
    }
  };

  const saveFormState = (pageKey: string, formData: any) => {
    setNavigationState(prev => ({
      ...prev,
      formStates: {
        ...prev.formStates,
        [pageKey]: formData
      }
    }));
  };

  const getFormState = (pageKey: string) => {
    return navigationState.formStates[pageKey] || null;
  };

  const saveFilterState = (pageKey: string, filterData: any) => {
    setNavigationState(prev => ({
      ...prev,
      filterStates: {
        ...prev.filterStates,
        [pageKey]: filterData
      }
    }));
  };

  const getFilterState = (pageKey: string) => {
    return navigationState.filterStates[pageKey] || null;
  };

  const clearNavigationState = () => {
    setNavigationState({
      breadcrumbs: [],
      previousPage: null,
      formStates: {},
      filterStates: {}
    });
    sessionStorage.removeItem(STORAGE_KEY);
  };

  // Auto-add breadcrumb when location changes
  useEffect(() => {
    const currentLabel = routeLabels[location.pathname] || location.pathname;
    addBreadcrumb(currentLabel, location.pathname);
  }, [location.pathname]);

  return (
    <NavigationContext.Provider value={{
      navigationState,
      addBreadcrumb,
      goBack,
      saveFormState,
      getFormState,
      saveFilterState,
      getFilterState,
      clearNavigationState
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};