// Helper functions for theme color generation
export function generateColorVariants(baseColor: string): {
  light: string
  dark: string
  glow: string
} {
  // Parse HSL values
  const match = baseColor.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/)
  if (!match) {
    return {
      light: baseColor,
      dark: baseColor,
      glow: baseColor
    }
  }

  const h = parseFloat(match[1])
  const s = parseFloat(match[2])
  const l = parseFloat(match[3])

  return {
    light: `${h} ${s}% ${Math.min(100, l + 10)}%`,
    dark: `${h} ${s}% ${Math.max(0, l - 10)}%`,
    glow: `${h} ${s}% ${Math.min(100, l + 20)}%`
  }
}

export function generateGradient(color1: string, color2: string, direction = '135deg'): string {
  return `linear-gradient(${direction}, hsl(${color1}), hsl(${color2}))`
}

export function generateShadow(color: string, opacity = 0.3): string {
  return `0 10px 40px hsl(${color} / ${opacity})`
}

export function generateGlow(color: string, opacity = 0.5): string {
  return `0 0 30px hsl(${color} / ${opacity})`
}

export function createCompleteThemeColors(baseColors: {
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  accent: string
  accentForeground: string
  background: string
  foreground: string
  muted: string
  mutedForeground: string
  card: string
  cardForeground: string
  border: string
  input: string
  ring: string
  destructive: string
  destructiveForeground: string
}) {
  const primaryVariants = generateColorVariants(baseColors.primary)
  const secondaryVariants = generateColorVariants(baseColors.secondary)
  const accentVariants = generateColorVariants(baseColors.accent)

  return {
    // Base colors
    ...baseColors,
    
    // Primary variants
    primaryLight: primaryVariants.light,
    primaryDark: primaryVariants.dark,
    primaryGlow: primaryVariants.glow,
    
    // Secondary variants
    secondaryLight: secondaryVariants.light,
    secondaryDark: secondaryVariants.dark,
    
    // Accent variants
    accentLight: accentVariants.light,
    accentDark: accentVariants.dark,
    
    // Background variants
    backgroundSecondary: baseColors.background === '0 0% 100%' ? '210 40% 98%' : '217 33% 10%',
    backgroundAccent: baseColors.background === '0 0% 100%' ? '210 40% 96%' : '217 33% 12%',
    
    // Status colors
    success: '142 76% 36%',
    successForeground: '0 0% 100%',
    warning: '38 92% 50%',
    warningForeground: '0 0% 0%',
    
    // Gradients
    gradientPrimary: generateGradient(baseColors.primary, baseColors.accent),
    gradientSecondary: generateGradient(baseColors.secondary, baseColors.muted, '180deg'),
    gradientAccent: generateGradient(baseColors.accent, primaryVariants.light, '45deg'),
    gradientBackground: generateGradient(baseColors.background, baseColors.muted),
    
    // Shadows and effects
    shadowPrimary: generateShadow(baseColors.primary),
    shadowSecondary: generateShadow(baseColors.foreground, 0.1),
    glowPrimary: generateGlow(baseColors.primary),
    glowSecondary: generateGlow(baseColors.accent, 0.3),
  }
}