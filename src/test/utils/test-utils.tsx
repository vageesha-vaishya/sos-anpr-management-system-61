import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';

// Mock AuthProvider for testing
const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockAuthValue = {
    user: null,
    userProfile: null,
    session: null,
    loading: false,
    signingOut: false,
    profileError: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    updateProfile: jest.fn(),
    forceRefresh: jest.fn(),
  };

  return <div data-testid="mock-auth-provider">{children}</div>;
};

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <MockAuthProvider>
          {children}
          <Toaster />
        </MockAuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'mock-user-id',
  email: 'test@example.com',
  email_confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockProfile = (overrides = {}) => ({
  id: 'mock-profile-id',
  user_id: 'mock-user-id',
  full_name: 'Test User',
  role: 'society_admin',
  permissions: [],
  organization_id: 'mock-org-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockOrganization = (overrides = {}) => ({
  id: 'mock-org-id',
  name: 'Test Organization',
  type: 'society',
  address: '123 Test St',
  city: 'Test City',
  state: 'Test State',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});