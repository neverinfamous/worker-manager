import {
    useEffect,
    useState,
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
    const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(
        theme === 'system' ? getSystemTheme() : theme
    )

    useEffect(() => {
        const root = window.document.documentElement
        const resolved = theme === 'system' ? getSystemTheme() : theme

        root.classList.remove('light', 'dark')
        root.classList.add(resolved)
        setResolvedTheme(resolved)
    }, [theme])

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (): void => {
            if (theme === 'system') {
                const resolved = getSystemTheme()
                const root = window.document.documentElement
                root.classList.remove('light', 'dark')
                root.classList.add(resolved)
                setResolvedTheme(resolved)
            }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => {
            mediaQuery.removeEventListener('change', handleChange)
        }
    }, [theme])

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
