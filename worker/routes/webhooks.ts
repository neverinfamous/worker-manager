/**
 * Webhooks API routes
 */

import { type Env } from '../types'
import { corsHeaders } from '../utils/cors'

export async function handleWebhooksRoutes(
    request: Request,
    env: Env,
    url: URL
): Promise<Response> {
    const path = url.pathname
    const method = request.method

    // GET /api/webhooks - List all webhooks
    if (path === '/api/webhooks' && method === 'GET') {
        return listWebhooks(env)
    }

    // POST /api/webhooks - Create webhook
    if (path === '/api/webhooks' && method === 'POST') {
        const body = await request.json() as {
            name: string
            url: string
            events: string[]
            secret?: string
        }
        return createWebhook(env, body)
    }

    // Match /api/webhooks/:id patterns
    const webhookMatch = path.match(/^\/api\/webhooks\/([^/]+)$/)
    if (webhookMatch) {
        const webhookId = decodeURIComponent(webhookMatch[1] ?? '')

        if (method === 'PUT') {
            const body = await request.json() as Partial<{
                name: string
                url: string
                events: string[]
                secret: string
                enabled: boolean
            }>
            return updateWebhook(env, webhookId, body)
        }
        if (method === 'DELETE') {
            return deleteWebhook(env, webhookId)
        }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

async function listWebhooks(env: Env): Promise<Response> {
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

async function createWebhook(
    env: Env,
    data: { name: string; url: string; events: string[]; secret?: string }
): Promise<Response> {
    try {
        const id = crypto.randomUUID()
        const now = new Date().toISOString()

        await env.METADATA.prepare(
            `INSERT INTO webhooks (id, name, url, events, secret, enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?)`
        ).bind(
            id,
            data.name,
            data.url,
            JSON.stringify(data.events),
            data.secret ?? null,
            now,
            now
        ).run()

        return new Response(JSON.stringify({
            success: true,
            result: { id, ...data, enabled: 1, created_at: now, updated_at: now },
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create webhook',
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
}

async function updateWebhook(
    env: Env,
    id: string,
    data: Partial<{ name: string; url: string; events: string[]; secret: string; enabled: boolean }>
): Promise<Response> {
    try {
        const updates: string[] = []
        const values: unknown[] = []

        if (data.name !== undefined) {
            updates.push('name = ?')
            values.push(data.name)
        }
        if (data.url !== undefined) {
            updates.push('url = ?')
            values.push(data.url)
        }
        if (data.events !== undefined) {
            updates.push('events = ?')
            values.push(JSON.stringify(data.events))
        }
        if (data.secret !== undefined) {
            updates.push('secret = ?')
            values.push(data.secret)
        }
        if (data.enabled !== undefined) {
            updates.push('enabled = ?')
            values.push(data.enabled ? 1 : 0)
        }

        if (updates.length === 0) {
            return new Response(JSON.stringify({
                success: false,
                error: 'No fields to update',
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        updates.push('updated_at = ?')
        values.push(new Date().toISOString())
        values.push(id)

        await env.METADATA.prepare(
            `UPDATE webhooks SET ${updates.join(', ')} WHERE id = ?`
        ).bind(...values).run()

        return new Response(JSON.stringify({
            success: true,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update webhook',
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
}

async function deleteWebhook(env: Env, id: string): Promise<Response> {
    try {
        await env.METADATA.prepare('DELETE FROM webhooks WHERE id = ?').bind(id).run()

        return new Response(JSON.stringify({
            success: true,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete webhook',
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
}
