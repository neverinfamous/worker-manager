import { describe, it, expect, beforeEach } from 'vitest'
import { getCached, setCache, invalidateCache, clearCache, getCacheKeys, DEFAULT_TTL, METRICS_TTL } from '../lib/cache'

describe('cache', () => {
    beforeEach(() => {
        clearCache()
    })

    describe('getCached and setCache', () => {
        it('returns null for missing key', () => {
            expect(getCached('missing')).toBeNull()
        })

        it('returns value for existing key', () => {
            setCache('key', 'value')
            expect(getCached('key')).toBe('value')
        })

        it('returns objects correctly', () => {
            const obj = { foo: 'bar', num: 42 }
            setCache('object', obj)
            expect(getCached('object')).toEqual(obj)
        })
    })

    describe('invalidateCache', () => {
        it('removes keys matching pattern', () => {
            setCache('workers:list', [1, 2, 3])
            setCache('workers:detail', { id: 1 })
            setCache('pages:list', [4, 5, 6])

            invalidateCache('workers')

            expect(getCached('workers:list')).toBeNull()
            expect(getCached('workers:detail')).toBeNull()
            expect(getCached('pages:list')).toEqual([4, 5, 6])
        })
    })

    describe('clearCache', () => {
        it('removes all keys', () => {
            setCache('key1', 'value1')
            setCache('key2', 'value2')
            clearCache()
            expect(getCached('key1')).toBeNull()
            expect(getCached('key2')).toBeNull()
        })
    })

    describe('getCacheKeys', () => {
        it('returns all cache keys', () => {
            setCache('a', 1)
            setCache('b', 2)
            const keys = getCacheKeys()
            expect(keys).toContain('a')
            expect(keys).toContain('b')
        })
    })

    describe('TTL constants', () => {
        it('exports TTL constants', () => {
            expect(DEFAULT_TTL).toBe(5 * 60 * 1000)
            expect(METRICS_TTL).toBe(2 * 60 * 1000)
            expect(METRICS_TTL).toBeLessThan(DEFAULT_TTL)
        })
    })
})
