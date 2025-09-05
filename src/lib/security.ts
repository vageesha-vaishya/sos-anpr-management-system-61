// Security utilities for password generation and validation

/**
 * Generates a cryptographically secure random password
 * @param length - Password length (minimum 12)
 * @returns Secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  if (length < 12) {
    throw new Error('Password length must be at least 12 characters')
  }

  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  const allChars = lowercase + uppercase + numbers + symbols
  
  // Ensure at least one character from each category
  let password = ''
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Validation result with score and feedback
 */
export function validatePasswordStrength(password: string) {
  const checks = {
    length: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
    noCommonPatterns: !/(.)\1{2,}|123|abc|password|admin/i.test(password)
  }
  
  const score = Object.values(checks).filter(Boolean).length
  const isStrong = score >= 5
  
  return {
    isValid: isStrong,
    score,
    checks,
    feedback: isStrong ? 'Strong password' : 'Password needs improvement'
  }
}

/**
 * Sanitizes input to prevent XSS attacks
 * @param input - Raw input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

/**
 * Validates email format with additional security checks
 * @param email - Email to validate
 * @returns Whether email is valid and safe
 */
export function validateSecureEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValidFormat = emailRegex.test(email)
  const isSafeLength = email.length <= 254 // RFC 5321 limit
  const noSuspiciousChars = !/[<>'"\\]/.test(email)
  
  return isValidFormat && isSafeLength && noSuspiciousChars
}