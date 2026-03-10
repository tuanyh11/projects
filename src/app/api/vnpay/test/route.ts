/**
 * VNPay Test API — dùng thư viện `vnpay` (npm)
 *
 * GET  /api/vnpay/test          → tạo payment URL và redirect sang VNPay sandbox
 * GET  /api/vnpay/test/return   → nhận return URL từ VNPay, verify và hiển thị kết quả
 */

import { NextRequest, NextResponse } from 'next/server'
import { HashAlgorithm, ProductCode, VNPay, VnpLocale, ignoreLogger } from 'vnpay'

// ─── Khởi tạo VNPay instance ──────────────────────────────────────

function getVNPayInstance() {
    const tmnCode = process.env.VNPAY_TMN_CODE
    const secureSecret = process.env.VNPAY_HASH_SECRET

    if (!tmnCode || !secureSecret) {
        throw new Error('Thiếu VNPAY_TMN_CODE hoặc VNPAY_HASH_SECRET trong .env')
    }

    return new VNPay({
        tmnCode,
        secureSecret,
        vnpayHost: 'https://sandbox.vnpayment.vn',
        testMode: true,
        hashAlgorithm: HashAlgorithm.SHA512,
        enableLog: false,
        loggerFn: ignoreLogger,
    })
}

// ─── GET /api/vnpay/test — Tạo URL và redirect ────────────────────

export async function GET(request: NextRequest) {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

    try {
        const vnpay = getVNPayInstance()

        // Lấy IP — normalize IPv6 về IPv4
        const rawIp =
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            '127.0.0.1'
        const ipAddr =
            rawIp === '::1' || rawIp === '::ffff:127.0.0.1'
                ? '127.0.0.1'
                : rawIp.startsWith('::ffff:')
                    ? rawIp.replace('::ffff:', '')
                    : rawIp

        const txnRef = `TEST${Date.now()}`
        const amount = 50000 // 50,000 VND test

        const returnUrl = `${serverUrl}/api/payment/vnpay`
        console.log(2222, returnUrl)

        const paymentUrl = vnpay.buildPaymentUrl({
            vnp_Amount: amount,
            vnp_IpAddr: ipAddr,
            vnp_ReturnUrl: returnUrl,
            vnp_TxnRef: txnRef,
            vnp_OrderInfo: `Test thanh toan ${txnRef}`,
            vnp_OrderType: ProductCode.Other,
            vnp_Locale: VnpLocale.VN,
        })

        // Trả về HTML page với link + info để dễ debug
        const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>VNPay Test</title>
  <style>
    body { font-family: monospace; max-width: 800px; margin: 40px auto; padding: 20px; background: #0a0a0a; color: #e0e0e0; }
    h1 { color: #6B7A5E; }
    .info { background: #1a1a1a; padding: 16px; border-radius: 4px; margin: 10px 0; border: 1px solid #333; }
    .label { color: #888; font-size: 12px; margin-bottom: 4px; }
    .value { color: #a0d0a0; word-break: break-all; }
    .btn { display: inline-block; background: #6B7A5E; color: #fff; padding: 14px 28px; border-radius: 4px; text-decoration: none; font-size: 14px; margin-top: 20px; }
    .btn:hover { background: #5a6a4d; }
    .url { font-size: 11px; color: #666; word-break: break-all; margin-top: 16px; padding: 12px; background: #111; border-radius: 4px; border: 1px solid #222; }
  </style>
</head>
<body>
  <h1>🧪 VNPay Sandbox Test</h1>
  <div class="info">
    <div class="label">TmnCode</div>
    <div class="value">${process.env.VNPAY_TMN_CODE}</div>
  </div>
  <div class="info">
    <div class="label">Mã giao dịch (TxnRef)</div>
    <div class="value">${txnRef}</div>
  </div>
  <div class="info">
    <div class="label">Số tiền</div>
    <div class="value">${amount.toLocaleString('vi-VN')} VND</div>
  </div>
  <div class="info">
    <div class="label">Return URL</div>
    <div class="value">${returnUrl}</div>
  </div>
  <div class="info">
    <div class="label">IP Address gửi đi</div>
    <div class="value">${ipAddr}</div>
  </div>
  <a href="${paymentUrl}" class="btn">→ Chuyển đến VNPay Sandbox</a>
  <div class="url">
    <div class="label" style="margin-bottom:8px">Payment URL đầy đủ:</div>
    ${paymentUrl}
  </div>
</body>
</html>`

        return new NextResponse(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
