import { useState, useEffect } from 'react'
import {
    Webhook,
    Plus,
    RefreshCw,
    Trash2,
    Edit2,
    Power,
    PowerOff,
    Send,
    CheckCircle2,
    AlertTriangle,
    Link2,
    Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    listWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    type Webhook as WebhookType
} from '@/lib/api'
import { formatRelativeTime } from '@/lib/format'

const EVENT_OPTIONS = [
    { value: 'worker.deployed', label: 'Worker Deployed' },
    { value: 'worker.deleted', label: 'Worker Deleted' },
    { value: 'worker.error', label: 'Worker Error' },
    { value: 'page.deployed', label: 'Page Deployed' },
    { value: 'page.deleted', label: 'Page Deleted' },
    { value: 'page.failed', label: 'Page Build Failed' },
    { value: 'backup.created', label: 'Backup Created' },
    { value: 'backup.restored', label: 'Backup Restored' },
]

export function WebhooksView(): React.ReactNode {
    const [webhooks, setWebhooks] = useState<WebhookType[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [editingWebhook, setEditingWebhook] = useState<WebhookType | null>(null)
    const [deletingWebhook, setDeletingWebhook] = useState<WebhookType | null>(null)
    const [testingId, setTestingId] = useState<string | null>(null)

    const fetchWebhooks = async (skipCache = false): Promise<void> => {
        setLoading(true)

        const response = await listWebhooks({ skipCache })

        if (response.success && response.result) {
            setWebhooks(response.result)
        } else {
            // Mock data for local development
            setWebhooks([
                {
                    id: 'webhook-1',
                    name: 'Slack Notifications',
                    url: 'https://hooks.slack.com/services/xxx/yyy/zzz',
                    events: '["worker.deployed","worker.error"]',
                    secret: null,
                    enabled: 1,
                    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                },
                {
                    id: 'webhook-2',
                    name: 'PagerDuty Alerts',
                    url: 'https://events.pagerduty.com/v2/enqueue',
                    events: '["worker.error","page.failed"]',
                    secret: 'pd_secret_xxx',
                    enabled: 1,
                    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                },
                {
                    id: 'webhook-3',
                    name: 'Analytics Tracker',
                    url: 'https://analytics.example.com/webhook',
                    events: '["worker.deployed","page.deployed"]',
                    secret: null,
                    enabled: 0,
                    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                },
            ])
        }

        setLoading(false)
    }

    useEffect(() => {
        void fetchWebhooks()
    }, [])

    const handleCreate = async (data: { name: string; url: string; events: string[] }): Promise<void> => {
        await createWebhook(data)
        setShowCreateDialog(false)
        void fetchWebhooks(true)
    }

    const handleUpdate = async (id: string, data: Partial<WebhookType>): Promise<void> => {
        await updateWebhook(id, data)
        setEditingWebhook(null)
        void fetchWebhooks(true)
    }

    const handleDelete = async (id: string): Promise<void> => {
        await deleteWebhook(id)
        setDeletingWebhook(null)
        void fetchWebhooks(true)
    }

    const handleToggle = async (webhook: WebhookType): Promise<void> => {
        await updateWebhook(webhook.id, { enabled: webhook.enabled === 1 ? 0 : 1 })
        void fetchWebhooks(true)
    }

    const handleTest = async (id: string): Promise<void> => {
        setTestingId(id)
        // Simulate test request
        await new Promise(resolve => setTimeout(resolve, 1500))
        setTestingId(null)
        // Show success toast (in real implementation)
    }

    const enabledCount = webhooks.filter(w => w.enabled === 1).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Webhooks</h1>
                    <p className="text-muted-foreground">
                        Configure HTTP notifications for events
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => { void fetchWebhooks(true) }}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button className="gap-2" onClick={() => { setShowCreateDialog(true) }}>
                        <Plus className="h-4 w-4" />
                        Add Webhook
                    </Button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Webhooks</CardDescription>
                        <CardTitle className="text-2xl">{webhooks.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Active</CardDescription>
                        <CardTitle className="text-2xl text-green-600 dark:text-green-400">{enabledCount}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Disabled</CardDescription>
                        <CardTitle className="text-2xl text-muted-foreground">{webhooks.length - enabledCount}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Webhooks List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-32 rounded-lg border bg-muted animate-pulse" />
                    ))}
                </div>
            ) : webhooks.length === 0 ? (
                <div className="rounded-lg border p-8 text-center">
                    <Webhook className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No webhooks configured</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Add a webhook to receive notifications for deployments, errors, and more
                    </p>
                    <Button className="mt-4 gap-2" onClick={() => { setShowCreateDialog(true) }}>
                        <Plus className="h-4 w-4" />
                        Add Webhook
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {webhooks.map((webhook) => (
                        <WebhookCard
                            key={webhook.id}
                            webhook={webhook}
                            onEdit={() => { setEditingWebhook(webhook) }}
                            onDelete={() => { setDeletingWebhook(webhook) }}
                            onToggle={() => { void handleToggle(webhook) }}
                            onTest={() => { void handleTest(webhook.id) }}
                            testing={testingId === webhook.id}
                        />
                    ))}
                </div>
            )}

            {/* Create Dialog */}
            <WebhookDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSubmit={(data) => { void handleCreate(data) }}
                title="Create Webhook"
            />

            {/* Edit Dialog */}
            <WebhookDialog
                open={editingWebhook !== null}
                onOpenChange={(open) => { if (!open) setEditingWebhook(null) }}
                onSubmit={(data) => { if (editingWebhook) void handleUpdate(editingWebhook.id, { ...data, events: JSON.stringify(data.events) }) }}
                title="Edit Webhook"
                initialData={editingWebhook ?? undefined}
            />

            {/* Delete Confirmation */}
            <Dialog open={deletingWebhook !== null} onOpenChange={(open) => { if (!open) setDeletingWebhook(null) }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Webhook
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deletingWebhook?.name}</strong>?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setDeletingWebhook(null) }}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deletingWebhook && void handleDelete(deletingWebhook.id)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

interface WebhookCardProps {
    webhook: WebhookType
    onEdit: () => void
    onDelete: () => void
    onToggle: () => void
    onTest: () => void
    testing: boolean
}

function WebhookCard({ webhook, onEdit, onDelete, onToggle, onTest, testing }: WebhookCardProps): React.ReactNode {
    const events = JSON.parse(webhook.events) as string[]

    return (
        <Card className={webhook.enabled === 0 ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <Webhook className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{webhook.name}</CardTitle>
                        <Badge variant={webhook.enabled === 1 ? 'success' : 'secondary'}>
                            {webhook.enabled === 1 ? 'Active' : 'Disabled'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={onTest} disabled={testing || webhook.enabled === 0}>
                            {testing ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onToggle}>
                            {webhook.enabled === 1 ? (
                                <PowerOff className="h-4 w-4" />
                            ) : (
                                <Power className="h-4 w-4" />
                            )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onEdit}>
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onDelete}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <code className="bg-muted px-2 py-0.5 rounded text-xs">{webhook.url}</code>
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {events.map((event) => (
                        <Badge key={event} variant="secondary" className="text-xs">
                            {event}
                        </Badge>
                    ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created {formatRelativeTime(webhook.created_at)}
                    </span>
                    {webhook.secret && (
                        <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            Secret configured
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

interface WebhookDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: { name: string; url: string; events: string[]; secret?: string }) => void
    title: string
    initialData?: WebhookType
}

function WebhookDialog({ open, onOpenChange, onSubmit, title, initialData }: WebhookDialogProps): React.ReactNode {
    const [name, setName] = useState(initialData?.name ?? '')
    const [url, setUrl] = useState(initialData?.url ?? '')
    const [selectedEvents, setSelectedEvents] = useState<string[]>(
        initialData ? JSON.parse(initialData.events) as string[] : []
    )
    const [secret, setSecret] = useState('')

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (open) {
            setName(initialData?.name ?? '')
            setUrl(initialData?.url ?? '')
            setSelectedEvents(initialData ? JSON.parse(initialData.events) as string[] : [])
            setSecret('')
        }
    }, [open, initialData])

    const toggleEvent = (event: string): void => {
        if (selectedEvents.includes(event)) {
            setSelectedEvents(selectedEvents.filter(e => e !== event))
        } else {
            setSelectedEvents([...selectedEvents, event])
        }
    }

    const handleSubmit = (): void => {
        onSubmit({
            name,
            url,
            events: selectedEvents,
            ...(secret ? { secret } : {}),
        })
    }

    const isValid = name.trim() !== '' && url.trim() !== '' && selectedEvents.length > 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Configure a webhook to receive HTTP notifications
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="My Webhook"
                            value={name}
                            onChange={(e) => { setName(e.target.value) }}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="url">URL</Label>
                        <Input
                            id="url"
                            type="url"
                            placeholder="https://example.com/webhook"
                            value={url}
                            onChange={(e) => { setUrl(e.target.value) }}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Events</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {EVENT_OPTIONS.map((option) => (
                                <Button
                                    key={option.value}
                                    type="button"
                                    variant={selectedEvents.includes(option.value) ? 'default' : 'outline'}
                                    size="sm"
                                    className="justify-start"
                                    onClick={() => { toggleEvent(option.value) }}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="secret">Secret (optional)</Label>
                        <Input
                            id="secret"
                            type="password"
                            placeholder="Used for signing payloads"
                            value={secret}
                            onChange={(e) => { setSecret(e.target.value) }}
                        />
                        <p className="text-xs text-muted-foreground">
                            If set, payloads will be signed with HMAC-SHA256
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => { onOpenChange(false) }}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!isValid}>
                        {initialData ? 'Update' : 'Create'} Webhook
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
