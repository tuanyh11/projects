import type { Endpoint } from 'payload'
import { APIError } from 'payload'

const GHN_MASTER_DATA_URL = 'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data'
const GHN_TOKEN = process.env.GHN_TOKEN || ''

// ─── Cache ───────────────────────────────────────────────────────────────────
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24h

interface CacheEntry {
    data: any[]
    timestamp: number
}

const cache: {
    provinces?: CacheEntry
    districts: Record<string, CacheEntry>
    wards: Record<string, CacheEntry>
} = { districts: {}, wards: {} }

function fromCache(entry?: CacheEntry): any[] | null {
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data
    return null
}

// ─── Rate Limiter ────────────────────────────────────────────────────────────
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 30 // max 30 requests per minute per IP

const rateLimitMap = new Map<string, { count: number; timestamp: number }>()

function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const entry = rateLimitMap.get(ip)

    if (!entry || now - entry.timestamp > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { count: 1, timestamp: now })
        return true
    }

    if (entry.count >= RATE_LIMIT_MAX) {
        return false
    }

    entry.count++
    return true
}

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now()
    for (const [ip, entry] of rateLimitMap) {
        if (now - entry.timestamp > RATE_LIMIT_WINDOW) {
            rateLimitMap.delete(ip)
        }
    }
}, 5 * 60 * 1000)

// ─── Shared fetch helper ─────────────────────────────────────────────────────
async function fetchGHNMasterData(path: string, body?: Record<string, any>): Promise<any[]> {
    if (!GHN_TOKEN) throw new APIError('GHN_TOKEN is not configured', 500)

    const response = await fetch(`${GHN_MASTER_DATA_URL}/${path}`, {
        method: body ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json', Token: GHN_TOKEN },
        body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
        throw new APIError(`GHN API error: ${response.statusText}`, response.status)
    }

    const result = await response.json()

    if (result.code !== 200) {
        throw new APIError(`GHN API: ${result.message || 'Unknown error'}`, result.code || 500)
    }

    return result.data ?? []
}

// ─── Endpoints ───────────────────────────────────────────────────────────────

/** GET /api/ghn/provinces */
export const getProvinces: Endpoint = {
    path: '/ghn/provinces',
    method: 'get',
    handler: async (req) => {
        if (!req.user) throw new APIError('Authentication required', 401)

        const ip = req.headers.get('x-forwarded-for') || 'unknown'
        if (!checkRateLimit(ip)) throw new APIError('Too many requests', 429)

        try {
            const cached = fromCache(cache.provinces)
            if (cached) return Response.json({ code: 200, message: 'Success (cached)', data: cached })

            const data = await fetchGHNMasterData('province')
            cache.provinces = { data, timestamp: Date.now() }

            return Response.json({ code: 200, message: 'Success', data })
        } catch (error) {
            if (error instanceof APIError) throw error
            console.error('[GHN] Error fetching provinces:', error)
            throw new APIError('Failed to fetch provinces from GHN', 500)
        }
    },
}

/** GET /api/ghn/districts?province_id=202 */
export const getDistricts: Endpoint = {
    path: '/ghn/districts',
    method: 'get',
    handler: async (req) => {
        if (!req.user) throw new APIError('Authentication required', 401)

        const ip = req.headers.get('x-forwarded-for') || 'unknown'
        if (!checkRateLimit(ip)) throw new APIError('Too many requests', 429)

        try {
            const url = new URL(req.url || '', 'http://localhost')
            const provinceId = url.searchParams.get('province_id')
            if (!provinceId) throw new APIError('province_id is required', 400)

            const cached = fromCache(cache.districts[provinceId])
            if (cached) return Response.json({ code: 200, message: 'Success (cached)', data: cached })

            const data = await fetchGHNMasterData('district', { province_id: parseInt(provinceId, 10) })
            cache.districts[provinceId] = { data, timestamp: Date.now() }

            return Response.json({ code: 200, message: 'Success', data })
        } catch (error) {
            if (error instanceof APIError) throw error
            console.error('[GHN] Error fetching districts:', error)
            throw new APIError('Failed to fetch districts from GHN', 500)
        }
    },
}

/** GET /api/ghn/wards?district_id=1442 */
export const getWards: Endpoint = {
    path: '/ghn/wards',
    method: 'get',
    handler: async (req) => {
        if (!req.user) throw new APIError('Authentication required', 401)

        const ip = req.headers.get('x-forwarded-for') || 'unknown'
        if (!checkRateLimit(ip)) throw new APIError('Too many requests', 429)

        try {
            const url = new URL(req.url || '', 'http://localhost')
            const districtId = url.searchParams.get('district_id')
            if (!districtId) throw new APIError('district_id is required', 400)

            const cached = fromCache(cache.wards[districtId])
            if (cached) return Response.json({ code: 200, message: 'Success (cached)', data: cached })

            const data = await fetchGHNMasterData('ward', { district_id: parseInt(districtId, 10) })
            cache.wards[districtId] = { data, timestamp: Date.now() }

            return Response.json({ code: 200, message: 'Success', data })
        } catch (error) {
            if (error instanceof APIError) throw error
            console.error('[GHN] Error fetching wards:', error)
            throw new APIError('Failed to fetch wards from GHN', 500)
        }
    },
}
