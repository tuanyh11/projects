/**
 * VNPay IPN + Return URL handler
 * Dùng thư viện `vnpay` (npm) để verify chữ ký
 *
 * VNPay redirect browser về đây sau khi thanh toán (GET)
 * Verify → thành công → /checkout/confirm-order?method=vnpay&...
 * Thất bại → /checkout?error=...
 */

import { NextRequest, NextResponse } from 'next/server'
import type { ReturnQueryFromVNPay } from 'vnpay'
import { HashAlgorithm, ignoreLogger, VNPay } from 'vnpay'

function getVNPayInstance() {
    return new VNPay({
        tmnCode: process.env.VNPAY_TMN_CODE!,
        secureSecret: process.env.VNPAY_HASH_SECRET!,
        vnpayHost: 'https://sandbox.vnpayment.vn',
        testMode: true,
        hashAlgorithm: HashAlgorithm.SHA512,
        enableLog: false,
        loggerFn: ignoreLogger,
    })
}

export async function GET(request: NextRequest) {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const hashSecret = process.env.VNPAY_HASH_SECRET

    if (!hashSecret || !process.env.VNPAY_TMN_CODE) {
        return NextResponse.redirect(`${serverUrl}/checkout?error=vnpay_not_configured`)
    }

    const searchParams = request.nextUrl.searchParams
    const query: Record<string, string> = {}
    searchParams.forEach((value, key) => {
        query[key] = value
    })

    const responseCode = query['vnp_ResponseCode'] || ''
    const txnRef = query['vnp_TxnRef'] || ''
    const transactionNo = query['vnp_TransactionNo'] || ''
    const bankCode = query['vnp_BankCode'] || ''

    // Verify chữ ký bằng thư viện vnpay
    let isVerified = false
    try {
        const vnpay = getVNPayInstance()
        const result = vnpay.verifyReturnUrl(query as ReturnQueryFromVNPay)
        isVerified = result.isVerified
    } catch (err) {
        console.error('[VNPay IPN] Verify error:', err)
    }

    if (!isVerified) {
        console.error('[VNPay IPN] Chữ ký không hợp lệ:', query)
        return NextResponse.redirect(`${serverUrl}/checkout?error=vnpay_invalid_signature`)
    }

    if (responseCode !== '00') {
        const errorMsg = getVNPayErrorMessage(responseCode)
        console.warn(`[VNPay IPN] Thất bại: ${responseCode} - ${errorMsg}`)
        return NextResponse.redirect(
            `${serverUrl}/checkout?error=${encodeURIComponent(`Thanh toán VNPay thất bại: ${errorMsg}`)}`,
        )
    }

    // Thành công → redirect sang confirm-order
    const confirmUrl = new URL(`${serverUrl}/checkout/confirm-order`)
    confirmUrl.searchParams.set('paymentId', txnRef)
    confirmUrl.searchParams.set('vnpayTransactionNo', transactionNo)
    confirmUrl.searchParams.set('vnpayBankCode', bankCode)
    confirmUrl.searchParams.set('vnpayResponseCode', responseCode)
    confirmUrl.searchParams.set('method', 'vnpay')

    return NextResponse.redirect(confirmUrl.toString())
}

function getVNPayErrorMessage(code: string): string {
    const messages: Record<string, string> = {
        '07': 'Giao dịch bị nghi ngờ gian lận.',
        '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ.',
        '10': 'Xác thực thông tin thẻ/tài khoản sai quá 3 lần.',
        '11': 'Đã hết hạn chờ thanh toán.',
        '12': 'Thẻ/Tài khoản bị khóa.',
        '13': 'Sai OTP.',
        '24': 'Khách hàng hủy giao dịch.',
        '51': 'Tài khoản không đủ số dư.',
        '65': 'Vượt quá hạn mức giao dịch trong ngày.',
        '75': 'Ngân hàng đang bảo trì.',
        '79': 'Sai mật khẩu quá số lần quy định.',
        '99': 'Lỗi không xác định.',
    }
    return messages[code] || `Mã lỗi: ${code}`
}
