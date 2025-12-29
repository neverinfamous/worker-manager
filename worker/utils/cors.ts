/**
 * CORS utilities for worker-manager
 */

export const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, CF-Access-Client-Id, CF-Access-Client-Secret',
    'Access-Control-Max-Age': '86400',
}

export function handleCORS(): Response {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    })
}

export function jsonResponse(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
        },
    })
}

export function errorResponse(message: string, status = 500): Response {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
        },
    })
}
