/**
 * Workers API routes
 */

import { type Env, CF_API } from '../types'
import { corsHeaders } from '../utils/cors'

interface WorkerScript {
    id: string
    name?: string
    etag: string
    handlers: string[]
    modified_on: string
    created_on: string
    usage_model?: string
    compatibility_date?: string
    compatibility_flags?: string[]
}

// Hidden workers - these won't appear in the UI
// Add worker names here to hide them from the list
const hiddenWorkers = [
    'worker-manager',
    'r2',
    'kv-manager',
    'do-manager',
    'sqlite-wiki-search',
    'd1-manager',
    'container-manager',
    'adamic-blog',
    'do-test-worker',
]

export async function handleWorkersRoutes(
    request: Request,
    env: Env,
    url: URL,
    isLocal: boolean,
    _userEmail: string
): Promise<Response> {
    const path = url.pathname
    const method = request.method

    // GET /api/workers - List all workers
    if (path === '/api/workers' && method === 'GET') {
        return listWorkers(env, isLocal)
    }

    // Match /api/workers/:name patterns
    const workerMatch = path.match(/^\/api\/workers\/([^/]+)$/)
    if (workerMatch) {
        const workerName = decodeURIComponent(workerMatch[1] ?? '')

        if (method === 'GET') {
            return getWorker(env, workerName, isLocal)
        }
        if (method === 'DELETE') {
            return deleteWorker(env, workerName)
        }
    }

    // GET /api/workers/:name/routes
    const routesMatch = path.match(/^\/api\/workers\/([^/]+)\/routes$/)
    if (routesMatch && method === 'GET') {
        const workerName = decodeURIComponent(routesMatch[1] ?? '')
        return getWorkerRoutes(env, workerName, isLocal)
    }

    // GET /api/workers/:name/secrets
    const secretsMatch = path.match(/^\/api\/workers\/([^/]+)\/secrets$/)
    if (secretsMatch && method === 'GET') {
        const workerName = decodeURIComponent(secretsMatch[1] ?? '')
        return getWorkerSecrets(env, workerName, isLocal)
    }

    // POST /api/workers/:name/clone
    const cloneMatch = path.match(/^\/api\/workers\/([^/]+)\/clone$/)
    if (cloneMatch && method === 'POST') {
        const workerName = decodeURIComponent(cloneMatch[1] ?? '')
        const body = await request.json() as { name: string }
        return cloneWorker(env, workerName, body.name)
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

async function listWorkers(env: Env, isLocal: boolean): Promise<Response> {
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

    const response = await fetch(
        `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts`,
        {
            headers: {
                'Authorization': `Bearer ${env.API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    )

    const data = await response.json() as { success: boolean; result?: WorkerScript[]; errors?: unknown[] }

    // Transform the response to add 'name' field from 'id' if not present
    // The Cloudflare API returns scripts where 'id' is the script name
    // Also filter out hidden workers
    if (data.success && data.result) {
        data.result = data.result
            .filter((script) => !hiddenWorkers.includes(script.id))
            .map((script) => ({
                ...script,
                name: script.id, // In CF API, the script id IS the name
            }))
    }

    return new Response(JSON.stringify(data), {
        status: response.ok ? 200 : response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

async function getWorker(env: Env, name: string, isLocal: boolean): Promise<Response> {
    if (isLocal) {
        return new Response(JSON.stringify({
            success: true,
            result: {
                id: `worker-${name}`,
                name,
                created_on: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                modified_on: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                handlers: ['fetch'],
                compatibility_date: '2024-01-01',
            },
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    const response = await fetch(
        `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${name}`,
        {
            headers: {
                'Authorization': `Bearer ${env.API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    )

    const data = await response.json() as { success: boolean; result?: WorkerScript; errors?: unknown[] }

    return new Response(JSON.stringify(data), {
        status: response.ok ? 200 : response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

async function getWorkerRoutes(env: Env, name: string, isLocal: boolean): Promise<Response> {
    if (isLocal) {
        return new Response(JSON.stringify({
            success: true,
            result: [
                { id: 'route-1', pattern: `${name}.example.com/*`, zone_name: 'example.com' },
            ],
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    // Get routes from all zones - this is a simplified implementation
    // In production, you'd need to query all zones and filter by script name
    const response = await fetch(
        `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${name}/routes`,
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

async function getWorkerSecrets(env: Env, name: string, isLocal: boolean): Promise<Response> {
    if (isLocal) {
        return new Response(JSON.stringify({
            success: true,
            result: [
                { name: 'API_KEY', type: 'secret_text' },
                { name: 'DATABASE_URL', type: 'secret_text' },
            ],
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    const response = await fetch(
        `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${name}/secrets`,
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

async function deleteWorker(env: Env, name: string): Promise<Response> {
    // TODO: Create R2 backup before deletion

    const response = await fetch(
        `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${name}`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${env.API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    )

    const data = await response.json() as { success: boolean; errors?: unknown[] }

    return new Response(JSON.stringify(data), {
        status: response.ok ? 200 : response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

async function cloneWorker(env: Env, sourceName: string, newName: string): Promise<Response> {
    // Step 1: Get the source worker script
    const getResponse = await fetch(
        `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${sourceName}`,
        {
            headers: {
                'Authorization': `Bearer ${env.API_KEY}`,
            },
        }
    )

    if (!getResponse.ok) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to fetch source worker',
        }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    const scriptContent = await getResponse.text()

    // Step 2: Create new worker with the same script
    const createResponse = await fetch(
        `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${newName}`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${env.API_KEY}`,
                'Content-Type': 'application/javascript',
            },
            body: scriptContent,
        }
    )

    const data = await createResponse.json() as { success: boolean; result?: unknown; errors?: unknown[] }

    return new Response(JSON.stringify(data), {
        status: createResponse.ok ? 200 : createResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}
