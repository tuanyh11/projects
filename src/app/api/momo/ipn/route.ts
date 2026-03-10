import { verifyMoMoSignature } from '@/payments/adapters/momo'
import { NextRequest, NextResponse } from 'next/server'

/**
 * MoMo IPN + Redirect URL handler
 *
 * MoMo gọi cả 2 url này (ipnUrl và redirectUrl trỏ vào đây):
 *  - IPN: POST request từ server MoMo (xác nhận thanh toán phía server)
 *  - Redirect: GET request khi khách hoàn tất trên app MoMo
 *
 * Flow:
 *  1. Nhận params từ MoMo (query string cho GET, body cho POST)
 *  2. Verify chữ ký HMAC-SHA256
 *  3. resultCode === 0 → thanh toán thành công → redirect confirm-order
 *  4. Thất bại → redirect /checkout?error=...
 */

// ─── GET: Redirect từ MoMo app về ─────────────────────────────────
export async function GET(request: NextRequest) {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const secretKey = process.env.MOMO_SECRET_KEY

    if (!secretKey) {
        return NextResponse.redirect(`${serverUrl}/checkout?error=momo_not_configured`)
    }

    const searchParams = request.nextUrl.searchParams
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => { params[key] = value })

    return handleMoMoCallback(params, secretKey, serverUrl)
}

// ─── POST: IPN từ MoMo server ─────────────────────────────────────
export async function POST(request: NextRequest) {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const secretKey = process.env.MOMO_SECRET_KEY

    if (!secretKey) {
        return NextResponse.json({ message: 'Not configured' }, { status: 500 })
    }

    let params: Record<string, string> = {}
    try {
        const body = await request.json()
        // Convert tất cả values sang string để verify
        Object.entries(body).forEach(([k, v]) => {
            params[k] = String(v)
        })
    } catch {
        return NextResponse.json({ message: 'Invalid body' }, { status: 400 })
    }

    const { isSuccess } = parseMoMoParams(params, secretKey)

    // MoMo IPN chỉ cần trả về HTTP 200+ để xác nhận đã nhận
    if (isSuccess) {
        return NextResponse.json({ message: 'ok' }, { status: 200 })
    } else {
        return NextResponse.json({ message: 'failed' }, { status: 200 })
    }
}

// ─── Shared handler ────────────────────────────────────────────────
function parseMoMoParams(params: Record<string, string>, secretKey: string) {
    const signature = params['signature'] || ''
    const resultCode = Number(params['resultCode'] ?? params['errorCode'] ?? -1)
    const orderId = params['orderId'] || ''
    const transId = params['transId'] || ''
    const payType = params['payType'] || ''
    const message = params['message'] || ''

    const isValid = verifyMoMoSignature(params, secretKey, signature)
    const isSuccess = isValid && resultCode === 0

    return { isValid, isSuccess, resultCode, orderId, transId, payType, message }
}

function handleMoMoCallback(
    params: Record<string, string>,
    secretKey: string,
    serverUrl: string,
): NextResponse {
    const { isValid, isSuccess, resultCode, orderId, transId, payType, message } =
        parseMoMoParams(params, secretKey)

    if (!isValid) {
        console.error('[MoMo IPN] Chữ ký không hợp lệ:', params)
        return NextResponse.redirect(`${serverUrl}/checkout?error=momo_invalid_signature`)
    }

    if (!isSuccess) {
        const errorMsg = getMoMoErrorMessage(resultCode) || message
        console.warn(`[MoMo IPN] Thanh toán thất bại: ${resultCode} - ${errorMsg}`)
        return NextResponse.redirect(
            `${serverUrl}/checkout?error=${encodeURIComponent(`Thanh toán MoMo thất bại: ${errorMsg}`)}`,
        )
    }

    // Thành công → redirect sang /checkout/confirm-order
    const confirmUrl = new URL(`${serverUrl}/checkout/confirm-order`)
    confirmUrl.searchParams.set('paymentId', orderId)
    confirmUrl.searchParams.set('momoTransId', transId)
    confirmUrl.searchParams.set('momoPayType', payType)
    confirmUrl.searchParams.set('momoResultCode', String(resultCode))
    confirmUrl.searchParams.set('method', 'momo')

    return NextResponse.redirect(confirmUrl.toString())
}

function getMoMoErrorMessage(code: number): string {
    const messages: Record<number, string> = {
        1: 'Giao dịch thất bại.',
        2: 'Giao dịch bị từ chối.',
        3: 'Giao dịch bị hủy hoặc hết thời gian.',
        4: 'Số tiền không hợp lệ.',
        5: 'Thông tin tài khoản không hợp lệ.',
        6: 'Lỗi hệ thống MoMo.',
        7: 'Giao dịch đang xử lý.',
        8: 'Số tiền vượt quá hạn mức.',
        9: 'Tài khoản không đủ số dư.',
        10: 'Khách hàng hủy giao dịch.',
        11: 'Hết thời gian chờ thanh toán.',
        12: 'Lỗi xác thực OTP.',
        13: 'Vượt quá giới hạn giao dịch trong ngày.',
        20: 'Lỗi chữ ký không hợp lệ.',
        21: 'Thông tin merchant không hợp lệ.',
        99: 'Lỗi không xác định.',
    }
    return messages[code] || `Mã lỗi: ${code}`
}
