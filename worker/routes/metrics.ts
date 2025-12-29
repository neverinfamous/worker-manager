/**
 * Metrics API routes
 */

import { type Env } from '../types'
import { corsHeaders } from '../utils/cors'

export async function handleMetricsRoutes(
    _request: Request,
    env: Env,
    url: URL,
    isLocal: boolean
): Promise<Response> {
    const timeRange = url.searchParams.get('range') ?? '24h'

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
