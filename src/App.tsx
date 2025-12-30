import { useState } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import { WorkerListView } from '@/components/workers/WorkerListView'
import { PageListView } from '@/components/pages/PageListView'
import { MetricsView } from '@/components/metrics/MetricsView'
import { JobsView } from '@/components/jobs/JobsView'
import { WebhooksView } from '@/components/webhooks/WebhooksView'
import {
    Cloud,
    FileCode,
    Globe,
    History,
    Moon,
    Sun,
    Webhook,
    BarChart3,
    ExternalLink,
    HelpCircle,
} from 'lucide-react'

type View = 'workers' | 'pages' | 'metrics' | 'jobs' | 'webhooks'

export default function App(): React.ReactNode {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [currentView, setCurrentView] = useState<View>('workers')

    const cycleTheme = (): void => {
        const themes: ('system' | 'light' | 'dark')[] = ['system', 'light', 'dark']
        const currentIndex = themes.indexOf(theme)
        const nextIndex = (currentIndex + 1) % themes.length
        const nextTheme = themes[nextIndex]
        if (nextTheme !== undefined) {
            setTheme(nextTheme)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="container mx-auto flex h-14 items-center px-4">
                    <button
                        type="button"
                        onClick={() => { window.location.reload() }}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                        aria-label="Refresh application"
                        title="Click to refresh"
                    >
                        <Cloud className="h-6 w-6 text-primary" />
                        <span className="font-semibold text-lg">Worker Manager</span>
                    </button>

                    <nav className="ml-8 flex items-center gap-1">
                        <Button
                            variant={currentView === 'workers' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => { setCurrentView('workers') }}
                            className="gap-2"
                        >
                            <FileCode className="h-4 w-4" />
                            Workers
                        </Button>
                        <Button
                            variant={currentView === 'pages' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => { setCurrentView('pages') }}
                            className="gap-2"
                        >
                            <Globe className="h-4 w-4" />
                            Pages
                        </Button>
                        <Button
                            variant={currentView === 'metrics' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => { setCurrentView('metrics') }}
                            className="gap-2"
                        >
                            <BarChart3 className="h-4 w-4" />
                            Metrics
                        </Button>
                        <Button
                            variant={currentView === 'jobs' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => { setCurrentView('jobs') }}
                            className="gap-2"
                        >
                            <History className="h-4 w-4" />
                            Jobs
                        </Button>
                        <Button
                            variant={currentView === 'webhooks' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => { setCurrentView('webhooks') }}
                            className="gap-2"
                        >
                            <Webhook className="h-4 w-4" />
                            Webhooks
                        </Button>
                    </nav>

                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                            <a
                                href="https://dash.cloudflare.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Cloudflare Dashboard"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <a
                                href="https://developers.cloudflare.com/workers/"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Workers Documentation"
                            >
                                <HelpCircle className="h-4 w-4" />
                            </a>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={cycleTheme}
                            title={`Theme: ${theme}`}
                        >
                            {resolvedTheme === 'dark' ? (
                                <Moon className="h-4 w-4" />
                            ) : (
                                <Sun className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                {currentView === 'workers' && <WorkerListView />}
                {currentView === 'pages' && <PageListView />}
                {currentView === 'metrics' && <MetricsView />}
                {currentView === 'jobs' && <JobsView />}
                {currentView === 'webhooks' && <WebhooksView />}
            </main>
        </div>
    )
}

