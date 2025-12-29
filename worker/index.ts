/**
 * Worker Manager - Cloudflare Worker Entry Point
 * 
 * This Worker handles all API requests for managing Workers and Pages projects.
 */

import { type Env } from './types'
import { handleCORS, corsHeaders } from './utils/cors'
import { validateAuth, isLocalDev } from './utils/auth'

export default {
    async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url)
        const isLocal = isLocalDev(request)

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return handleCORS()
        }

        // Validate authentication (skip for local dev)
        if (!isLocal) {
            const authResult = await validateAuth(request, env)
            if (!authResult.valid) {
                return new Response(JSON.stringify({ error: 'Unauthorized', message: authResult.error }), {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }
        }

        try {
            // Route API requests
            if (url.pathname.startsWith('/api/')) {
                return await handleApiRequest(request, env, url, isLocal)
            }

            // Health check
            if (url.pathname === '/health') {
                return new Response(JSON.stringify({
                    status: 'ok',
                    timestamp: new Date().toISOString(),
                    version: '0.1.0'
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            // Not found
            return new Response(JSON.stringify({ error: 'Not found' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })

        } catch (error) {
            console.error('[ERROR] Unhandled exception:', error)
            return new Response(JSON.stringify({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }
    },
}

async function handleApiRequest(
    request: Request,
    env: Env,
    url: URL,
    isLocal: boolean
): Promise<Response> {
    const path = url.pathname

    // Workers endpoints
    if (path === '/api/workers' && request.method === 'GET') {
        return handleListWorkers(env, isLocal)
    }

    // Pages endpoints  
    if (path === '/api/pages' && request.method === 'GET') {
        return handleListPages(env, isLocal)
    }

    // Metrics endpoint
    if (path === '/api/metrics' && request.method === 'GET') {
        return handleMetrics(env, url, isLocal)
    }

    // Jobs endpoint
    if (path === '/api/jobs' && request.method === 'GET') {
        return handleListJobs(env)
    }

    // Webhooks endpoints
    if (path === '/api/webhooks' && request.method === 'GET') {
        return handleListWebhooks(env)
    }

    // Backups endpoint
    if (path === '/api/backups' && request.method === 'GET') {
        return handleListBackups(env)
    }

    // Not found
    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

/**
 * List all Workers scripts
 */
async function handleListWorkers(env: Env, isLocal: boolean): Promise<Response> {
    // Mock data for local development
    if (isLocal) {
        return new Response(JSON.stringify({
            success: true,
            result: [
                {
                    id: 'worker-1',
                    name: 'api-gateway',
                    created_on: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    modified_on: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    handlers: ['fetch'],
                },
                {
                    id: 'worker-2',
                    name: 'auth-service',
                    created_on: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    modified_on: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    handlers: ['fetch', 'scheduled'],
                },
                {
                    id: 'worker-3',
                    name: 'image-processor',
                    created_on: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                    modified_on: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    handlers: ['fetch'],
                },
            ],
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    // Real API call
    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/workers/scripts`,
        {
            headers: {
                'Authorization': `Bearer ${env.API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    )

    const data = await response.json() as { success: boolean; result?: unknown[]; errors?: unknown[] }

    return new Response(JSON.stringify(data), {
        status: response.ok ? 200 : response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

/**
 * List all Pages projects
 */
async function handleListPages(env: Env, isLocal: boolean): Promise<Response> {
    // Mock data for local development
    if (isLocal) {
        return new Response(JSON.stringify({
            success: true,
            result: [
                {
                    id: 'page-1',
                    name: 'marketing-site',
                    subdomain: 'marketing-site',
                    created_on: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                    production_branch: 'main',
                    latest_deployment: {
                        id: 'deploy-1',
                        short_id: 'abc123',
                        environment: 'production',
                        created_on: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                    },
                },
                {
                    id: 'page-2',
                    name: 'docs-portal',
                    subdomain: 'docs-portal',
                    created_on: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                    production_branch: 'main',
                    latest_deployment: {
                        id: 'deploy-2',
                        short_id: 'def456',
                        environment: 'production',
                        created_on: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    },
                },
            ],
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    // Real API call
    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/pages/projects`,
        {
            headers: {
                'Authorization': `Bearer ${env.API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    )

    const data = await response.json() as { success: boolean; result?: unknown[]; errors?: unknown[] }

    return new Response(JSON.stringify(data), {
        status: response.ok ? 200 : response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

/**
 * Get metrics via GraphQL Analytics
 */
async function handleMetrics(env: Env, url: URL, isLocal: boolean): Promise<Response> {
    const timeRange = url.searchParams.get('range') ?? '24h'

    // Mock data for local development
    if (isLocal) {
        return new Response(JSON.stringify({
            success: true,
            result: {
                requests: 1234567,
                success_rate: 99.8,
                errors: 2468,
                cpu_time_p50: 4.2,
                cpu_time_p90: 8.5,
                cpu_time_p99: 15.3,
                duration_p50: 42,
                duration_p90: 85,
                duration_p99: 153,
                time_range: timeRange,
            },
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    // GraphQL query for Workers analytics
    const now = new Date()
    const start = new Date(now.getTime() - getTimeRangeMs(timeRange))

    const query = `
    query WorkersAnalytics($accountTag: String!, $since: Time!, $until: Time!) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          workersInvocationsAdaptive(
            limit: 1000
            filter: { datetime_geq: $since, datetime_leq: $until }
          ) {
            sum {
              requests
              errors
              cpuTimeUs
            }
            quantiles {
              cpuTimeP50
              cpuTimeP90
              cpuTimeP99
              durationP50
              durationP90
              durationP99
            }
          }
        }
      }
    }
  `

    const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables: {
                accountTag: env.ACCOUNT_ID,
                since: start.toISOString(),
                until: now.toISOString(),
            },
        }),
    })

    const data = await response.json() as { data?: unknown; errors?: unknown[] }

    return new Response(JSON.stringify({
        success: !data.errors,
        result: data.data,
        errors: data.errors,
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

/**
 * List all jobs from D1
 */
async function handleListJobs(env: Env): Promise<Response> {
    try {
        const { results } = await env.METADATA.prepare(
            'SELECT * FROM jobs ORDER BY started_at DESC LIMIT 100'
        ).all()

        return new Response(JSON.stringify({
            success: true,
            result: results,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to list jobs',
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
}

/**
 * List all webhooks from D1
 */
async function handleListWebhooks(env: Env): Promise<Response> {
    try {
        const { results } = await env.METADATA.prepare(
            'SELECT * FROM webhooks ORDER BY created_at DESC'
        ).all()

        return new Response(JSON.stringify({
            success: true,
            result: results,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to list webhooks',
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
}

/**
 * List all backups from D1
 */
async function handleListBackups(env: Env): Promise<Response> {
    try {
        const { results } = await env.METADATA.prepare(
            'SELECT * FROM backups ORDER BY created_at DESC LIMIT 100'
        ).all()

        return new Response(JSON.stringify({
            success: true,
            result: results,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to list backups',
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
}

/**
 * Convert time range string to milliseconds
 */
function getTimeRangeMs(range: string): number {
    const ranges: Record<string, number> = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
    }
    return ranges[range] ?? ranges['24h'] ?? 24 * 60 * 60 * 1000
}
