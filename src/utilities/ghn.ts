/**
 * GHN (Giao Hàng Nhanh) API v2 Integration
 * Docs: https://api.ghn.vn/home/docs/detail
 *
 * Production: https://online-gateway.ghn.vn/shiip/public-api/v2
 * Sandbox:    https://dev-online-gateway.ghn.vn/shiip/public-api/v2
 */

// ─── Config ──────────────────────────────────────────────────────────────────
const GHN_API_URL =
    process.env.GHN_API_URL || 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2'
const GHN_TOKEN = process.env.GHN_TOKEN || ''
const GHN_SHOP_ID = process.env.GHN_SHOP_ID || ''
const GHN_FROM_DISTRICT_ID = process.env.GHN_FROM_DISTRICT_ID || '' // Quận/Huyện cửa hàng

// ─── Types ───────────────────────────────────────────────────────────────────
export interface GHNResponse<T = any> {
    code: number
    message: string
    data: T
}

export interface GHNShippingFeeParams {
    to_district_id: number
    to_ward_code: string
    weight: number // gram
    insurance_value?: number // VND
    service_type_id?: number // 2 = standard
}

export interface GHNOrderItem {
    name: string
    quantity: number
    weight: number // gram
    price: number // VND
}

export interface GHNCreateOrderParams {
    to_name: string
    to_phone: string
    to_address: string
    to_district_id: number
    to_ward_code: string
    cod_amount: number
    weight: number
    length: number
    width: number
    height: number
    items: GHNOrderItem[]
    client_order_code?: string
    note?: string
    payment_type_id?: number // 1 = shop trả, 2 = khách trả
    required_note?: 'CHOTHUHANG' | 'CHOXEMHANGKHONGTHU' | 'KHONGCHOXEMHANG'
    service_type_id?: number
    insurance_value?: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isConfigured(): boolean {
    return Boolean(GHN_TOKEN && GHN_SHOP_ID)
}

async function ghnFetch<T = any>(path: string, body?: Record<string, any>): Promise<GHNResponse<T>> {
    if (!isConfigured()) {
        throw new Error('[GHN] Missing GHN_TOKEN or GHN_SHOP_ID in environment.')
    }

    const response = await fetch(`${GHN_API_URL}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Token: GHN_TOKEN,
            ShopId: GHN_SHOP_ID,
        },
        body: body ? JSON.stringify(body) : undefined,
    })

    const result = await response.json()
    return result as GHNResponse<T>
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Tính phí vận chuyển
 */
export async function calculateShippingFee(params: GHNShippingFeeParams): Promise<GHNResponse> {
    if (!GHN_FROM_DISTRICT_ID) {
        console.warn('[GHN] GHN_FROM_DISTRICT_ID is missing — returning fee = 0')
        return { code: 200, message: 'Skipped', data: { total: 0 } }
    }

    return ghnFetch('/shipping-order/fee', {
        from_district_id: parseInt(GHN_FROM_DISTRICT_ID, 10),
        to_district_id: params.to_district_id,
        to_ward_code: params.to_ward_code,
        weight: params.weight,
        insurance_value: params.insurance_value ?? 0,
        service_type_id: params.service_type_id ?? 2,
        coupon: null,
    })
}

/**
 * Tạo đơn vận chuyển trên GHN
 */
export async function createGHNOrder(params: GHNCreateOrderParams): Promise<GHNResponse> {
    return ghnFetch('/shipping-order/create', {
        payment_type_id: params.payment_type_id ?? 2,
        note: params.note ?? 'Giao hàng cẩn thận',
        required_note: params.required_note ?? 'CHOXEMHANGKHONGTHU',
        client_order_code: params.client_order_code,
        to_name: params.to_name,
        to_phone: params.to_phone,
        to_address: params.to_address,
        to_district_id: params.to_district_id,
        to_ward_code: params.to_ward_code,
        cod_amount: params.cod_amount,
        weight: params.weight,
        length: params.length,
        width: params.width,
        height: params.height,
        service_type_id: params.service_type_id ?? 2,
        insurance_value: params.insurance_value ?? 0,
        items: params.items,
    })
}

/**
 * Tra cứu chi tiết vận đơn
 */
export async function getGHNOrderDetail(order_code: string): Promise<GHNResponse | null> {
    if (!GHN_TOKEN) return null

    return ghnFetch('/shipping-order/detail', { order_code })
}

/**
 * Tra cứu trạng thái vận đơn (tracking)
 */
export async function trackGHNOrder(order_code: string): Promise<GHNResponse | null> {
    if (!GHN_TOKEN) return null

    const response = await fetch(
        `${GHN_API_URL}/shipping-order/detail`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Token: GHN_TOKEN,
            },
            body: JSON.stringify({ order_code }),
        },
    )

    return response.json()
}
