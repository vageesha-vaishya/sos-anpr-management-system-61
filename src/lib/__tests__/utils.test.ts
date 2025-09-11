import { cn, formatRoleName } from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
    });

    it('should handle conditional classes', () => {
      expect(cn('px-4', true && 'py-2', false && 'hidden')).toBe('px-4 py-2');
    });

    it('should resolve Tailwind conflicts', () => {
      expect(cn('px-4 px-6')).toBe('px-6');
    });

    it('should handle empty inputs', () => {
      expect(cn()).toBe('');
      expect(cn('', null, undefined)).toBe('');
    });

    it('should handle arrays', () => {
      expect(cn(['px-4', 'py-2'], 'text-center')).toBe('px-4 py-2 text-center');
    });

    it('should handle objects', () => {
      expect(cn({
        'px-4': true,
        'py-2': false,
        'text-center': true
      })).toBe('px-4 text-center');
    });
  });

  describe('formatRoleName', () => {
    it('should format single word roles', () => {
      expect(formatRoleName('admin')).toBe('Admin');
      expect(formatRoleName('user')).toBe('User');
    });

    it('should format multi-word roles with underscores', () => {
      expect(formatRoleName('society_admin')).toBe('Society Admin');
      expect(formatRoleName('franchise_admin')).toBe('Franchise Admin');
      expect(formatRoleName('platform_admin')).toBe('Platform Admin');
    });

    it('should handle roles with multiple underscores', () => {
      expect(formatRoleName('super_user_admin')).toBe('Super User Admin');
    });

    it('should handle empty string', () => {
      expect(formatRoleName('')).toBe('');
    });

    it('should handle roles without underscores', () => {
      expect(formatRoleName('resident')).toBe('Resident');
      expect(formatRoleName('staff')).toBe('Staff');
    });

    it('should preserve capitalization patterns', () => {
      expect(formatRoleName('api_admin')).toBe('Api Admin');
      expect(formatRoleName('API_ADMIN')).toBe('API ADMIN');
    });
  });
});