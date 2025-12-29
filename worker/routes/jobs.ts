/**
 * Jobs API routes
 */

import { type Env } from '../types'
import { corsHeaders } from '../utils/cors'

export async function handleJobsRoutes(
    _request: Request,
    env: Env,
    _url: URL
): Promise<Response> {
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
