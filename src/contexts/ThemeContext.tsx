import React, { createContext, useContext, useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface Theme {
  id: string
  name: string
  description?: string
  colors: {
    // Primary colors with shades
    primary: string
    primaryForeground: string
    primaryLight: string
    primaryDark: string
    primaryGlow: string
    
    // Secondary colors with shades
    secondary: string
    secondaryForeground: string
    secondaryLight: string
    secondaryDark: string
    
    // Accent colors with shades
    accent: string
    accentForeground: string
    accentLight: string
    accentDark: string
    
    // Background colors with variants
    background: string
    backgroundSecondary: string
    backgroundAccent: string
    foreground: string
    
    // UI element colors
    muted: string
    mutedForeground: string
    card: string
    cardForeground: string
    border: string
    input: string
    ring: string
    
    // Status colors
    destructive: string
    destructiveForeground: string
    success: string
    successForeground: string
    warning: string
    warningForeground: string
    
    // Gradients
    gradientPrimary: string
    gradientSecondary: string
    gradientAccent: string
    gradientBackground: string
    
    // Shadows and effects
    shadowPrimary: string
    shadowSecondary: string
    glowPrimary: string
    glowSecondary: string
  }
  darkColors?: {
    // Primary colors with shades
    primary: string
    primaryForeground: string
    primaryLight: string
    primaryDark: string
    primaryGlow: string
    
    // Secondary colors with shades
    secondary: string
    secondaryForeground: string
    secondaryLight: string
    secondaryDark: string
    
    // Accent colors with shades
    accent: string
    accentForeground: string
    accentLight: string
    accentDark: string
    
    // Background colors with variants
    background: string
    backgroundSecondary: string
    backgroundAccent: string
    foreground: string
    
    // UI element colors
    muted: string
    mutedForeground: string
    card: string
    cardForeground: string
    border: string
    input: string
    ring: string
    
    // Status colors
    destructive: string
    destructiveForeground: string
    success: string
    successForeground: string
    warning: string
    warningForeground: string
    
    // Gradients
    gradientPrimary: string
    gradientSecondary: string
    gradientAccent: string
    gradientBackground: string
    
    // Shadows and effects
    shadowPrimary: string
    shadowSecondary: string
    glowPrimary: string
    glowSecondary: string
  }
  isDefault: boolean
  createdBy?: string
}

interface ThemeContextType {
  currentTheme: Theme
  availableThemes: Theme[]
  setTheme: (themeId: string) => void
  createCustomTheme: (theme: Omit<Theme, 'id' | 'isDefault' | 'createdBy'>) => void
  deleteCustomTheme: (themeId: string) => void
  refreshThemes: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const defaultThemes: Theme[] = [
  {
    id: 'midnight-aurora',
    name: 'Midnight Aurora',
    description: 'Deep purples and electric blues with aurora-like gradients',
    isDefault: true,
    colors: {
      // Primary colors with shades
      primary: '252 100% 67%',
      primaryForeground: '0 0% 100%',
      primaryLight: '252 100% 77%',
      primaryDark: '252 100% 57%',
      primaryGlow: '252 100% 67%',
      
      // Secondary colors with shades
      secondary: '270 30% 95%',
      secondaryForeground: '270 30% 15%',
      secondaryLight: '270 30% 98%',
      secondaryDark: '270 30% 85%',
      
      // Accent colors with shades
      accent: '285 100% 70%',
      accentForeground: '0 0% 100%',
      accentLight: '285 100% 80%',
      accentDark: '285 100% 60%',
      
      // Background colors with variants
      background: '0 0% 100%',
      backgroundSecondary: '270 10% 98%',
      backgroundAccent: '270 20% 96%',
      foreground: '270 30% 15%',
      
      // UI element colors
      muted: '270 20% 96%',
      mutedForeground: '270 15% 45%',
      card: '0 0% 100%',
      cardForeground: '270 30% 15%',
      border: '270 20% 90%',
      input: '270 20% 92%',
      ring: '252 100% 67%',
      
      // Status colors
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      success: '142 76% 36%',
      successForeground: '0 0% 100%',
      warning: '38 92% 50%',
      warningForeground: '0 0% 0%',
      
      // Gradients
      gradientPrimary: 'linear-gradient(135deg, hsl(252 100% 67%), hsl(285 100% 70%))',
      gradientSecondary: 'linear-gradient(180deg, hsl(270 20% 96%), hsl(270 30% 90%))',
      gradientAccent: 'linear-gradient(45deg, hsl(285 100% 70%), hsl(252 100% 67%))',
      gradientBackground: 'linear-gradient(135deg, hsl(0 0% 100%), hsl(270 10% 98%))',
      
      // Shadows and effects
      shadowPrimary: '0 10px 40px hsl(252 100% 67% / 0.3)',
      shadowSecondary: '0 5px 20px hsl(270 30% 15% / 0.1)',
      glowPrimary: '0 0 30px hsl(252 100% 67% / 0.5)',
      glowSecondary: '0 0 20px hsl(285 100% 70% / 0.3)',
    },
    darkColors: {
      // Primary colors with shades
      primary: '252 100% 67%',
      primaryForeground: '0 0% 100%',
      primaryLight: '252 100% 77%',
      primaryDark: '252 100% 57%',
      primaryGlow: '252 100% 67%',
      
      // Secondary colors with shades
      secondary: '270 30% 15%',
      secondaryForeground: '270 30% 85%',
      secondaryLight: '270 30% 20%',
      secondaryDark: '270 30% 10%',
      
      // Accent colors with shades
      accent: '285 100% 70%',
      accentForeground: '0 0% 100%',
      accentLight: '285 100% 80%',
      accentDark: '285 100% 60%',
      
      // Background colors with variants
      background: '270 30% 8%',
      backgroundSecondary: '270 30% 10%',
      backgroundAccent: '270 30% 12%',
      foreground: '270 30% 90%',
      
      // UI element colors
      muted: '270 30% 15%',
      mutedForeground: '270 15% 60%',
      card: '270 30% 10%',
      cardForeground: '270 30% 90%',
      border: '270 30% 20%',
      input: '270 30% 18%',
      ring: '252 100% 67%',
      
      // Status colors
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      success: '142 76% 36%',
      successForeground: '0 0% 100%',
      warning: '38 92% 50%',
      warningForeground: '0 0% 0%',
      
      // Gradients
      gradientPrimary: 'linear-gradient(135deg, hsl(252 100% 67%), hsl(285 100% 70%))',
      gradientSecondary: 'linear-gradient(180deg, hsl(270 30% 10%), hsl(270 30% 15%))',
      gradientAccent: 'linear-gradient(45deg, hsl(285 100% 70%), hsl(252 100% 67%))',
      gradientBackground: 'linear-gradient(135deg, hsl(270 30% 8%), hsl(270 30% 12%))',
      
      // Shadows and effects
      shadowPrimary: '0 10px 40px hsl(252 100% 67% / 0.4)',
      shadowSecondary: '0 5px 20px hsl(270 30% 0% / 0.3)',
      glowPrimary: '0 0 30px hsl(252 100% 67% / 0.6)',
      glowSecondary: '0 0 20px hsl(285 100% 70% / 0.4)',
    }
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Tranquil ocean blues with tropical accents',
    isDefault: true,
    colors: {
      // Primary colors with shades
      primary: '195 100% 45%',
      primaryForeground: '0 0% 100%',
      primaryLight: '195 100% 55%',
      primaryDark: '195 100% 35%',
      primaryGlow: '195 100% 65%',
      
      // Secondary colors with shades
      secondary: '195 30% 95%',
      secondaryForeground: '195 30% 15%',
      secondaryLight: '195 30% 98%',
      secondaryDark: '195 30% 85%',
      
      // Accent colors with shades
      accent: '170 100% 50%',
      accentForeground: '0 0% 100%',
      accentLight: '170 100% 60%',
      accentDark: '170 100% 40%',
      
      // Background colors with variants
      background: '0 0% 100%',
      backgroundSecondary: '195 20% 98%',
      backgroundAccent: '195 30% 96%',
      foreground: '195 30% 15%',
      
      // UI element colors
      muted: '195 20% 96%',
      mutedForeground: '195 15% 45%',
      card: '0 0% 100%',
      cardForeground: '195 30% 15%',
      border: '195 20% 90%',
      input: '195 20% 92%',
      ring: '195 100% 45%',
      
      // Status colors
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      success: '142 76% 36%',
      successForeground: '0 0% 100%',
      warning: '38 92% 50%',
      warningForeground: '0 0% 0%',
      
      // Gradients
      gradientPrimary: 'linear-gradient(135deg, hsl(195 100% 45%), hsl(170 100% 50%))',
      gradientSecondary: 'linear-gradient(180deg, hsl(195 20% 96%), hsl(195 30% 90%))',
      gradientAccent: 'linear-gradient(45deg, hsl(170 100% 50%), hsl(195 100% 55%))',
      gradientBackground: 'linear-gradient(135deg, hsl(0 0% 100%), hsl(195 20% 98%))',
      
      // Shadows and effects
      shadowPrimary: '0 10px 40px hsl(195 100% 45% / 0.3)',
      shadowSecondary: '0 5px 20px hsl(195 30% 15% / 0.1)',
      glowPrimary: '0 0 30px hsl(195 100% 45% / 0.5)',
      glowSecondary: '0 0 20px hsl(170 100% 50% / 0.3)',
    },
    darkColors: {
      // Primary colors with shades
      primary: '195 100% 55%',
      primaryForeground: '0 0% 100%',
      primaryLight: '195 100% 65%',
      primaryDark: '195 100% 45%',
      primaryGlow: '195 100% 65%',
      
      // Secondary colors with shades
      secondary: '195 30% 15%',
      secondaryForeground: '195 30% 85%',
      secondaryLight: '195 30% 20%',
      secondaryDark: '195 30% 10%',
      
      // Accent colors with shades
      accent: '170 100% 60%',
      accentForeground: '0 0% 100%',
      accentLight: '170 100% 70%',
      accentDark: '170 100% 50%',
      
      // Background colors with variants
      background: '195 50% 8%',
      backgroundSecondary: '195 40% 10%',
      backgroundAccent: '195 30% 12%',
      foreground: '195 30% 90%',
      
      // UI element colors
      muted: '195 30% 15%',
      mutedForeground: '195 15% 60%',
      card: '195 40% 10%',
      cardForeground: '195 30% 90%',
      border: '195 30% 20%',
      input: '195 30% 18%',
      ring: '195 100% 55%',
      
      // Status colors
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      success: '142 76% 36%',
      successForeground: '0 0% 100%',
      warning: '38 92% 50%',
      warningForeground: '0 0% 0%',
      
      // Gradients
      gradientPrimary: 'linear-gradient(135deg, hsl(195 100% 55%), hsl(170 100% 60%))',
      gradientSecondary: 'linear-gradient(180deg, hsl(195 40% 10%), hsl(195 30% 15%))',
      gradientAccent: 'linear-gradient(45deg, hsl(170 100% 60%), hsl(195 100% 65%))',
      gradientBackground: 'linear-gradient(135deg, hsl(195 50% 8%), hsl(195 40% 12%))',
      
      // Shadows and effects
      shadowPrimary: '0 10px 40px hsl(195 100% 55% / 0.4)',
      shadowSecondary: '0 5px 20px hsl(195 50% 0% / 0.3)',
      glowPrimary: '0 0 30px hsl(195 100% 55% / 0.6)',
      glowSecondary: '0 0 20px hsl(170 100% 60% / 0.4)',
    }
  },
  {
    id: 'forest-sanctuary',
    name: 'Forest Sanctuary',
    description: 'Deep emerald greens with golden accents',
    isDefault: true,
    colors: {
      // Primary colors with shades
      primary: '142 76% 36%',
      primaryForeground: '0 0% 100%',
      primaryLight: '142 76% 46%',
      primaryDark: '142 76% 26%',
      primaryGlow: '142 76% 56%',
      
      // Secondary colors with shades
      secondary: '142 30% 95%',
      secondaryForeground: '142 30% 15%',
      secondaryLight: '142 30% 98%',
      secondaryDark: '142 30% 85%',
      
      // Accent colors with shades
      accent: '45 100% 60%',
      accentForeground: '0 0% 0%',
      accentLight: '45 100% 70%',
      accentDark: '45 100% 50%',
      
      // Background colors with variants
      background: '0 0% 100%',
      backgroundSecondary: '142 20% 98%',
      backgroundAccent: '142 30% 96%',
      foreground: '142 30% 15%',
      
      // UI element colors
      muted: '142 20% 96%',
      mutedForeground: '142 15% 45%',
      card: '0 0% 100%',
      cardForeground: '142 30% 15%',
      border: '142 20% 90%',
      input: '142 20% 92%',
      ring: '142 76% 36%',
      
      // Status colors
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      success: '142 76% 36%',
      successForeground: '0 0% 100%',
      warning: '38 92% 50%',
      warningForeground: '0 0% 0%',
      
      // Gradients
      gradientPrimary: 'linear-gradient(135deg, hsl(142 76% 36%), hsl(45 100% 60%))',
      gradientSecondary: 'linear-gradient(180deg, hsl(142 20% 96%), hsl(142 30% 90%))',
      gradientAccent: 'linear-gradient(45deg, hsl(45 100% 60%), hsl(142 76% 46%))',
      gradientBackground: 'linear-gradient(135deg, hsl(0 0% 100%), hsl(142 20% 98%))',
      
      // Shadows and effects
      shadowPrimary: '0 10px 40px hsl(142 76% 36% / 0.3)',
      shadowSecondary: '0 5px 20px hsl(142 30% 15% / 0.1)',
      glowPrimary: '0 0 30px hsl(142 76% 36% / 0.5)',
      glowSecondary: '0 0 20px hsl(45 100% 60% / 0.3)',
    },
    darkColors: {
      // Primary colors with shades
      primary: '142 76% 46%',
      primaryForeground: '0 0% 100%',
      primaryLight: '142 76% 56%',
      primaryDark: '142 76% 36%',
      primaryGlow: '142 76% 56%',
      
      // Secondary colors with shades
      secondary: '142 30% 15%',
      secondaryForeground: '142 30% 85%',
      secondaryLight: '142 30% 20%',
      secondaryDark: '142 30% 10%',
      
      // Accent colors with shades
      accent: '45 100% 70%',
      accentForeground: '0 0% 0%',
      accentLight: '45 100% 80%',
      accentDark: '45 100% 60%',
      
      // Background colors with variants
      background: '142 50% 8%',
      backgroundSecondary: '142 40% 10%',
      backgroundAccent: '142 30% 12%',
      foreground: '142 30% 90%',
      
      // UI element colors
      muted: '142 30% 15%',
      mutedForeground: '142 15% 60%',
      card: '142 40% 10%',
      cardForeground: '142 30% 90%',
      border: '142 30% 20%',
      input: '142 30% 18%',
      ring: '142 76% 46%',
      
      // Status colors
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      success: '142 76% 36%',
      successForeground: '0 0% 100%',
      warning: '38 92% 50%',
      warningForeground: '0 0% 0%',
      
      // Gradients
      gradientPrimary: 'linear-gradient(135deg, hsl(142 76% 46%), hsl(45 100% 70%))',
      gradientSecondary: 'linear-gradient(180deg, hsl(142 40% 10%), hsl(142 30% 15%))',
      gradientAccent: 'linear-gradient(45deg, hsl(45 100% 70%), hsl(142 76% 56%))',
      gradientBackground: 'linear-gradient(135deg, hsl(142 50% 8%), hsl(142 40% 12%))',
      
      // Shadows and effects
      shadowPrimary: '0 10px 40px hsl(142 76% 46% / 0.4)',
      shadowSecondary: '0 5px 20px hsl(142 50% 0% / 0.3)',
      glowPrimary: '0 0 30px hsl(142 76% 46% / 0.6)',
      glowSecondary: '0 0 20px hsl(45 100% 70% / 0.4)',
    }
  },
  {
    id: 'sunset-blaze',
    name: 'Sunset Blaze',
    description: 'Warm oranges and deep reds with golden highlights',
    isDefault: true,
    colors: {
      // Primary colors with shades
      primary: '14 100% 57%',
      primaryForeground: '0 0% 100%',
      primaryLight: '14 100% 67%',
      primaryDark: '14 100% 47%',
      primaryGlow: '14 100% 77%',
      
      // Secondary colors with shades
      secondary: '14 30% 95%',
      secondaryForeground: '14 30% 15%',
      secondaryLight: '14 30% 98%',
      secondaryDark: '14 30% 85%',
      
      // Accent colors with shades
      accent: '350 100% 65%',
      accentForeground: '0 0% 100%',
      accentLight: '350 100% 75%',
      accentDark: '350 100% 55%',
      
      // Background colors with variants
      background: '0 0% 100%',
      backgroundSecondary: '14 20% 98%',
      backgroundAccent: '14 30% 96%',
      foreground: '14 30% 15%',
      
      // UI element colors
      muted: '14 20% 96%',
      mutedForeground: '14 15% 45%',
      card: '0 0% 100%',
      cardForeground: '14 30% 15%',
      border: '14 20% 90%',
      input: '14 20% 92%',
      ring: '14 100% 57%',
      
      // Status colors
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      success: '142 76% 36%',
      successForeground: '0 0% 100%',
      warning: '38 92% 50%',
      warningForeground: '0 0% 0%',
      
      // Gradients
      gradientPrimary: 'linear-gradient(135deg, hsl(14 100% 57%), hsl(350 100% 65%))',
      gradientSecondary: 'linear-gradient(180deg, hsl(14 20% 96%), hsl(14 30% 90%))',
      gradientAccent: 'linear-gradient(45deg, hsl(350 100% 65%), hsl(14 100% 67%))',
      gradientBackground: 'linear-gradient(135deg, hsl(0 0% 100%), hsl(14 20% 98%))',
      
      // Shadows and effects
      shadowPrimary: '0 10px 40px hsl(14 100% 57% / 0.3)',
      shadowSecondary: '0 5px 20px hsl(14 30% 15% / 0.1)',
      glowPrimary: '0 0 30px hsl(14 100% 57% / 0.5)',
      glowSecondary: '0 0 20px hsl(350 100% 65% / 0.3)',
    },
    darkColors: {
      // Primary colors with shades
      primary: '14 100% 67%',
      primaryForeground: '0 0% 100%',
      primaryLight: '14 100% 77%',
      primaryDark: '14 100% 57%',
      primaryGlow: '14 100% 77%',
      
      // Secondary colors with shades
      secondary: '14 30% 15%',
      secondaryForeground: '14 30% 85%',
      secondaryLight: '14 30% 20%',
      secondaryDark: '14 30% 10%',
      
      // Accent colors with shades
      accent: '350 100% 75%',
      accentForeground: '0 0% 100%',
      accentLight: '350 100% 85%',
      accentDark: '350 100% 65%',
      
      // Background colors with variants
      background: '14 50% 8%',
      backgroundSecondary: '14 40% 10%',
      backgroundAccent: '14 30% 12%',
      foreground: '14 30% 90%',
      
      // UI element colors
      muted: '14 30% 15%',
      mutedForeground: '14 15% 60%',
      card: '14 40% 10%',
      cardForeground: '14 30% 90%',
      border: '14 30% 20%',
      input: '14 30% 18%',
      ring: '14 100% 67%',
      
      // Status colors
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      success: '142 76% 36%',
      successForeground: '0 0% 100%',
      warning: '38 92% 50%',
      warningForeground: '0 0% 0%',
      
      // Gradients
      gradientPrimary: 'linear-gradient(135deg, hsl(14 100% 67%), hsl(350 100% 75%))',
      gradientSecondary: 'linear-gradient(180deg, hsl(14 40% 10%), hsl(14 30% 15%))',
      gradientAccent: 'linear-gradient(45deg, hsl(350 100% 75%), hsl(14 100% 77%))',
      gradientBackground: 'linear-gradient(135deg, hsl(14 50% 8%), hsl(14 40% 12%))',
      
      // Shadows and effects
      shadowPrimary: '0 10px 40px hsl(14 100% 67% / 0.4)',
      shadowSecondary: '0 5px 20px hsl(14 50% 0% / 0.3)',
      glowPrimary: '0 0 30px hsl(14 100% 67% / 0.6)',
      glowSecondary: '0 0 20px hsl(350 100% 75% / 0.4)',
    }
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    description: 'Electric cyan and magenta with dark tech aesthetics',
    isDefault: true,
    colors: {
      // Primary colors with shades
      primary: '180 100% 50%',
      primaryForeground: '0 0% 0%',
      primaryLight: '180 100% 60%',
      primaryDark: '180 100% 40%',
      primaryGlow: '180 100% 70%',
      
      // Secondary colors with shades
      secondary: '220 30% 95%',
      secondaryForeground: '220 30% 15%',
      secondaryLight: '220 30% 98%',
      secondaryDark: '220 30% 85%',
      
      // Accent colors with shades
      accent: '300 100% 70%',
      accentForeground: '0 0% 100%',
      accentLight: '300 100% 80%',
      accentDark: '300 100% 60%',
      
      // Background colors with variants
      background: '0 0% 100%',
      backgroundSecondary: '220 20% 98%',
      backgroundAccent: '220 30% 96%',
      foreground: '220 30% 15%',
      
      // UI element colors
      muted: '220 20% 96%',
      mutedForeground: '220 15% 45%',
      card: '0 0% 100%',
      cardForeground: '220 30% 15%',
      border: '220 20% 90%',
      input: '220 20% 92%',
      ring: '180 100% 50%',
      
      // Status colors
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      success: '142 76% 36%',
      successForeground: '0 0% 100%',
      warning: '38 92% 50%',
      warningForeground: '0 0% 0%',
      
      // Gradients
      gradientPrimary: 'linear-gradient(135deg, hsl(180 100% 50%), hsl(300 100% 70%))',
      gradientSecondary: 'linear-gradient(180deg, hsl(220 20% 96%), hsl(220 30% 90%))',
      gradientAccent: 'linear-gradient(45deg, hsl(300 100% 70%), hsl(180 100% 60%))',
      gradientBackground: 'linear-gradient(135deg, hsl(0 0% 100%), hsl(220 20% 98%))',
      
      // Shadows and effects
      shadowPrimary: '0 10px 40px hsl(180 100% 50% / 0.3)',
      shadowSecondary: '0 5px 20px hsl(220 30% 15% / 0.1)',
      glowPrimary: '0 0 30px hsl(180 100% 50% / 0.5)',
      glowSecondary: '0 0 20px hsl(300 100% 70% / 0.3)',
    },
    darkColors: {
      // Primary colors with shades
      primary: '180 100% 60%',
      primaryForeground: '0 0% 0%',
      primaryLight: '180 100% 70%',
      primaryDark: '180 100% 50%',
      primaryGlow: '180 100% 70%',
      
      // Secondary colors with shades
      secondary: '220 30% 15%',
      secondaryForeground: '220 30% 85%',
      secondaryLight: '220 30% 20%',
      secondaryDark: '220 30% 8%',
      
      // Accent colors with shades
      accent: '300 100% 80%',
      accentForeground: '0 0% 0%',
      accentLight: '300 100% 90%',
      accentDark: '300 100% 70%',
      
      // Background colors with variants
      background: '220 50% 3%',
      backgroundSecondary: '220 40% 5%',
      backgroundAccent: '220 30% 8%',
      foreground: '220 30% 90%',
      
      // UI element colors
      muted: '220 30% 12%',
      mutedForeground: '220 15% 60%',
      card: '220 40% 5%',
      cardForeground: '220 30% 90%',
      border: '220 30% 15%',
      input: '220 30% 12%',
      ring: '180 100% 60%',
      
      // Status colors
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      success: '142 76% 36%',
      successForeground: '0 0% 100%',
      warning: '38 92% 50%',
      warningForeground: '0 0% 0%',
      
      // Gradients
      gradientPrimary: 'linear-gradient(135deg, hsl(180 100% 60%), hsl(300 100% 80%))',
      gradientSecondary: 'linear-gradient(180deg, hsl(220 40% 5%), hsl(220 30% 12%))',
      gradientAccent: 'linear-gradient(45deg, hsl(300 100% 80%), hsl(180 100% 70%))',
      gradientBackground: 'linear-gradient(135deg, hsl(220 50% 3%), hsl(220 40% 8%))',
      
      // Shadows and effects
      shadowPrimary: '0 10px 40px hsl(180 100% 60% / 0.4)',
      shadowSecondary: '0 5px 20px hsl(220 50% 0% / 0.4)',
      glowPrimary: '0 0 30px hsl(180 100% 60% / 0.7)',
      glowSecondary: '0 0 20px hsl(300 100% 80% / 0.5)',
    }
  }
]

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultThemes[0])
  const [availableThemes, setAvailableThemes] = useState<Theme[]>(defaultThemes)
  const { toast } = useToast()

  const applyThemeToDOM = (theme: Theme) => {
    const isDark = document.documentElement.classList.contains('dark')
    const colors = isDark && theme.darkColors ? theme.darkColors : theme.colors
    const root = document.documentElement

    // Apply base colors
    root.style.setProperty('--primary', colors.primary)
    root.style.setProperty('--primary-foreground', colors.primaryForeground)
    root.style.setProperty('--primary-light', colors.primaryLight || colors.primary)
    root.style.setProperty('--primary-dark', colors.primaryDark || colors.primary)
    root.style.setProperty('--primary-glow', colors.primaryGlow || colors.primary)
    
    root.style.setProperty('--secondary', colors.secondary)
    root.style.setProperty('--secondary-foreground', colors.secondaryForeground)
    root.style.setProperty('--secondary-light', colors.secondaryLight || colors.secondary)
    root.style.setProperty('--secondary-dark', colors.secondaryDark || colors.secondary)
    
    root.style.setProperty('--accent', colors.accent)
    root.style.setProperty('--accent-foreground', colors.accentForeground)
    root.style.setProperty('--accent-light', colors.accentLight || colors.accent)
    root.style.setProperty('--accent-dark', colors.accentDark || colors.accent)
    
    root.style.setProperty('--background', colors.background)
    root.style.setProperty('--background-secondary', colors.backgroundSecondary || colors.background)
    root.style.setProperty('--background-accent', colors.backgroundAccent || colors.background)
    root.style.setProperty('--foreground', colors.foreground)
    
    root.style.setProperty('--muted', colors.muted)
    root.style.setProperty('--muted-foreground', colors.mutedForeground)
    root.style.setProperty('--card', colors.card)
    root.style.setProperty('--card-foreground', colors.cardForeground)
    root.style.setProperty('--border', colors.border)
    root.style.setProperty('--input', colors.input)
    root.style.setProperty('--ring', colors.ring)
    
    // Status colors
    root.style.setProperty('--destructive', colors.destructive)
    root.style.setProperty('--destructive-foreground', colors.destructiveForeground)
    root.style.setProperty('--success', colors.success || '142 76% 36%')
    root.style.setProperty('--success-foreground', colors.successForeground || '0 0% 100%')
    root.style.setProperty('--warning', colors.warning || '38 92% 50%')
    root.style.setProperty('--warning-foreground', colors.warningForeground || '0 0% 0%')
    
    // Gradients
    root.style.setProperty('--gradient-primary', colors.gradientPrimary || `linear-gradient(135deg, hsl(${colors.primary}), hsl(${colors.accent}))`)
    root.style.setProperty('--gradient-secondary', colors.gradientSecondary || `linear-gradient(180deg, hsl(${colors.secondary}), hsl(${colors.muted}))`)
    root.style.setProperty('--gradient-accent', colors.gradientAccent || `linear-gradient(45deg, hsl(${colors.accent}), hsl(${colors.primary}))`)
    root.style.setProperty('--gradient-background', colors.gradientBackground || `linear-gradient(135deg, hsl(${colors.background}), hsl(${colors.muted}))`)
    
    // Shadows and effects
    root.style.setProperty('--shadow-primary', colors.shadowPrimary || `0 10px 40px hsl(${colors.primary} / 0.3)`)
    root.style.setProperty('--shadow-secondary', colors.shadowSecondary || `0 5px 20px hsl(${colors.foreground} / 0.1)`)
    root.style.setProperty('--glow-primary', colors.glowPrimary || `0 0 30px hsl(${colors.primary} / 0.5)`)
    root.style.setProperty('--glow-secondary', colors.glowSecondary || `0 0 20px hsl(${colors.accent} / 0.3)`)
  }

  const setTheme = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId)
    if (!theme) return

    setCurrentTheme(theme)
    applyThemeToDOM(theme)

    // Save to localStorage for persistence
    localStorage.setItem('selectedTheme', themeId)

    toast({
      title: 'Theme Applied',
      description: `Switched to ${theme.name} theme`,
    })
  }

  const createCustomTheme = (themeData: Omit<Theme, 'id' | 'isDefault' | 'createdBy'>) => {
    const newTheme: Theme = {
      ...themeData,
      id: `custom-${Date.now()}`,
      isDefault: false,
    }

    setAvailableThemes(prev => [...prev, newTheme])
    
    // Save custom themes to localStorage
    const customThemes = availableThemes.filter(t => !t.isDefault)
    localStorage.setItem('customThemes', JSON.stringify([...customThemes, newTheme]))

    toast({
      title: 'Success',
      description: 'Custom theme created successfully',
    })
  }

  const deleteCustomTheme = (themeId: string) => {
    setAvailableThemes(prev => prev.filter(t => t.id !== themeId))
    
    // If the deleted theme is currently active, switch to default
    if (currentTheme.id === themeId) {
      setTheme('midnight-aurora')
    }

    // Update localStorage
    const customThemes = availableThemes.filter(t => !t.isDefault && t.id !== themeId)
    localStorage.setItem('customThemes', JSON.stringify(customThemes))

    toast({
      title: 'Success',
      description: 'Custom theme deleted successfully',
    })
  }

  const refreshThemes = () => {
    // Load custom themes from localStorage
    try {
      const savedCustomThemes = localStorage.getItem('customThemes')
      if (savedCustomThemes) {
        const customThemes = JSON.parse(savedCustomThemes)
        setAvailableThemes([...defaultThemes, ...customThemes])
      }
    } catch (error) {
      console.error('Failed to load custom themes:', error)
    }
  }

  // Load saved theme on mount
  useEffect(() => {
    refreshThemes()
    
    const savedThemeId = localStorage.getItem('selectedTheme')
    if (savedThemeId) {
      const savedTheme = defaultThemes.find(t => t.id === savedThemeId)
      if (savedTheme) {
        setCurrentTheme(savedTheme)
        applyThemeToDOM(savedTheme)
      }
    } else {
      // Apply default theme
      applyThemeToDOM(defaultThemes[0])
    }
  }, [])

  // Apply theme when dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      applyThemeToDOM(currentTheme)
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [currentTheme])

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      availableThemes,
      setTheme,
      createCustomTheme,
      deleteCustomTheme,
      refreshThemes
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}