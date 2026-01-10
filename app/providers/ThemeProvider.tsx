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
    const [theme, setThemeState] = useState<Theme>('system')
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('dark')
    const [mounted, setMounted] = useState(false)

    // actualTheme: Türetilmiş değer. Ekstra render gerektirmez.
    const actualTheme = theme === 'system' ? systemTheme : theme

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)

        const saved = localStorage.getItem('theme') as Theme | null
        if (saved) {
            setThemeState(saved)
        }

        if (typeof window !== 'undefined') {
            const media = window.matchMedia('(prefers-color-scheme: light)')
            setSystemTheme(media.matches ? 'light' : 'dark')
        }
    }, [])

    useEffect(() => {
        if (!mounted) return
        localStorage.setItem('theme', theme)
    }, [theme, mounted])

    // DOM güncellemesi bir side-effect'tir.
    useEffect(() => {
        if (!mounted) return
        document.documentElement.setAttribute('data-theme', actualTheme)
    }, [actualTheme, mounted])

    useEffect(() => {
        if (!mounted) return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'light' : 'dark')
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [mounted])

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
