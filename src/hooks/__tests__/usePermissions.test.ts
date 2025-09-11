import { renderHook } from '@testing-library/react';
import { usePermissions, hasPermission, hasMinimumRole, ROLE_HIERARCHY, ROLE_PERMISSIONS } from '../usePermissions';
import { createMockProfile } from '@/test/utils/test-utils';

// Mock useAuth
const mockUseAuth = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('usePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hasPermission', () => {
    it('should return true for platform admin with any permission', () => {
      expect(hasPermission('platform_admin', [], 'manage_users')).toBe(true);
      expect(hasPermission('platform_admin', [], 'view_analytics')).toBe(true);
    });

    it('should return true when user has wildcard permission', () => {
      expect(hasPermission('customer_admin', ['*'], 'manage_users')).toBe(true);
    });

    it('should return true when user has specific permission', () => {
      expect(hasPermission('customer_admin', ['manage_users'], 'manage_users')).toBe(true);
    });

    it('should return true when permission is included in role permissions', () => {
      expect(hasPermission('customer_admin', [], 'manage_users')).toBe(true);
    });

    it('should return false when user lacks permission', () => {
      expect(hasPermission('resident', [], 'manage_users')).toBe(false);
      expect(hasPermission('resident', ['view_dashboard'], 'manage_users')).toBe(false);
    });

    it('should return false for null role and no permissions', () => {
      expect(hasPermission(null, [], 'manage_users')).toBe(false);
      expect(hasPermission(null, null, 'manage_users')).toBe(false);
    });
  });

  describe('hasMinimumRole', () => {
    it('should return true when user role meets minimum requirement', () => {
      expect(hasMinimumRole('platform_admin', 'customer_admin')).toBe(true);
      expect(hasMinimumRole('customer_admin', 'customer_admin')).toBe(true);
      expect(hasMinimumRole('franchise_admin', 'customer_admin')).toBe(true);
    });

    it('should return false when user role is below minimum requirement', () => {
      expect(hasMinimumRole('resident', 'customer_admin')).toBe(false);
      expect(hasMinimumRole('security_staff', 'customer_admin')).toBe(false);
    });

    it('should return false for null role', () => {
      expect(hasMinimumRole(null, 'customer_admin')).toBe(false);
    });
  });

  describe('usePermissions hook', () => {
    it('should return correct permissions for authenticated user', () => {
      const mockProfile = createMockProfile({
        role: 'customer_admin',
        permissions: ['view_analytics'],
      });

      mockUseAuth.mockReturnValue({
        userProfile: mockProfile,
        loading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.isAdmin).toBe(true);
      expect(result.current.canManageUsers).toBe(true);
      expect(result.current.hasPermission('manage_users')).toBe(true);
      expect(result.current.hasPermission('view_analytics')).toBe(true);
      expect(result.current.hasMinimumRole('resident')).toBe(true);
    });

    it('should return false permissions for unauthenticated user', () => {
      mockUseAuth.mockReturnValue({
        userProfile: null,
        loading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.canManageUsers).toBe(false);
      expect(result.current.hasPermission('manage_users')).toBe(false);
      expect(result.current.hasMinimumRole('resident')).toBe(false);
    });

    it('should handle loading state', () => {
      mockUseAuth.mockReturnValue({
        userProfile: null,
        loading: true,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.isAdmin).toBe(false);
    });
  });

  describe('Role hierarchy', () => {
    it('should have correct role levels', () => {
      expect(ROLE_HIERARCHY.platform_admin).toBeGreaterThan(ROLE_HIERARCHY.franchise_admin);
      expect(ROLE_HIERARCHY.franchise_admin).toBeGreaterThan(ROLE_HIERARCHY.customer_admin);
      expect(ROLE_HIERARCHY.customer_admin).toBeGreaterThan(ROLE_HIERARCHY.security_staff);
      expect(ROLE_HIERARCHY.security_staff).toBeGreaterThan(ROLE_HIERARCHY.resident);
    });
  });

  describe('Role permissions', () => {
    it('should include expected permissions for each role', () => {
      expect(ROLE_PERMISSIONS.platform_admin).toContain('*');
      expect(ROLE_PERMISSIONS.customer_admin).toContain('manage_society');
      expect(ROLE_PERMISSIONS.resident).toContain('view_dashboard');
    });
  });
});