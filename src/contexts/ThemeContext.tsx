import {
    useEffect,
    useLayoutEffect,
    useState,
    useMemo,
    type ReactNode,
} from 'react'
import { type Theme } from './theme-types'
import { ThemeContext } from './theme-context'

function getSystemTheme(): 'dark' | 'light' {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
}

function getStoredTheme(): Theme {
    if (typeof window === 'undefined') return 'system'
    const stored = localStorage.getItem('worker-manager-theme')
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
        return stored
    }
    return 'system'
}

export function ThemeProvider({ children }: { children: ReactNode }): ReactNode {
    const [theme, setThemeState] = useState<Theme>(getStoredTheme)
    const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(getSystemTheme)

    // Compute resolved theme from theme and systemTheme without useState
    const resolvedTheme = useMemo<'dark' | 'light'>(
        () => (theme === 'system' ? systemTheme : theme),
        [theme, systemTheme]
    )

    // Apply theme class to document (synchronous effect to avoid flash)
    useLayoutEffect(() => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(resolvedTheme)
    }, [resolvedTheme])

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (): void => {
            setSystemTheme(getSystemTheme())
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => {
            mediaQuery.removeEventListener('change', handleChange)
        }
    }, [])

    const setTheme = (newTheme: Theme): void => {
        localStorage.setItem('worker-manager-theme', newTheme)
        setThemeState(newTheme)
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
