/**
 * API service for worker-manager
 * Handles all HTTP requests to the backend
 */

import { getCached, setCache, invalidateCache, METRICS_TTL } from './cache'

const API_BASE = '/api'

interface ApiResponse<T> {
    success: boolean
    result?: T
    error?: string
    errors?: { code: number; message: string }[]
}

interface FetchOptions {
    skipCache?: boolean
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {},
    fetchOptions: FetchOptions = {}
): Promise<ApiResponse<T>> {
    const cacheKey = `${options.method ?? 'GET'}:${endpoint}`

    // Check cache for GET requests
    if ((options.method ?? 'GET') === 'GET' && !fetchOptions.skipCache) {
        const cached = getCached(cacheKey) as ApiResponse<T> | null
        if (cached) {
            return cached
        }
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers as Record<string, string> | undefined),
            },
        })

        const data = await response.json() as ApiResponse<T>

        // Cache successful GET responses
        if ((options.method ?? 'GET') === 'GET' && data.success) {
            setCache(cacheKey, data)
        }

        return data
    } catch (error) {
        console.error(`[API] Error fetching ${endpoint}:`, error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        }
    }
}

// ============================================================================
// Workers API
// ============================================================================

export interface Worker {
    id: string
    name: string
    created_on: string
    modified_on: string
    etag?: string
    handlers?: string[]
    usage_model?: string
    compatibility_date?: string
    compatibility_flags?: string[]
}

export interface WorkerDetails extends Worker {
    routes?: WorkerRoute[]
    domains?: WorkerDomain[]
    secrets?: WorkerSecret[]
    crons?: WorkerCron[]
    bindings?: WorkerBinding[]
}

export interface WorkerRoute {
    id: string
    pattern: string
    zone_id?: string
    zone_name?: string
}

export interface WorkerDomain {
    id: string
    hostname: string
    zone_id: string
    zone_name: string
    service: string
    environment: string
}

export interface WorkerSecret {
    name: string
    type: string
}

export interface WorkerCron {
    cron: string
    created_on: string
    modified_on: string
}

export interface WorkerBinding {
    name: string
    type: string
    bucket_name?: string
    database_id?: string
    namespace_id?: string
    class_name?: string
    queue_name?: string
}

/**
 * List all Workers
 */
export async function listWorkers(options?: FetchOptions): Promise<ApiResponse<Worker[]>> {
    return apiFetch<Worker[]>('/workers', {}, options)
}

/**
 * Get Worker details
 */
export async function getWorker(name: string, options?: FetchOptions): Promise<ApiResponse<WorkerDetails>> {
    return apiFetch<WorkerDetails>(`/workers/${encodeURIComponent(name)}`, {}, options)
}

/**
 * Create a new Worker
 */
export async function createWorker(data: {
    name: string
    script?: string
    compatibility_date?: string
}): Promise<ApiResponse<Worker>> {
    invalidateCache('/workers')
    return apiFetch<Worker>('/workers', {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

/**
 * Update a Worker
 */
export async function updateWorker(
    name: string,
    data: Partial<Worker>
): Promise<ApiResponse<Worker>> {
    invalidateCache('/workers')
    invalidateCache(`/workers/${name}`)
    return apiFetch<Worker>(`/workers/${encodeURIComponent(name)}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })
}

/**
 * Delete a Worker
 */
export async function deleteWorker(name: string): Promise<ApiResponse<null>> {
    invalidateCache('/workers')
    invalidateCache(`/workers/${name}`)
    return apiFetch<null>(`/workers/${encodeURIComponent(name)}`, {
        method: 'DELETE',
    })
}

/**
 * Clone a Worker
 */
export async function cloneWorker(
    sourceName: string,
    newName: string
): Promise<ApiResponse<Worker>> {
    invalidateCache('/workers')
    return apiFetch<Worker>(`/workers/${encodeURIComponent(sourceName)}/clone`, {
        method: 'POST',
        body: JSON.stringify({ name: newName }),
    })
}

/**
 * Get Worker routes
 */
export async function getWorkerRoutes(name: string, options?: FetchOptions): Promise<ApiResponse<WorkerRoute[]>> {
    return apiFetch<WorkerRoute[]>(`/workers/${encodeURIComponent(name)}/routes`, {}, options)
}

export interface Zone {
    id: string
    name: string
    status: string
}

/**
 * List available zones
 */
export async function listZones(options?: FetchOptions): Promise<ApiResponse<Zone[]>> {
    return apiFetch<Zone[]>('/zones', {}, options)
}

/**
 * Create a Worker route
 */
export async function createWorkerRoute(
    workerName: string,
    pattern: string,
    zoneId: string
): Promise<ApiResponse<WorkerRoute>> {
    invalidateCache(`/workers/${workerName}/routes`)
    return apiFetch<WorkerRoute>(`/workers/${encodeURIComponent(workerName)}/routes`, {
        method: 'POST',
        body: JSON.stringify({ pattern, zone_id: zoneId }),
    })
}

/**
 * Delete a Worker route
 */
export async function deleteWorkerRoute(
    workerName: string,
    routeId: string,
    zoneId: string
): Promise<ApiResponse<null>> {
    invalidateCache(`/workers/${workerName}/routes`)
    return apiFetch<null>(`/workers/${encodeURIComponent(workerName)}/routes/${encodeURIComponent(routeId)}?zone_id=${encodeURIComponent(zoneId)}`, {
        method: 'DELETE',
    })
}

/**
 * Get Worker secrets (names only)
 */
export async function getWorkerSecrets(name: string, options?: FetchOptions): Promise<ApiResponse<WorkerSecret[]>> {
    return apiFetch<WorkerSecret[]>(`/workers/${encodeURIComponent(name)}/secrets`, {}, options)
}

/**
 * Set a Worker secret
 */
export async function setWorkerSecret(
    workerName: string,
    secretName: string,
    value: string
): Promise<ApiResponse<null>> {
    invalidateCache(`/workers/${workerName}/secrets`)
    return apiFetch<null>(`/workers/${encodeURIComponent(workerName)}/secrets`, {
        method: 'POST',
        body: JSON.stringify({ name: secretName, value }),
    })
}

/**
 * Delete a Worker secret
 */
export async function deleteWorkerSecret(
    workerName: string,
    secretName: string
): Promise<ApiResponse<null>> {
    invalidateCache(`/workers/${workerName}/secrets`)
    return apiFetch<null>(`/workers/${encodeURIComponent(workerName)}/secrets/${encodeURIComponent(secretName)}`, {
        method: 'DELETE',
    })
}

/**
 * Worker settings types
 */
export interface WorkerSettings {
    bindings: WorkerBinding[]
    usage_model?: string
    compatibility_date?: string
    compatibility_flags?: string[]
    logpush?: boolean
}

export interface WorkerSchedule {
    cron: string
    created_on: string
    modified_on: string
}

export interface SubdomainStatus {
    enabled: boolean
}

/**
 * Get Worker settings (bindings, usage model, etc.)
 */
export async function getWorkerSettings(name: string, options?: FetchOptions): Promise<ApiResponse<WorkerSettings>> {
    return apiFetch<WorkerSettings>(`/workers/${encodeURIComponent(name)}/settings`, {}, options)
}

/**
 * Get Worker schedules (cron triggers)
 */
export async function getWorkerSchedules(name: string, options?: FetchOptions): Promise<ApiResponse<{ schedules: WorkerSchedule[] }>> {
    return apiFetch<{ schedules: WorkerSchedule[] }>(`/workers/${encodeURIComponent(name)}/schedules`, {}, options)
}

/**
 * Update Worker schedules (cron triggers)
 */
export async function updateWorkerSchedules(
    name: string,
    schedules: { cron: string }[]
): Promise<ApiResponse<{ schedules: WorkerSchedule[] }>> {
    invalidateCache(`/workers/${name}/schedules`)
    return apiFetch<{ schedules: WorkerSchedule[] }>(`/workers/${encodeURIComponent(name)}/schedules`, {
        method: 'PUT',
        body: JSON.stringify({ schedules }),
    })
}

/**
 * Get Worker subdomain status (workers.dev enabled/disabled)
 */
export async function getWorkerSubdomain(name: string, options?: FetchOptions): Promise<ApiResponse<SubdomainStatus>> {
    return apiFetch<SubdomainStatus>(`/workers/${encodeURIComponent(name)}/subdomain`, {}, options)
}

/**
 * Update Worker subdomain status
 */
export async function updateWorkerSubdomain(
    name: string,
    enabled: boolean
): Promise<ApiResponse<SubdomainStatus>> {
    return apiFetch<SubdomainStatus>(`/workers/${encodeURIComponent(name)}/subdomain`, {
        method: 'PUT',
        body: JSON.stringify({ enabled }),
    })
}

export interface AccountSubdomain {
    subdomain: string
}

/**
 * Get the account's workers.dev subdomain
 */
export async function getAccountSubdomain(options?: FetchOptions): Promise<ApiResponse<AccountSubdomain>> {
    return apiFetch<AccountSubdomain>('/workers-subdomain', {}, options)
}

// ============================================================================
// Pages API
// ============================================================================

export interface PagesProject {
    id: string
    name: string
    subdomain: string
    created_on: string
    production_branch: string
    canonical_deployment?: PagesDeployment
    latest_deployment?: PagesDeployment
    domains?: string[]
    source?: {
        type: 'github' | 'gitlab' | 'direct_upload'
        config?: {
            owner?: string
            repo_name?: string
            production_branch?: string
        }
    }
    build_config?: {
        build_command?: string
        destination_dir?: string
        root_dir?: string
    }
}

export interface PagesDeployment {
    id: string
    short_id: string
    project_id: string
    project_name: string
    environment: 'production' | 'preview'
    url: string
    created_on: string
    modified_on: string
    aliases?: string[]
    latest_stage?: {
        name: string
        status: 'success' | 'failure' | 'active' | 'canceled' | 'idle'
        started_on?: string
        ended_on?: string
    }
    deployment_trigger?: {
        type: 'ad_hoc' | 'github' | 'gitlab' | 'api'
        metadata?: {
            branch?: string
            commit_hash?: string
            commit_message?: string
        }
    }
}

export interface PagesDomain {
    id: string
    name: string
    status: 'active' | 'pending' | 'moved' | 'deleted'
    zone_tag?: string
    created_on: string
}

/**
 * List all Pages projects
 */
export async function listPages(options?: FetchOptions): Promise<ApiResponse<PagesProject[]>> {
    return apiFetch<PagesProject[]>('/pages', {}, options)
}

/**
 * Get Pages project details
 */
export async function getPage(name: string, options?: FetchOptions): Promise<ApiResponse<PagesProject>> {
    return apiFetch<PagesProject>(`/pages/${encodeURIComponent(name)}`, {}, options)
}

/**
 * Delete a Pages project
 */
export async function deletePage(name: string): Promise<ApiResponse<null>> {
    invalidateCache('/pages')
    invalidateCache(`/pages/${name}`)
    return apiFetch<null>(`/pages/${encodeURIComponent(name)}`, {
        method: 'DELETE',
    })
}

/**
 * Get Pages project deployments
 */
export async function getPageDeployments(
    name: string,
    options?: FetchOptions
): Promise<ApiResponse<PagesDeployment[]>> {
    return apiFetch<PagesDeployment[]>(`/pages/${encodeURIComponent(name)}/deployments`, {}, options)
}

/**
 * Get Pages project domains
 */
export async function getPageDomains(
    name: string,
    options?: FetchOptions
): Promise<ApiResponse<PagesDomain[]>> {
    return apiFetch<PagesDomain[]>(`/pages/${encodeURIComponent(name)}/domains`, {}, options)
}

/**
 * Add a custom domain to a Pages project
 */
export async function addPageDomain(
    projectName: string,
    domain: string
): Promise<ApiResponse<PagesDomain>> {
    invalidateCache(`/pages/${projectName}/domains`)
    return apiFetch<PagesDomain>(`/pages/${encodeURIComponent(projectName)}/domains`, {
        method: 'POST',
        body: JSON.stringify({ domain }),
    })
}

/**
 * Delete a custom domain from a Pages project
 */
export async function deletePageDomain(
    projectName: string,
    domainName: string
): Promise<ApiResponse<null>> {
    invalidateCache(`/pages/${projectName}/domains`)
    return apiFetch<null>(`/pages/${encodeURIComponent(projectName)}/domains/${encodeURIComponent(domainName)}`, {
        method: 'DELETE',
    })
}

/**
 * Rollback a Pages deployment
 */
export async function rollbackPageDeployment(
    projectName: string,
    deploymentId: string
): Promise<ApiResponse<PagesDeployment>> {
    invalidateCache(`/pages/${projectName}`)
    return apiFetch<PagesDeployment>(`/pages/${encodeURIComponent(projectName)}/rollback`, {
        method: 'POST',
        body: JSON.stringify({ deployment_id: deploymentId }),
    })
}

// ============================================================================
// Metrics API
// ============================================================================

export interface Metrics {
    requests: number
    success_rate: number
    errors: number
    cpu_time_p50: number
    cpu_time_p90: number
    cpu_time_p99: number
    duration_p50: number
    duration_p90: number
    duration_p99: number
    time_range: string
}

/**
 * Get metrics
 */
export async function getMetrics(
    range: '1h' | '6h' | '24h' | '7d' | '30d' = '24h',
    options?: FetchOptions
): Promise<ApiResponse<Metrics>> {
    const ttl = METRICS_TTL
    const cacheKey = `GET:/metrics?range=${range}`

    if (!options?.skipCache) {
        const cached = getCached(cacheKey, ttl) as ApiResponse<Metrics> | null
        if (cached) return cached
    }

    const result = await apiFetch<Metrics>(`/metrics?range=${range}`, {}, { skipCache: true })

    if (result.success) {
        setCache(cacheKey, result)
    }

    return result
}

// ============================================================================
// Jobs API  
// ============================================================================

export interface Job {
    id: string
    operation_type: string
    entity_type: 'worker' | 'page'
    entity_id: string | null
    entity_name: string | null
    status: 'running' | 'success' | 'failed'
    progress: number
    item_count: number
    started_at: string
    completed_at: string | null
    error_message: string | null
    user_email: string | null
}

/**
 * List jobs
 */
export async function listJobs(options?: FetchOptions): Promise<ApiResponse<Job[]>> {
    return apiFetch<Job[]>('/jobs', {}, options)
}

// ============================================================================
// Webhooks API
// ============================================================================

export interface Webhook {
    id: string
    name: string
    url: string
    events: string
    secret: string | null
    enabled: number
    created_at: string
    updated_at: string
}

/**
 * List webhooks
 */
export async function listWebhooks(options?: FetchOptions): Promise<ApiResponse<Webhook[]>> {
    return apiFetch<Webhook[]>('/webhooks', {}, options)
}

/**
 * Create a webhook
 */
export async function createWebhook(data: {
    name: string
    url: string
    events: string[]
    secret?: string
}): Promise<ApiResponse<Webhook>> {
    invalidateCache('/webhooks')
    return apiFetch<Webhook>('/webhooks', {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

/**
 * Update a webhook
 */
export async function updateWebhook(
    id: string,
    data: Partial<Webhook>
): Promise<ApiResponse<Webhook>> {
    invalidateCache('/webhooks')
    return apiFetch<Webhook>(`/webhooks/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })
}

/**
 * Delete a webhook
 */
export async function deleteWebhook(id: string): Promise<ApiResponse<null>> {
    invalidateCache('/webhooks')
    return apiFetch<null>(`/webhooks/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    })
}

// ============================================================================
// Backups API
// ============================================================================

export interface Backup {
    id: string
    entity_type: 'worker' | 'page'
    entity_id: string
    entity_name: string
    r2_key: string
    backup_type: 'manual' | 'pre_delete' | 'scheduled'
    size_bytes: number
    created_at: string
    created_by: string | null
}

/**
 * List backups
 */
export async function listBackups(options?: FetchOptions): Promise<ApiResponse<Backup[]>> {
    return apiFetch<Backup[]>('/backups', {}, options)
}

/**
 * Create a backup
 */
export async function createBackup(
    entityType: 'worker' | 'page',
    entityName: string
): Promise<ApiResponse<Backup>> {
    invalidateCache('/backups')
    return apiFetch<Backup>('/backups', {
        method: 'POST',
        body: JSON.stringify({ entity_type: entityType, entity_name: entityName }),
    })
}

/**
 * Restore from backup
 */
export async function restoreBackup(backupId: string): Promise<ApiResponse<null>> {
    return apiFetch<null>(`/backups/${encodeURIComponent(backupId)}/restore`, {
        method: 'POST',
    })
}
