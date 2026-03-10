/**
 * VNPay Test Return URL — /api/vnpay/test/return
 *
 * VNPay redirect về đây sau khi thanh toán.
 * Verify chữ ký bằng thư viện `vnpay` và hiển thị kết quả.
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
    const searchParams = request.nextUrl.searchParams

    // Chuyển tất cả query params sang object
    const query: Record<string, string> = {}
    searchParams.forEach((value, key) => {
        query[key] = value
    })

    const isConfigured = process.env.VNPAY_TMN_CODE && process.env.VNPAY_HASH_SECRET
    if (!isConfigured) {
        return NextResponse.json({ error: 'VNPay chưa cấu hình' }, { status: 500 })
    }

    // Verify chữ ký
    let verifyResult: any = null
    let verifyError: string | null = null

    try {
        const vnpay = getVNPayInstance()
        verifyResult = vnpay.verifyReturnUrl(query as ReturnQueryFromVNPay)
    } catch (err: any) {
        verifyError = err.message
    }

    // Lấy các thông tin chính
    const responseCode = query['vnp_ResponseCode'] || ''
    const txnRef = query['vnp_TxnRef'] || ''
    const amount = Number(query['vnp_Amount'] || 0) / 100
    const bankCode = query['vnp_BankCode'] || ''
    const transactionNo = query['vnp_TransactionNo'] || ''
    const payDate = query['vnp_PayDate'] || ''
    const orderInfo = query['vnp_OrderInfo'] || ''

    const isSuccess = verifyResult?.isVerified && responseCode === '00'

    const statusColor = isSuccess ? '#4ade80' : '#f87171'
    const statusText = isSuccess
        ? '✅ Thanh toán THÀNH CÔNG'
        : responseCode === '24'
            ? '⚠️ Người dùng hủy giao dịch'
            : `❌ Thanh toán THẤT BẠI (mã: ${responseCode})`

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>VNPay Test Result</title>
  <style>
    body { font-family: monospace; max-width: 800px; margin: 40px auto; padding: 20px; background: #0a0a0a; color: #e0e0e0; }
    h1 { color: #6B7A5E; }
    .status { font-size: 20px; font-weight: bold; color: ${statusColor}; margin: 20px 0; padding: 16px; background: #1a1a1a; border-radius: 4px; border-left: 4px solid ${statusColor}; }
    .info { background: #1a1a1a; padding: 12px 16px; border-radius: 4px; margin: 8px 0; border: 1px solid #333; display: flex; gap: 12px; }
    .label { color: #888; font-size: 12px; min-width: 180px; }
    .value { color: #a0d0a0; }
    .raw { font-size: 11px; color: #555; word-break: break-all; margin-top: 20px; padding: 12px; background: #111; border-radius: 4px; border: 1px solid #222; }
    .btn { display: inline-block; background: #6B7A5E; color: #fff; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-size: 13px; margin-top: 16px; margin-right: 8px; }
    h2 { color: #555; font-size: 14px; margin-top: 24px; border-bottom: 1px solid #222; padding-bottom: 4px; }
  </style>
</head>
<body>
  <h1>🧾 VNPay Test — Kết quả</h1>

  <div class="status">${statusText}</div>

  <h2>Thông tin giao dịch</h2>
  <div class="info"><span class="label">Mã giao dịch (TxnRef)</span><span class="value">${txnRef}</span></div>
  <div class="info"><span class="label">Số tiền</span><span class="value">${amount.toLocaleString('vi-VN')} VND</span></div>
  <div class="info"><span class="label">Ngân hàng</span><span class="value">${bankCode || 'N/A'}</span></div>
  <div class="info"><span class="label">Mã GD VNPay</span><span class="value">${transactionNo || 'N/A'}</span></div>
  <div class="info"><span class="label">Thời gian thanh toán</span><span class="value">${payDate || 'N/A'}</span></div>
  <div class="info"><span class="label">Thông tin đơn hàng</span><span class="value">${orderInfo}</span></div>
  <div class="info"><span class="label">Mã phản hồi</span><span class="value">${responseCode}</span></div>

  <h2>Kết quả verify</h2>
  <div class="info"><span class="label">Chữ ký hợp lệ</span><span class="value">${verifyResult?.isVerified ? '✅ Hợp lệ' : '❌ Không hợp lệ'}</span></div>
  <div class="info"><span class="label">Thư viện</span><span class="value">vnpay npm (v2.4.4)</span></div>
  ${verifyError ? `<div class="info"><span class="label">Lỗi</span><span class="value" style="color:#f87171">${verifyError}</span></div>` : ''}

  <a href="/api/vnpay/test" class="btn">← Test lại</a>

  <div class="raw">
    <div style="color:#555;margin-bottom:8px">Query params nhận được từ VNPay:</div>
    ${Object.entries(query)
            .map(([k, v]) => `<div><span style="color:#666">${k}:</span> <span style="color:#888">${v}</span></div>`)
            .join('')}
  </div>
</body>
</html>`

    return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
}
