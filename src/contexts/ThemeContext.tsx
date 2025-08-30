import React, { createContext, useContext, useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface Theme {
  id: string
  name: string
  colors: {
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
  }
  darkColors?: {
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
    id: 'default',
    name: 'Default',
    isDefault: true,
    colors: {
      primary: '222.2 84% 4.9%',
      primaryForeground: '210 40% 98%',
      secondary: '210 40% 96%',
      secondaryForeground: '222.2 84% 4.9%',
      accent: '210 40% 96%',
      accentForeground: '222.2 84% 4.9%',
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      muted: '210 40% 96%',
      mutedForeground: '215.4 16.3% 46.9%',
      card: '0 0% 100%',
      cardForeground: '222.2 84% 4.9%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '222.2 84% 4.9%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
    },
    darkColors: {
      primary: '210 40% 98%',
      primaryForeground: '222.2 84% 4.9%',
      secondary: '217.2 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      accent: '217.2 32.6% 17.5%',
      accentForeground: '210 40% 98%',
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 65.1%',
      card: '222.2 84% 4.9%',
      cardForeground: '210 40% 98%',
      border: '217.2 32.6% 17.5%',
      input: '217.2 32.6% 17.5%',
      ring: '212.7 26.8% 83.9%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
    }
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    isDefault: true,
    colors: {
      primary: '207 89% 42%',
      primaryForeground: '210 40% 98%',
      secondary: '207 89% 95%',
      secondaryForeground: '207 89% 15%',
      accent: '207 89% 90%',
      accentForeground: '207 89% 15%',
      background: '0 0% 100%',
      foreground: '207 89% 15%',
      muted: '207 89% 95%',
      mutedForeground: '207 25% 45%',
      card: '0 0% 100%',
      cardForeground: '207 89% 15%',
      border: '207 50% 85%',
      input: '207 50% 85%',
      ring: '207 89% 42%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
    }
  },
  {
    id: 'forest',
    name: 'Forest Green',
    isDefault: true,
    colors: {
      primary: '142 76% 36%',
      primaryForeground: '210 40% 98%',
      secondary: '142 76% 95%',
      secondaryForeground: '142 76% 15%',
      accent: '142 76% 90%',
      accentForeground: '142 76% 15%',
      background: '0 0% 100%',
      foreground: '142 76% 15%',
      muted: '142 76% 95%',
      mutedForeground: '142 25% 45%',
      card: '0 0% 100%',
      cardForeground: '142 76% 15%',
      border: '142 50% 85%',
      input: '142 50% 85%',
      ring: '142 76% 36%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
    }
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    isDefault: true,
    colors: {
      primary: '24 95% 53%',
      primaryForeground: '210 40% 98%',
      secondary: '24 95% 95%',
      secondaryForeground: '24 95% 15%',
      accent: '24 95% 90%',
      accentForeground: '24 95% 15%',
      background: '0 0% 100%',
      foreground: '24 95% 15%',
      muted: '24 95% 95%',
      mutedForeground: '24 25% 45%',
      card: '0 0% 100%',
      cardForeground: '24 95% 15%',
      border: '24 50% 85%',
      input: '24 50% 85%',
      ring: '24 95% 53%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
    }
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    isDefault: true,
    colors: {
      primary: '263 70% 50%',
      primaryForeground: '210 40% 98%',
      secondary: '263 70% 95%',
      secondaryForeground: '263 70% 15%',
      accent: '263 70% 90%',
      accentForeground: '263 70% 15%',
      background: '0 0% 100%',
      foreground: '263 70% 15%',
      muted: '263 70% 95%',
      mutedForeground: '263 25% 45%',
      card: '0 0% 100%',
      cardForeground: '263 70% 15%',
      border: '263 50% 85%',
      input: '263 50% 85%',
      ring: '263 70% 50%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
    }
  },
  {
    id: 'rose',
    name: 'Elegant Rose',
    isDefault: true,
    colors: {
      primary: '330 81% 60%',
      primaryForeground: '210 40% 98%',
      secondary: '330 81% 95%',
      secondaryForeground: '330 81% 15%',
      accent: '330 81% 90%',
      accentForeground: '330 81% 15%',
      background: '0 0% 100%',
      foreground: '330 81% 15%',
      muted: '330 81% 95%',
      mutedForeground: '330 25% 45%',
      card: '0 0% 100%',
      cardForeground: '330 81% 15%',
      border: '330 50% 85%',
      input: '330 50% 85%',
      ring: '330 81% 60%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
    }
  },
  {
    id: 'teal',
    name: 'Modern Teal',
    isDefault: true,
    colors: {
      primary: '173 80% 40%',
      primaryForeground: '210 40% 98%',
      secondary: '173 80% 95%',
      secondaryForeground: '173 80% 15%',
      accent: '173 80% 90%',
      accentForeground: '173 80% 15%',
      background: '0 0% 100%',
      foreground: '173 80% 15%',
      muted: '173 80% 95%',
      mutedForeground: '173 25% 45%',
      card: '0 0% 100%',
      cardForeground: '173 80% 15%',
      border: '173 50% 85%',
      input: '173 50% 85%',
      ring: '173 80% 40%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
    }
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    isDefault: true,
    colors: {
      primary: '45 93% 47%',
      primaryForeground: '26 83% 14%',
      secondary: '45 93% 95%',
      secondaryForeground: '45 93% 15%',
      accent: '45 93% 90%',
      accentForeground: '45 93% 15%',
      background: '0 0% 100%',
      foreground: '45 93% 15%',
      muted: '45 93% 95%',
      mutedForeground: '45 25% 45%',
      card: '0 0% 100%',
      cardForeground: '45 93% 15%',
      border: '45 50% 85%',
      input: '45 50% 85%',
      ring: '45 93% 47%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
    }
  },
  {
    id: 'slate',
    name: 'Professional Slate',
    isDefault: true,
    colors: {
      primary: '215 28% 17%',
      primaryForeground: '210 40% 98%',
      secondary: '215 28% 95%',
      secondaryForeground: '215 28% 15%',
      accent: '215 28% 90%',
      accentForeground: '215 28% 15%',
      background: '0 0% 100%',
      foreground: '215 28% 15%',
      muted: '215 28% 95%',
      mutedForeground: '215 25% 45%',
      card: '0 0% 100%',
      cardForeground: '215 28% 15%',
      border: '215 50% 85%',
      input: '215 50% 85%',
      ring: '215 28% 17%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
    }
  },
  {
    id: 'indigo',
    name: 'Deep Indigo',
    isDefault: true,
    colors: {
      primary: '239 84% 67%',
      primaryForeground: '210 40% 98%',
      secondary: '239 84% 95%',
      secondaryForeground: '239 84% 15%',
      accent: '239 84% 90%',
      accentForeground: '239 84% 15%',
      background: '0 0% 100%',
      foreground: '239 84% 15%',
      muted: '239 84% 95%',
      mutedForeground: '239 25% 45%',
      card: '0 0% 100%',
      cardForeground: '239 84% 15%',
      border: '239 50% 85%',
      input: '239 50% 85%',
      ring: '239 84% 67%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
    }
  }
]

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultThemes[0])
  const [availableThemes, setAvailableThemes] = useState<Theme[]>(defaultThemes)
  const { toast } = useToast()

  const applyThemeToDOM = (theme: Theme) => {
    const root = document.documentElement
    const colors = theme.colors

    // Apply light theme colors
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      root.style.setProperty(cssVar, value)
    })

    // Apply dark theme colors if available
    if (theme.darkColors) {
      Object.entries(theme.darkColors).forEach(([key, value]) => {
        const cssVar = `--dark-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
        root.style.setProperty(cssVar, value)
      })
    }
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
      setTheme('default')
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
      console.error('Error loading custom themes:', error)
    }
  }

  // Load theme preference and custom themes on mount
  useEffect(() => {
    // Load custom themes
    refreshThemes()
    
    // Load selected theme
    const savedThemeId = localStorage.getItem('selectedTheme')
    if (savedThemeId) {
      const theme = defaultThemes.find(t => t.id === savedThemeId)
      if (theme) {
        setCurrentTheme(theme)
        applyThemeToDOM(theme)
      }
    }
  }, [])

  // Update available themes when custom themes change
  useEffect(() => {
    try {
      const savedCustomThemes = localStorage.getItem('customThemes')
      if (savedCustomThemes) {
        const customThemes = JSON.parse(savedCustomThemes)
        setAvailableThemes([...defaultThemes, ...customThemes])
      }
    } catch (error) {
      console.error('Error loading custom themes:', error)
    }
  }, [])

  useEffect(() => {
    applyThemeToDOM(currentTheme)
  }, [currentTheme])

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        availableThemes,
        setTheme,
        createCustomTheme,
        deleteCustomTheme,
        refreshThemes,
      }}
    >
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