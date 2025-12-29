/**
 * Backups API routes
 */

import { type Env } from '../types'
import { corsHeaders } from '../utils/cors'

export async function handleBackupsRoutes(
    request: Request,
    env: Env,
    url: URL,
    userEmail: string
): Promise<Response> {
    const path = url.pathname
    const method = request.method

    // GET /api/backups - List all backups
    if (path === '/api/backups' && method === 'GET') {
        return listBackups(env)
    }

    // POST /api/backups - Create backup
    if (path === '/api/backups' && method === 'POST') {
        const body = await request.json() as {
            entity_type: 'worker' | 'page'
            entity_name: string
        }
        return createBackup(env, body, userEmail)
    }

    // POST /api/backups/:id/restore
    const restoreMatch = path.match(/^\/api\/backups\/([^/]+)\/restore$/)
    if (restoreMatch && method === 'POST') {
        const backupId = decodeURIComponent(restoreMatch[1] ?? '')
        return restoreBackup(env, backupId)
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

async function listBackups(env: Env): Promise<Response> {
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

async function createBackup(
    env: Env,
    data: { entity_type: 'worker' | 'page'; entity_name: string },
    userEmail: string
): Promise<Response> {
    try {
        const id = crypto.randomUUID()
        const now = new Date().toISOString()
        const r2Key = `backups/${data.entity_type}/${data.entity_name}/${id}.json`

        // For workers: fetch the script content
        // For pages: fetch the project configuration
        let backupContent: string

        if (data.entity_type === 'worker') {
            const response = await fetch(
                `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/workers/scripts/${data.entity_name}`,
                {
                    headers: { 'Authorization': `Bearer ${env.API_KEY}` },
                }
            )
            backupContent = await response.text()
        } else {
            const response = await fetch(
                `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/pages/projects/${data.entity_name}`,
                {
                    headers: {
                        'Authorization': `Bearer ${env.API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            )
            backupContent = await response.text()
        }

        // Store in R2
        await env.BACKUP_BUCKET.put(r2Key, backupContent, {
            customMetadata: {
                entity_type: data.entity_type,
                entity_name: data.entity_name,
                created_at: now,
                created_by: userEmail,
            },
        })

        const sizeBytes = new TextEncoder().encode(backupContent).length

        // Record in D1
        await env.METADATA.prepare(
            `INSERT INTO backups (id, entity_type, entity_id, entity_name, r2_key, backup_type, size_bytes, created_at, created_by)
       VALUES (?, ?, ?, ?, ?, 'manual', ?, ?, ?)`
        ).bind(
            id,
            data.entity_type,
            data.entity_name,
            data.entity_name,
            r2Key,
            sizeBytes,
            now,
            userEmail
        ).run()

        return new Response(JSON.stringify({
            success: true,
            result: {
                id,
                entity_type: data.entity_type,
                entity_name: data.entity_name,
                r2_key: r2Key,
                size_bytes: sizeBytes,
                created_at: now,
            },
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create backup',
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
}

async function restoreBackup(env: Env, backupId: string): Promise<Response> {
    try {
        // Get backup record
        const { results } = await env.METADATA.prepare(
            'SELECT * FROM backups WHERE id = ?'
        ).bind(backupId).all()

        if (results.length === 0) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Backup not found',
            }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const backup = results[0] as {
            id: string
            entity_type: 'worker' | 'page'
            entity_name: string
            r2_key: string
        }

        // Get content from R2
        const object = await env.BACKUP_BUCKET.get(backup.r2_key)
        if (!object) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Backup content not found in R2',
            }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const content = await object.text()

        // Restore based on entity type
        if (backup.entity_type === 'worker') {
            const response = await fetch(
                `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/workers/scripts/${backup.entity_name}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${env.API_KEY}`,
                        'Content-Type': 'application/javascript',
                    },
                    body: content,
                }
            )

            if (!response.ok) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Failed to restore worker',
                }), {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }
        }
        // Note: Pages restoration is more complex and would require re-deploying

        return new Response(JSON.stringify({
            success: true,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to restore backup',
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
}
