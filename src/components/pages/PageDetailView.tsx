import { useState, useEffect } from 'react'
import {
    ArrowLeft,
    Globe,
    GitBranch,
    History,
    Link2,
    Trash2,
    RefreshCw,
    ExternalLink,
    Settings,
    Undo2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    type PagesProject,
    type PagesDeployment,
    type PagesDomain,
    getPageDeployments,
    getPageDomains,
    deletePage,
    rollbackPageDeployment
} from '@/lib/api'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { DeletePageDialog } from './DeletePageDialog'

interface PageDetailViewProps {
    page: PagesProject
    onBack: () => void
    onRefresh: () => void
}

export function PageDetailView({ page, onBack, onRefresh }: PageDetailViewProps): React.ReactNode {
    const [deployments, setDeployments] = useState<PagesDeployment[]>([])
    const [domains, setDomains] = useState<PagesDomain[]>([])
    const [loading, setLoading] = useState(true)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [rollingBack, setRollingBack] = useState<string | null>(null)

    useEffect(() => {
        const fetchDetails = async (): Promise<void> => {
            setLoading(true)

            const [deploymentsRes, domainsRes] = await Promise.all([
                getPageDeployments(page.name),
                getPageDomains(page.name),
            ])

            if (deploymentsRes.success && deploymentsRes.result) {
                setDeployments(deploymentsRes.result)
            }
            if (domainsRes.success && domainsRes.result) {
                setDomains(domainsRes.result)
            }

            setLoading(false)
        }

        void fetchDetails()
    }, [page.name])

    const handleDelete = async (): Promise<void> => {
        setDeleting(true)
        const response = await deletePage(page.name)
        setDeleting(false)

        if (response.success) {
            onRefresh()
            onBack()
        }
    }

    const handleRollback = async (deploymentId: string): Promise<void> => {
        setRollingBack(deploymentId)
        const response = await rollbackPageDeployment(page.name, deploymentId)
        setRollingBack(null)

        if (response.success) {
            onRefresh()
        }
    }

    const latestDeploy = page.latest_deployment
    const productionUrl = `https://${page.subdomain}.pages.dev`

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
                            <Globe className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-bold tracking-tight">{page.name}</h1>
                        </div>
                        <p className="text-muted-foreground">
                            Created {formatRelativeTime(page.created_on)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <a
                            href={`https://dash.cloudflare.com/?to=/:account/pages/view/${page.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open in Cloudflare Dashboard"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
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
                            <Badge variant={latestDeploy?.latest_stage?.status === 'success' ? 'success' : 'secondary'}>
                                {latestDeploy?.latest_stage?.status ?? 'No deployments'}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Production Branch</CardDescription>
                        <CardTitle className="text-lg flex items-center gap-1">
                            <GitBranch className="h-4 w-4" />
                            {page.production_branch}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Deployments</CardDescription>
                        <CardTitle className="text-lg">{deployments.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Custom Domains</CardDescription>
                        <CardTitle className="text-lg">{domains.length}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Production URL */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Production URL:</span>
                            <code className="text-sm bg-muted px-2 py-0.5 rounded">{productionUrl}</code>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <a href={productionUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Source Info */}
            {page.source && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <GitBranch className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Source:</span>
                                <Badge variant="secondary">{page.source.type}</Badge>
                            </div>
                            {page.source.config?.owner && page.source.config?.repo_name && (
                                <a
                                    href={`https://github.com/${page.source.config.owner}/${page.source.config.repo_name}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline"
                                >
                                    {page.source.config.owner}/{page.source.config.repo_name}
                                </a>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tabs */}
            <Tabs defaultValue="deployments" className="w-full">
                <TabsList>
                    <TabsTrigger value="deployments" className="gap-2">
                        <History className="h-4 w-4" />
                        Deployments
                    </TabsTrigger>
                    <TabsTrigger value="domains" className="gap-2">
                        <Link2 className="h-4 w-4" />
                        Domains
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Build Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="deployments" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Deployment History</CardTitle>
                            <CardDescription>Recent deployments for this project</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                                    ))}
                                </div>
                            ) : deployments.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No deployments yet</p>
                            ) : (
                                <div className="space-y-2">
                                    {deployments.slice(0, 10).map((deploy) => (
                                        <div key={deploy.id} className="flex items-center justify-between p-3 rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                <Badge variant={
                                                    deploy.latest_stage?.status === 'success' ? 'success'
                                                        : deploy.latest_stage?.status === 'failure' ? 'destructive'
                                                            : 'secondary'
                                                }>
                                                    {deploy.environment}
                                                </Badge>
                                                <div>
                                                    <p className="text-sm font-medium">{deploy.short_id}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDateTime(deploy.created_on)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a href={deploy.url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                                {deploy.environment === 'production' && deploy.id !== latestDeploy?.id && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={rollingBack === deploy.id}
                                                        onClick={() => { void handleRollback(deploy.id) }}
                                                    >
                                                        {rollingBack === deploy.id ? (
                                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Undo2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="domains" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Custom Domains</CardTitle>
                            <CardDescription>Custom domains pointing to this project</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-20 bg-muted animate-pulse rounded" />
                            ) : domains.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No custom domains configured</p>
                            ) : (
                                <div className="space-y-2">
                                    {domains.map((domain) => (
                                        <div key={domain.id} className="flex items-center justify-between p-3 rounded-lg border">
                                            <div className="flex items-center gap-2">
                                                <Link2 className="h-4 w-4 text-muted-foreground" />
                                                <code className="text-sm">{domain.name}</code>
                                            </div>
                                            <Badge variant={domain.status === 'active' ? 'success' : 'secondary'}>
                                                {domain.status}
                                            </Badge>
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
                            <CardTitle>Build Configuration</CardTitle>
                            <CardDescription>Build settings for this project</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {page.build_config ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium">Build Command</p>
                                        <code className="text-sm text-muted-foreground">
                                            {page.build_config.build_command ?? 'Not set'}
                                        </code>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Output Directory</p>
                                        <code className="text-sm text-muted-foreground">
                                            {page.build_config.destination_dir ?? 'Not set'}
                                        </code>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Root Directory</p>
                                        <code className="text-sm text-muted-foreground">
                                            {page.build_config.root_dir ?? '/'}
                                        </code>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">No build configuration</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <DeletePageDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                pageName={page.name}
                onConfirm={() => { void handleDelete() }}
                loading={deleting}
            />
        </div>
    )
}
