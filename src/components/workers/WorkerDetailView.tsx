import { useState, useEffect } from 'react'
import {
    ArrowLeft,
    FileCode,
    Globe,
    Key,
    Clock,
    Link2,
    Trash2,
    Copy,
    ExternalLink,
    Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    type Worker,
    type WorkerRoute,
    type WorkerSecret,
    type WorkerCron,
    getWorkerRoutes,
    getWorkerSecrets,
    deleteWorker,
    cloneWorker
} from '@/lib/api'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { DeleteWorkerDialog } from './DeleteWorkerDialog'
import { CloneWorkerDialog } from './CloneWorkerDialog'

interface WorkerDetailViewProps {
    worker: Worker
    onBack: () => void
    onRefresh: () => void
}

export function WorkerDetailView({ worker, onBack, onRefresh }: WorkerDetailViewProps): React.ReactNode {
    const [routes, setRoutes] = useState<WorkerRoute[]>([])
    const [secrets, setSecrets] = useState<WorkerSecret[]>([])
    const [crons] = useState<WorkerCron[]>([])
    const [loading, setLoading] = useState(true)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showCloneDialog, setShowCloneDialog] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [cloning, setCloning] = useState(false)

    useEffect(() => {
        const fetchDetails = async (): Promise<void> => {
            setLoading(true)

            const [routesRes, secretsRes] = await Promise.all([
                getWorkerRoutes(worker.name),
                getWorkerSecrets(worker.name),
            ])

            if (routesRes.success && routesRes.result) {
                setRoutes(routesRes.result)
            }
            if (secretsRes.success && secretsRes.result) {
                setSecrets(secretsRes.result)
            }

            setLoading(false)
        }

        void fetchDetails()
    }, [worker.name])

    const handleDelete = async (): Promise<void> => {
        setDeleting(true)
        const response = await deleteWorker(worker.name)
        setDeleting(false)

        if (response.success) {
            onRefresh()
            onBack()
        }
    }

    const handleClone = async (newName: string): Promise<void> => {
        setCloning(true)
        const response = await cloneWorker(worker.name, newName)
        setCloning(false)

        if (response.success) {
            setShowCloneDialog(false)
            onRefresh()
        }
    }

    const handlers = worker.handlers ?? []
    const workersDevUrl = `https://${worker.name}.${worker.id?.split('-')[0] ?? 'your-subdomain'}.workers.dev`

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <FileCode className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-bold tracking-tight">{worker.name}</h1>
                        </div>
                        <p className="text-muted-foreground">
                            Created {formatRelativeTime(worker.created_on)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <a
                            href={`https://dash.cloudflare.com/?to=/:account/workers/services/view/${worker.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open in Cloudflare Dashboard"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => { setShowCloneDialog(true) }}>
                        <Copy className="h-4 w-4" />
                        Clone
                    </Button>
                    <Button variant="destructive" className="gap-2" onClick={() => { setShowDeleteDialog(true) }}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Status</CardDescription>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Badge variant="success">Active</Badge>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Handlers</CardDescription>
                        <CardTitle className="text-lg">
                            {handlers.length > 0 ? handlers.join(', ') : 'None'}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Routes</CardDescription>
                        <CardTitle className="text-lg">{routes.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Last Modified</CardDescription>
                        <CardTitle className="text-lg">{formatRelativeTime(worker.modified_on)}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* workers.dev URL */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">workers.dev URL:</span>
                            <code className="text-sm bg-muted px-2 py-0.5 rounded">{workersDevUrl}</code>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <a href={workersDevUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="routes" className="w-full">
                <TabsList>
                    <TabsTrigger value="routes" className="gap-2">
                        <Link2 className="h-4 w-4" />
                        Routes
                    </TabsTrigger>
                    <TabsTrigger value="secrets" className="gap-2">
                        <Key className="h-4 w-4" />
                        Secrets
                    </TabsTrigger>
                    <TabsTrigger value="crons" className="gap-2">
                        <Clock className="h-4 w-4" />
                        Cron Triggers
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="routes" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Routes</CardTitle>
                            <CardDescription>URL patterns that trigger this Worker</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-20 bg-muted animate-pulse rounded" />
                            ) : routes.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No routes configured</p>
                            ) : (
                                <div className="space-y-2">
                                    {routes.map((route) => (
                                        <div key={route.id} className="flex items-center justify-between p-3 rounded-lg border">
                                            <code className="text-sm">{route.pattern}</code>
                                            {route.zone_name && (
                                                <Badge variant="secondary">{route.zone_name}</Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="secrets" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Secrets</CardTitle>
                            <CardDescription>Encrypted environment variables (values are hidden)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-20 bg-muted animate-pulse rounded" />
                            ) : secrets.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No secrets configured</p>
                            ) : (
                                <div className="space-y-2">
                                    {secrets.map((secret) => (
                                        <div key={secret.name} className="flex items-center justify-between p-3 rounded-lg border">
                                            <div className="flex items-center gap-2">
                                                <Key className="h-4 w-4 text-muted-foreground" />
                                                <code className="text-sm">{secret.name}</code>
                                            </div>
                                            <span className="text-muted-foreground text-sm">••••••••</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="crons" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cron Triggers</CardTitle>
                            <CardDescription>Scheduled execution triggers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-20 bg-muted animate-pulse rounded" />
                            ) : crons.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No cron triggers configured</p>
                            ) : (
                                <div className="space-y-2">
                                    {crons.map((cron, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <code className="text-sm">{cron.cron}</code>
                                            </div>
                                            <span className="text-muted-foreground text-sm">
                                                Created {formatDateTime(cron.created_on)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                            <CardDescription>Worker configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium">Compatibility Date</p>
                                    <p className="text-muted-foreground">{worker.compatibility_date ?? 'Not set'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Usage Model</p>
                                    <p className="text-muted-foreground">{worker.usage_model ?? 'Standard'}</p>
                                </div>
                                {worker.compatibility_flags && worker.compatibility_flags.length > 0 && (
                                    <div className="md:col-span-2">
                                        <p className="text-sm font-medium mb-2">Compatibility Flags</p>
                                        <div className="flex flex-wrap gap-2">
                                            {worker.compatibility_flags.map((flag) => (
                                                <Badge key={flag} variant="secondary">{flag}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <DeleteWorkerDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                workerName={worker.name}
                onConfirm={() => { void handleDelete() }}
                loading={deleting}
            />

            <CloneWorkerDialog
                open={showCloneDialog}
                onOpenChange={setShowCloneDialog}
                workerName={worker.name}
                onConfirm={(name) => { void handleClone(name) }}
                loading={cloning}
            />
        </div>
    )
}
