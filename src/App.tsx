import { useState } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import { WorkerListView } from '@/components/workers/WorkerListView'
import { PageListView } from '@/components/pages/PageListView'
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
                    <div className="flex items-center gap-2">
                        <Cloud className="h-6 w-6 text-primary" />
                        <span className="font-semibold text-lg">Worker Manager</span>
                    </div>

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

function MetricsView(): React.ReactNode {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Metrics</h1>
                <p className="text-muted-foreground">
                    Analytics and performance metrics for your Workers and Pages
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <MetricCard title="Total Requests" value="1.2M" change="+12%" />
                <MetricCard title="Success Rate" value="99.8%" change="+0.2%" />
                <MetricCard title="Avg Latency" value="42ms" change="-5ms" />
                <MetricCard title="CPU Time" value="8.2ms" change="-0.8ms" />
            </div>

            <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-4">Request Volume (24h)</h3>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Chart visualization coming soon
                </div>
            </div>
        </div>
    )
}

function MetricCard({
    title,
    value,
    change,
}: {
    title: string
    value: string
    change: string
}): React.ReactNode {
    const isPositive = change.startsWith('+') || (change.startsWith('-') && change.includes('ms'))
    return (
        <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className={`text-sm mt-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {change}
            </p>
        </div>
    )
}

function JobsView(): React.ReactNode {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Job History</h1>
                <p className="text-muted-foreground">
                    Track all operations and their status
                </p>
            </div>

            <div className="rounded-lg border">
                <div className="p-8 text-center text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No jobs recorded yet</p>
                    <p className="text-sm mt-1">Operations will appear here as you manage Workers and Pages</p>
                </div>
            </div>
        </div>
    )
}

function WebhooksView(): React.ReactNode {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Webhooks</h1>
                    <p className="text-muted-foreground">
                        Configure HTTP notifications for events
                    </p>
                </div>
                <Button className="gap-2">
                    <Webhook className="h-4 w-4" />
                    Add Webhook
                </Button>
            </div>

            <div className="rounded-lg border">
                <div className="p-8 text-center text-muted-foreground">
                    <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No webhooks configured</p>
                    <p className="text-sm mt-1">Add a webhook to receive notifications for deployments, errors, and more</p>
                </div>
            </div>
        </div>
    )
}
