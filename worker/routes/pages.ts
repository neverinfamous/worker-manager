/**
 * Pages API routes
 */

import { type Env, CF_API } from '../types'
import { corsHeaders } from '../utils/cors'

// Hidden pages - these won't appear in the UI
// Add project names here to hide them from the list
const hiddenPages: string[] = [
    // Add page project names here, e.g.:
    // 'internal-docs',
    // 'staging-site',
]

export async function handlePagesRoutes(
    request: Request,
    env: Env,
    url: URL,
    isLocal: boolean,
    _userEmail: string
): Promise<Response> {
    const path = url.pathname
    const method = request.method

    // GET /api/pages - List all pages projects
    if (path === '/api/pages' && method === 'GET') {
        return listPages(env, isLocal)
    }

    // Match /api/pages/:name patterns
    const pageMatch = path.match(/^\/api\/pages\/([^/]+)$/)
    if (pageMatch) {
        const pageName = decodeURIComponent(pageMatch[1] ?? '')

        if (method === 'GET') {
            return getPage(env, pageName, isLocal)
        }
        if (method === 'DELETE') {
            return deletePage(env, pageName)
        }
    }

    // GET /api/pages/:name/deployments
    const deploymentsMatch = path.match(/^\/api\/pages\/([^/]+)\/deployments$/)
    if (deploymentsMatch && method === 'GET') {
        const pageName = decodeURIComponent(deploymentsMatch[1] ?? '')
        return getPageDeployments(env, pageName, isLocal)
    }

    // GET /api/pages/:name/domains
    const domainsMatch = path.match(/^\/api\/pages\/([^/]+)\/domains$/)
    if (domainsMatch && method === 'GET') {
        const pageName = decodeURIComponent(domainsMatch[1] ?? '')
        return getPageDomains(env, pageName, isLocal)
    }

    // POST /api/pages/:name/rollback
    const rollbackMatch = path.match(/^\/api\/pages\/([^/]+)\/rollback$/)
    if (rollbackMatch && method === 'POST') {
        const pageName = decodeURIComponent(rollbackMatch[1] ?? '')
        const body = await request.json() as { deployment_id: string }
        return rollbackDeployment(env, pageName, body.deployment_id)
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

async function listPages(env: Env, isLocal: boolean): Promise<Response> {
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
                        project_id: 'page-1',
                        project_name: 'marketing-site',
                        environment: 'production',
                        url: 'https://abc123.marketing-site.pages.dev',
                        created_on: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                        modified_on: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                        latest_stage: { name: 'deploy', status: 'success' },
                    },
                    source: { type: 'github', config: { owner: 'example', repo_name: 'marketing-site' } },
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
                        project_id: 'page-2',
                        project_name: 'docs-portal',
                        environment: 'production',
                        url: 'https://def456.docs-portal.pages.dev',
                        created_on: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                        modified_on: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                        latest_stage: { name: 'deploy', status: 'success' },
                    },
                    source: { type: 'github', config: { owner: 'example', repo_name: 'docs' } },
                },
            ],
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    const response = await fetch(
        `${CF_API}/accounts/${env.ACCOUNT_ID}/pages/projects`,
        {
            headers: {
                'Authorization': `Bearer ${env.API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    )

    const data = await response.json() as { success: boolean; result?: Array<{ name: string }>; errors?: unknown[] }

    // Filter out hidden pages
    if (data.success && data.result && hiddenPages.length > 0) {
        data.result = data.result.filter((page) => !hiddenPages.includes(page.name))
    }

    return new Response(JSON.stringify(data), {
        status: response.ok ? 200 : response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

async function getPage(env: Env, name: string, isLocal: boolean): Promise<Response> {
    if (isLocal) {
        return new Response(JSON.stringify({
            success: true,
            result: {
                id: `page-${name}`,
                name,
                subdomain: name,
                created_on: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                production_branch: 'main',
                build_config: {
                    build_command: 'npm run build',
                    destination_dir: 'dist',
                    root_dir: '/',
                },
            },
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    const response = await fetch(
        `${CF_API}/accounts/${env.ACCOUNT_ID}/pages/projects/${name}`,
        {
            headers: {
                'Authorization': `Bearer ${env.API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    )

    const data = await response.json() as { success: boolean; result?: unknown; errors?: unknown[] }

    return new Response(JSON.stringify(data), {
        status: response.ok ? 200 : response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

async function getPageDeployments(env: Env, name: string, isLocal: boolean): Promise<Response> {
    if (isLocal) {
        return new Response(JSON.stringify({
            success: true,
            result: [
                {
                    id: 'deploy-1',
                    short_id: 'abc123',
                    project_id: `page-${name}`,
                    project_name: name,
                    environment: 'production',
                    url: `https://abc123.${name}.pages.dev`,
                    created_on: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                    modified_on: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                    latest_stage: { name: 'deploy', status: 'success' },
                    deployment_trigger: { type: 'github', metadata: { branch: 'main', commit_hash: 'abc1234' } },
                },
                {
                    id: 'deploy-2',
                    short_id: 'def456',
                    project_id: `page-${name}`,
                    project_name: name,
                    environment: 'production',
                    url: `https://def456.${name}.pages.dev`,
                    created_on: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    modified_on: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    latest_stage: { name: 'deploy', status: 'success' },
                    deployment_trigger: { type: 'github', metadata: { branch: 'main', commit_hash: 'def4567' } },
                },
                {
                    id: 'deploy-3',
                    short_id: 'ghi789',
                    project_id: `page-${name}`,
                    project_name: name,
                    environment: 'preview',
                    url: `https://ghi789.${name}.pages.dev`,
                    created_on: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    modified_on: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    latest_stage: { name: 'deploy', status: 'success' },
                    deployment_trigger: { type: 'github', metadata: { branch: 'feature/new-design', commit_hash: 'ghi7890' } },
                },
            ],
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    const response = await fetch(
        `${CF_API}/accounts/${env.ACCOUNT_ID}/pages/projects/${name}/deployments`,
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

async function getPageDomains(env: Env, name: string, isLocal: boolean): Promise<Response> {
    if (isLocal) {
        return new Response(JSON.stringify({
            success: true,
            result: [
                { id: 'domain-1', name: 'www.example.com', status: 'active', created_on: new Date().toISOString() },
            ],
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    const response = await fetch(
        `${CF_API}/accounts/${env.ACCOUNT_ID}/pages/projects/${name}/domains`,
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

async function deletePage(env: Env, name: string): Promise<Response> {
    // TODO: Create R2 backup before deletion

    const response = await fetch(
        `${CF_API}/accounts/${env.ACCOUNT_ID}/pages/projects/${name}`,
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

async function rollbackDeployment(env: Env, projectName: string, deploymentId: string): Promise<Response> {
    const response = await fetch(
        `${CF_API}/accounts/${env.ACCOUNT_ID}/pages/projects/${projectName}/deployments/${deploymentId}/rollback`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    )

    const data = await response.json() as { success: boolean; result?: unknown; errors?: unknown[] }

    return new Response(JSON.stringify(data), {
        status: response.ok ? 200 : response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}
