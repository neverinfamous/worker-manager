import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@/contexts/ThemeContext'
import App from './App'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
    throw new Error('Failed to find the root element')
}

createRoot(rootElement).render(
    <StrictMode>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </StrictMode>,
)
