/**
 * Cache utilities for worker-manager
 * Uses Map<key, {data, timestamp}> pattern with TTL
 */

interface CacheEntry {
    data: unknown
    timestamp: number
}

const cache = new Map<string, CacheEntry>()

// TTL constants (in milliseconds)
export const DEFAULT_TTL = 5 * 60 * 1000  // 5 minutes
export const METRICS_TTL = 2 * 60 * 1000  // 2 minutes

/**
 * Get cached data if still valid
 */
export function getCached(key: string, ttl = DEFAULT_TTL): unknown {
    const entry = cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > ttl) {
        cache.delete(key)
        return null
    }

    return entry.data
}

/**
 * Set cache entry
 */
export function setCache(key: string, data: unknown): void {
    cache.set(key, { data, timestamp: Date.now() })
}

/**
 * Invalidate cache entries matching a pattern
 */
export function invalidateCache(pattern: string): void {
    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key)
        }
    }
}

/**
 * Clear all cache
 */
export function clearCache(): void {
    cache.clear()
}

/**
 * Get cache keys (for debugging)
 */
export function getCacheKeys(): string[] {
    return Array.from(cache.keys())
}
