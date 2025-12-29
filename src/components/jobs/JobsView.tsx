import { useState, useEffect } from 'react'
import {
    History,
    RefreshCw,
    Search,
    CheckCircle2,
    XCircle,
    Loader2,
    Clock,
    FileCode,
    Globe,
    Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { listJobs, type Job } from '@/lib/api'
import { formatRelativeTime, formatDuration } from '@/lib/format'

type StatusFilter = 'all' | 'running' | 'success' | 'failed'
type EntityFilter = 'all' | 'worker' | 'page'

export function JobsView(): React.ReactNode {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [entityFilter, setEntityFilter] = useState<EntityFilter>('all')

    const fetchJobs = async (skipCache = false): Promise<void> => {
        setLoading(true)
        setError(null)

        const response = await listJobs({ skipCache })

        if (response.success && response.result) {
            setJobs(response.result)
        } else {
            // Mock data for local development
            setJobs([
                {
                    id: 'job-1',
                    operation_type: 'deploy',
                    entity_type: 'worker',
                    entity_id: 'worker-1',
                    entity_name: 'api-gateway',
                    status: 'success',
                    progress: 100,
                    item_count: 1,
                    started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                    completed_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
                    error_message: null,
                    user_email: 'user@example.com',
                },
                {
                    id: 'job-2',
                    operation_type: 'backup',
                    entity_type: 'worker',
                    entity_id: 'worker-2',
                    entity_name: 'auth-service',
                    status: 'success',
                    progress: 100,
                    item_count: 1,
                    started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 45000).toISOString(),
                    error_message: null,
                    user_email: 'user@example.com',
                },
                {
                    id: 'job-3',
                    operation_type: 'delete',
                    entity_type: 'page',
                    entity_id: 'page-1',
                    entity_name: 'old-marketing-site',
                    status: 'failed',
                    progress: 50,
                    item_count: 1,
                    started_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                    completed_at: new Date(Date.now() - 5 * 60 * 60 * 1000 + 120000).toISOString(),
                    error_message: 'Permission denied: requires admin access',
                    user_email: 'user@example.com',
                },
                {
                    id: 'job-4',
                    operation_type: 'clone',
                    entity_type: 'worker',
                    entity_id: 'worker-3',
                    entity_name: 'image-processor',
                    status: 'running',
                    progress: 65,
                    item_count: 1,
                    started_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
                    completed_at: null,
                    error_message: null,
                    user_email: 'user@example.com',
                },
            ])
        }

        setLoading(false)
    }

    useEffect(() => {
        void fetchJobs()
    }, [])

    const filteredJobs = jobs.filter((job) => {
        // Search filter
        const matchesSearch =
            (job.entity_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
            job.operation_type.toLowerCase().includes(searchQuery.toLowerCase())

        // Status filter
        const matchesStatus = statusFilter === 'all' || job.status === statusFilter

        // Entity filter
        const matchesEntity = entityFilter === 'all' || job.entity_type === entityFilter

        return matchesSearch && matchesStatus && matchesEntity
    })

    const runningCount = jobs.filter(j => j.status === 'running').length
    const successCount = jobs.filter(j => j.status === 'success').length
    const failedCount = jobs.filter(j => j.status === 'failed').length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Job History</h1>
                    <p className="text-muted-foreground">
                        Track all operations and their status
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => { void fetchJobs(true) }}
                    disabled={loading}
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Jobs</CardDescription>
                        <CardTitle className="text-2xl">{jobs.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Running</CardDescription>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            {runningCount}
                            {runningCount > 0 && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Successful</CardDescription>
                        <CardTitle className="text-2xl text-green-600 dark:text-green-400">{successCount}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Failed</CardDescription>
                        <CardTitle className="text-2xl text-red-600 dark:text-red-400">{failedCount}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search jobs..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value) }}
                        className="pl-9"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={(v: string) => { setStatusFilter(v as StatusFilter) }}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="running">Running</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={entityFilter} onValueChange={(v: string) => { setEntityFilter(v as EntityFilter) }}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="worker">Workers</SelectItem>
                            <SelectItem value="page">Pages</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="text-sm text-muted-foreground">
                    {filteredJobs.length} of {jobs.length} jobs
                </div>
            </div>

            {/* Jobs List */}
            {error ? (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
                    {error}
                </div>
            ) : loading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 rounded-lg border bg-muted animate-pulse" />
                    ))}
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="rounded-lg border p-8 text-center">
                    <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                        {searchQuery || statusFilter !== 'all' || entityFilter !== 'all'
                            ? 'No jobs match your filters'
                            : 'No jobs recorded yet'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Operations will appear here as you manage Workers and Pages
                    </p>
                </div>
            ) : (
                <div className="rounded-lg border divide-y">
                    {filteredJobs.map((job) => (
                        <JobRow key={job.id} job={job} />
                    ))}
                </div>
            )}
        </div>
    )
}

function JobRow({ job }: { job: Job }): React.ReactNode {
    const duration = job.completed_at && job.started_at
        ? new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()
        : null

    return (
        <div className="p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    {/* Status Icon */}
                    <div className="mt-0.5">
                        {job.status === 'success' && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        {job.status === 'failed' && (
                            <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        {job.status === 'running' && (
                            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                        )}
                    </div>

                    {/* Job Details */}
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{job.operation_type}</span>
                            <Badge variant="secondary" className="gap-1">
                                {job.entity_type === 'worker' ? (
                                    <FileCode className="h-3 w-3" />
                                ) : (
                                    <Globe className="h-3 w-3" />
                                )}
                                {job.entity_type}
                            </Badge>
                            {job.entity_name && (
                                <code className="text-sm bg-muted px-1.5 py-0.5 rounded">{job.entity_name}</code>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatRelativeTime(job.started_at)}
                            </span>
                            {duration !== null && (
                                <span>Duration: {formatDuration(duration)}</span>
                            )}
                            {job.user_email && (
                                <span>by {job.user_email}</span>
                            )}
                        </div>

                        {job.error_message && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                {job.error_message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Status Badge & Progress */}
                <div className="flex items-center gap-3">
                    {job.status === 'running' && (
                        <div className="w-24">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>Progress</span>
                                <span>{job.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all"
                                    style={{ width: `${String(job.progress)}%` }}
                                />
                            </div>
                        </div>
                    )}
                    <Badge variant={
                        job.status === 'success' ? 'success'
                            : job.status === 'failed' ? 'destructive'
                                : 'secondary'
                    }>
                        {job.status}
                    </Badge>
                </div>
            </div>
        </div>
    )
}
