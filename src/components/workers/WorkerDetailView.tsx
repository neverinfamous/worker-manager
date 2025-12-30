import { useState, useEffect, useCallback } from 'react'
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
    Settings,
    Plus,
    Database,
    HardDrive,
    Box
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
    type Worker,
    type WorkerRoute,
    type WorkerSecret,
    type WorkerSchedule,
    type WorkerSettings,
    type WorkerBinding,
    type SubdomainStatus,
    getWorkerRoutes,
    getWorkerSecrets,
    getWorkerSettings,
    getWorkerSchedules,
    getWorkerSubdomain,
    getAccountSubdomain,
    updateWorkerSubdomain,
    setWorkerSecret,
    deleteWorkerSecret,
    updateWorkerSchedules,
    deleteWorker,
    cloneWorker
} from '@/lib/api'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { DeleteWorkerDialog } from './DeleteWorkerDialog'
import { CloneWorkerDialog } from './CloneWorkerDialog'
import { AddSecretDialog } from './AddSecretDialog'
import { AddCronDialog } from './AddCronDialog'

interface WorkerDetailViewProps {
    worker: Worker
    onBack: () => void
    onRefresh: () => void
}

function getBindingIcon(type: string): React.ReactNode {
    switch (type) {
        case 'kv_namespace':
            return <Database className="h-4 w-4 text-blue-500" />
        case 'r2_bucket':
            return <HardDrive className="h-4 w-4 text-orange-500" />
        case 'd1':
            return <Database className="h-4 w-4 text-green-500" />
        case 'durable_object_namespace':
            return <Box className="h-4 w-4 text-purple-500" />
        default:
            return <Box className="h-4 w-4 text-muted-foreground" />
    }
}

function getBindingLabel(binding: WorkerBinding): string {
    if (binding.bucket_name) return binding.bucket_name
    if (binding.database_id) return binding.database_id
    if (binding.namespace_id) return binding.namespace_id
    if (binding.class_name) return binding.class_name
    if (binding.queue_name) return binding.queue_name
    return binding.type
}

export function WorkerDetailView({ worker, onBack, onRefresh }: WorkerDetailViewProps): React.ReactNode {
    const [routes, setRoutes] = useState<WorkerRoute[]>([])
    const [secrets, setSecrets] = useState<WorkerSecret[]>([])
    const [schedules, setSchedules] = useState<WorkerSchedule[]>([])
    const [settings, setSettings] = useState<WorkerSettings | null>(null)
    const [subdomain, setSubdomain] = useState<SubdomainStatus | null>(null)
    const [accountSubdomain, setAccountSubdomain] = useState<string>('your-subdomain')
    const [loading, setLoading] = useState(true)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showCloneDialog, setShowCloneDialog] = useState(false)
    const [showAddSecretDialog, setShowAddSecretDialog] = useState(false)
    const [showAddCronDialog, setShowAddCronDialog] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [cloning, setCloning] = useState(false)
    const [addingSecret, setAddingSecret] = useState(false)
    const [addingCron, setAddingCron] = useState(false)
    const [deletingSecret, setDeletingSecret] = useState<string | null>(null)
    const [deletingCron, setDeletingCron] = useState<string | null>(null)
    const [togglingSubdomain, setTogglingSubdomain] = useState(false)

    const fetchDetails = useCallback(async (): Promise<void> => {
        setLoading(true)

        const [routesRes, secretsRes, settingsRes, schedulesRes, subdomainRes, accountSubdomainRes] = await Promise.all([
            getWorkerRoutes(worker.name),
            getWorkerSecrets(worker.name),
            getWorkerSettings(worker.name),
            getWorkerSchedules(worker.name),
            getWorkerSubdomain(worker.name),
            getAccountSubdomain(),
        ])

        if (routesRes.success && routesRes.result) {
            setRoutes(routesRes.result)
        }
        if (secretsRes.success && secretsRes.result) {
            setSecrets(secretsRes.result)
        }
        if (settingsRes.success && settingsRes.result) {
            setSettings(settingsRes.result)
        }
        if (schedulesRes.success && schedulesRes.result) {
            setSchedules(schedulesRes.result.schedules ?? [])
        }
        if (subdomainRes.success && subdomainRes.result) {
            setSubdomain(subdomainRes.result)
        }
        if (accountSubdomainRes.success && accountSubdomainRes.result) {
            setAccountSubdomain(accountSubdomainRes.result.subdomain)
        }

        setLoading(false)
    }, [worker.name])

    useEffect(() => {
        void fetchDetails()
    }, [fetchDetails])

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

    const handleAddSecret = async (secretName: string, secretValue: string): Promise<void> => {
        setAddingSecret(true)
        const response = await setWorkerSecret(worker.name, secretName, secretValue)
        setAddingSecret(false)

        if (response.success) {
            setShowAddSecretDialog(false)
            void fetchDetails()
        }
    }

    const handleDeleteSecret = async (secretName: string): Promise<void> => {
        setDeletingSecret(secretName)
        const response = await deleteWorkerSecret(worker.name, secretName)
        setDeletingSecret(null)

        if (response.success) {
            void fetchDetails()
        }
    }

    const handleAddCron = async (cron: string): Promise<void> => {
        setAddingCron(true)
        const newSchedules = [...schedules.map(s => ({ cron: s.cron })), { cron }]
        const response = await updateWorkerSchedules(worker.name, newSchedules)
        setAddingCron(false)

        if (response.success) {
            setShowAddCronDialog(false)
            void fetchDetails()
        }
    }

    const handleDeleteCron = async (cronToDelete: string): Promise<void> => {
        setDeletingCron(cronToDelete)
        const newSchedules = schedules.filter(s => s.cron !== cronToDelete).map(s => ({ cron: s.cron }))
        const response = await updateWorkerSchedules(worker.name, newSchedules)
        setDeletingCron(null)

        if (response.success) {
            void fetchDetails()
        }
    }

    const handleToggleSubdomain = async (enabled: boolean): Promise<void> => {
        setTogglingSubdomain(true)
        const response = await updateWorkerSubdomain(worker.name, enabled)
        setTogglingSubdomain(false)

        if (response.success && response.result) {
            setSubdomain(response.result)
        }
    }

    const handlers = worker.handlers ?? []
    const workersDevUrl = `https://${worker.name}.${accountSubdomain}.workers.dev`
    const bindings = settings?.bindings ?? []

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
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Secrets</CardTitle>
                                <CardDescription>Encrypted environment variables (values are hidden)</CardDescription>
                            </div>
                            <Button size="sm" className="gap-2" onClick={() => { setShowAddSecretDialog(true) }}>
                                <Plus className="h-4 w-4" />
                                Add Secret
                            </Button>
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
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground text-sm">••••••••</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    disabled={deletingSecret === secret.name}
                                                    onClick={() => { void handleDeleteSecret(secret.name) }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="crons" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Cron Triggers</CardTitle>
                                <CardDescription>Scheduled execution triggers</CardDescription>
                            </div>
                            <Button size="sm" className="gap-2" onClick={() => { setShowAddCronDialog(true) }}>
                                <Plus className="h-4 w-4" />
                                Add Cron
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-20 bg-muted animate-pulse rounded" />
                            ) : schedules.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No cron triggers configured</p>
                            ) : (
                                <div className="space-y-2">
                                    {schedules.map((schedule, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <code className="text-sm">{schedule.cron}</code>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground text-sm">
                                                    Created {formatDateTime(schedule.created_on)}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    disabled={deletingCron === schedule.cron}
                                                    onClick={() => { void handleDeleteCron(schedule.cron) }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-4 space-y-4">
                    {/* workers.dev Toggle */}
                    <Card>
                        <CardHeader>
                            <CardTitle>workers.dev Subdomain</CardTitle>
                            <CardDescription>Enable or disable the workers.dev preview URL</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Enable workers.dev URL</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {subdomain?.enabled ? 'Worker is accessible at workers.dev' : 'Worker is not accessible at workers.dev'}
                                    </p>
                                </div>
                                <Switch
                                    checked={subdomain?.enabled ?? false}
                                    disabled={loading || togglingSubdomain}
                                    onCheckedChange={(checked: boolean) => { void handleToggleSubdomain(checked) }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bindings (Read-only) */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Bindings</CardTitle>
                                <CardDescription>Connected resources (read-only)</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={`https://dash.cloudflare.com/?to=/:account/workers/services/view/${worker.name}/settings`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Edit in Dashboard
                                </a>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-20 bg-muted animate-pulse rounded" />
                            ) : bindings.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No bindings configured</p>
                            ) : (
                                <div className="space-y-2">
                                    {bindings.map((binding) => (
                                        <div key={binding.name} className="flex items-center justify-between p-3 rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                {getBindingIcon(binding.type)}
                                                <div>
                                                    <code className="text-sm font-medium">{binding.name}</code>
                                                    <p className="text-xs text-muted-foreground">{getBindingLabel(binding)}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline">{binding.type}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Other Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                            <CardDescription>Worker configuration settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium">Compatibility Date</p>
                                    <p className="text-muted-foreground">{settings?.compatibility_date ?? worker.compatibility_date ?? 'Not set'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Usage Model</p>
                                    <p className="text-muted-foreground">{settings?.usage_model ?? worker.usage_model ?? 'Standard'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Logpush</p>
                                    <p className="text-muted-foreground">{settings?.logpush ? 'Enabled' : 'Disabled'}</p>
                                </div>
                                {(settings?.compatibility_flags ?? worker.compatibility_flags ?? []).length > 0 ? (
                                    <div className="md:col-span-2">
                                        <p className="text-sm font-medium mb-2">Compatibility Flags</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(settings?.compatibility_flags ?? worker.compatibility_flags ?? []).map((flag) => (
                                                <Badge key={flag} variant="secondary">{flag}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
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

            <AddSecretDialog
                open={showAddSecretDialog}
                onOpenChange={setShowAddSecretDialog}
                workerName={worker.name}
                onConfirm={(name, value) => { void handleAddSecret(name, value) }}
                loading={addingSecret}
            />

            <AddCronDialog
                open={showAddCronDialog}
                onOpenChange={setShowAddCronDialog}
                workerName={worker.name}
                onConfirm={(cron) => { void handleAddCron(cron) }}
                loading={addingCron}
            />
        </div>
    )
}
