import { useState } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Cloud,
    FileCode,
    Globe,
    History,
    Moon,
    Sun,
    Webhook,
    BarChart3,
    Settings,
    ExternalLink,
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
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                                title="Workers Docs"
                            >
                                <Settings className="h-4 w-4" />
                            </a>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={cycleTheme}
                            title={`Current: ${theme}`}
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
                {currentView === 'workers' && <WorkersView />}
                {currentView === 'pages' && <PagesView />}
                {currentView === 'metrics' && <MetricsView />}
                {currentView === 'jobs' && <JobsView />}
                {currentView === 'webhooks' && <WebhooksView />}
            </main>
        </div>
    )
}

function WorkersView(): React.ReactNode {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Workers</h1>
                    <p className="text-muted-foreground">
                        Manage your Cloudflare Workers scripts
                    </p>
                </div>
                <Button className="gap-2">
                    <FileCode className="h-4 w-4" />
                    Create Worker
                </Button>
            </div>

            <Tabs defaultValue="grid" className="w-full">
                <TabsList>
                    <TabsTrigger value="grid">Grid View</TabsTrigger>
                    <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>
                <TabsContent value="grid" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Placeholder cards */}
                        <WorkerCard
                            name="api-gateway"
                            routes={3}
                            lastDeployed="2 hours ago"
                        />
                        <WorkerCard
                            name="auth-service"
                            routes={1}
                            lastDeployed="1 day ago"
                        />
                        <WorkerCard
                            name="image-processor"
                            routes={2}
                            lastDeployed="3 days ago"
                        />
                    </div>
                </TabsContent>
                <TabsContent value="list" className="mt-4">
                    <div className="rounded-md border">
                        <div className="p-4 text-center text-muted-foreground">
                            List view coming soon
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function WorkerCard({
    name,
    routes,
    lastDeployed,
}: {
    name: string
    routes: number
    lastDeployed: string
}): React.ReactNode {
    return (
        <div className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{name}</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                </Button>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span>{routes} route{routes !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span>Deployed {lastDeployed}</span>
            </div>
        </div>
    )
}

function PagesView(): React.ReactNode {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pages</h1>
                    <p className="text-muted-foreground">
                        Manage your Cloudflare Pages projects
                    </p>
                </div>
                <Button className="gap-2">
                    <Globe className="h-4 w-4" />
                    Create Project
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <PageCard
                    name="marketing-site"
                    subdomain="marketing-site"
                    branch="main"
                    lastDeployed="30 minutes ago"
                />
                <PageCard
                    name="docs-portal"
                    subdomain="docs-portal"
                    branch="main"
                    lastDeployed="2 hours ago"
                />
            </div>
        </div>
    )
}

function PageCard({
    name,
    subdomain,
    branch,
    lastDeployed,
}: {
    name: string
    subdomain: string
    branch: string
    lastDeployed: string
}): React.ReactNode {
    return (
        <div className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{name}</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
                {subdomain}.pages.dev
            </p>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span>{branch}</span>
                <span>•</span>
                <span>Deployed {lastDeployed}</span>
            </div>
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
    const isPositive = change.startsWith('+') || change.startsWith('-') && change.includes('ms')
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
