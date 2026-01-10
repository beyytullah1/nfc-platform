'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
    actualTheme: 'light' | 'dark' // Resolved theme (system → light/dark)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark')
    const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('dark')
    const [mounted, setMounted] = useState(false)

    // Client-side mount check
    useEffect(() => {
        setMounted(true)
        // İlk yüklemede localStorage'dan oku
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme') as Theme | null
            if (saved) {
                setThemeState(saved)
            }
        }
    }, [])

    // Theme değiştiğinde localStorage'a kaydet ve HTML'e uygula
    useEffect(() => {
        if (!mounted || typeof window === 'undefined') return

        localStorage.setItem('theme', theme)

        let resolved: 'light' | 'dark' = 'dark'

        if (theme === 'system') {
            // System preference'ı oku
            resolved = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
        } else {
            resolved = theme
        }

        setActualTheme(resolved)
        document.documentElement.setAttribute('data-theme', resolved)
    }, [theme, mounted])

    // System theme değişikliğini dinle
    useEffect(() => {
        if (theme !== 'system') return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
        const handleChange = (e: MediaQueryListEvent) => {
            const resolved = e.matches ? 'light' : 'dark'
            setActualTheme(resolved)
            document.documentElement.setAttribute('data-theme', resolved)
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [theme])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return context
}
