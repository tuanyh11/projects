'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * VNPay Checkout Form
 *
 * Sau khi initiatePayment trả về paymentUrl (URL VNPay),
 * component này tự động redirect khách sang trang thanh toán VNPay.
 */
export const VNPayCheckoutForm = ({
    customerEmail,
    paymentIntentID,
    paymentUrl,
    shippingAddressAsJSON,
    setProcessingPayment,
    setError,
}: {
    customerEmail?: string
    paymentIntentID: string
    paymentUrl: string
    shippingAddressAsJSON?: string
    setProcessingPayment: (p: boolean) => void
    setError: (e: string | null) => void
}) => {
    const [isRedirecting, setIsRedirecting] = useState(false)
    const [countdown, setCountdown] = useState(3)
    const hasRedirected = useRef(false)

    useEffect(() => {
        if (!paymentUrl || hasRedirected.current) return

        // Đếm ngược 3 giây rồi redirect
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    if (!hasRedirected.current) {
                        hasRedirected.current = true
                        setIsRedirecting(true)
                        setProcessingPayment(true)
                        window.location.href = paymentUrl
                    }
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [paymentUrl])

    const handleRedirectNow = () => {
        if (!hasRedirected.current) {
            hasRedirected.current = true
            setIsRedirecting(true)
            setProcessingPayment(true)
            window.location.href = paymentUrl
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* VNPay Info Box */}
            <div
                style={{
                    background: 'rgba(0, 100, 182, 0.04)',
                    border: '1px solid rgba(0, 100, 182, 0.15)',
                    borderRadius: '2px',
                    padding: '20px 24px',
                }}
            >
                {/* VNPay Logo + Title */}
                <div className="flex items-center gap-3 mb-4">
                    <div
                        style={{
                            background: '#005BAC',
                            borderRadius: '4px',
                            padding: '6px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px', letterSpacing: '0.02em' }}>
                            VN
                        </span>
                        <span style={{ color: '#FFB800', fontWeight: 700, fontSize: '13px' }}>PAY</span>
                    </div>
                    <div>
                        <p
                            className="text-sm font-light"
                            style={{
                                fontFamily: "'Noto Serif JP', serif",
                                color: 'var(--foreground)',
                                opacity: 0.8,
                            }}
                        >
                            Cổng thanh toán VNPay
                        </p>
                        <p className="text-[10px] font-light" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>
                            Hỗ trợ ATM, Internet Banking, QR Code
                        </p>
                    </div>
                </div>

                <p
                    className="text-xs font-light leading-relaxed"
                    style={{
                        fontFamily: "'Noto Serif JP', serif",
                        color: 'var(--foreground)',
                        opacity: 0.7,
                    }}
                >
                    Bạn sẽ được chuyển đến trang thanh toán của <strong className="font-normal" style={{ opacity: 1 }}>VNPay</strong> để hoàn tất giao dịch. Sau khi hoàn tất, đơn hàng sẽ được xác nhận tự động.
                </p>

                {/* Supported banks */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {['ATM nội địa', 'Visa/Mastercard', 'QR VNPAY', 'Internet Banking'].map((method) => (
                        <span
                            key={method}
                            className="text-[10px] font-light px-2.5 py-1"
                            style={{
                                border: '1px solid rgba(0, 100, 182, 0.2)',
                                borderRadius: '2px',
                                color: 'rgba(0, 100, 182, 0.7)',
                                background: 'rgba(0, 100, 182, 0.04)',
                                fontFamily: "'Noto Serif JP', serif",
                            }}
                        >
                            {method}
                        </span>
                    ))}
                </div>
            </div>

            {/* Countdown + Redirect button */}
            {!isRedirecting ? (
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleRedirectNow}
                        className="btn-zen transition-all duration-500"
                        style={{
                            background: '#005BAC',
                            color: '#fff',
                            padding: '14px 32px',
                            borderRadius: '2px',
                            fontSize: '13px',
                            fontFamily: "'Noto Serif JP', serif",
                            fontWeight: 300,
                            letterSpacing: '0.08em',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Thanh toán ngay &rarr;
                    </button>
                    <span
                        className="text-xs font-light"
                        style={{ color: 'var(--muted-foreground)', opacity: 0.6, fontFamily: "'Noto Serif JP', serif" }}
                    >
                        Tự động chuyển hướng sau {countdown}s...
                    </span>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    {/* Zen loading spinner */}
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 44 44"
                        fill="none"
                        className="animate-spin"
                        style={{ opacity: 0.5 }}
                    >
                        <circle cx="22" cy="22" r="18" stroke="var(--matcha)" strokeWidth="2" strokeDasharray="80 20" />
                    </svg>
                    <span
                        className="text-xs font-light"
                        style={{ color: 'var(--foreground)', opacity: 0.6, fontFamily: "'Noto Serif JP', serif" }}
                    >
                        Đang chuyển đến VNPay...
                    </span>
                </div>
            )}

            {/* Security note */}
            <p
                className="text-[10px] font-light"
                style={{
                    color: 'var(--muted-foreground)',
                    opacity: 0.5,
                    fontFamily: "'Noto Serif JP', serif",
                    letterSpacing: '0.02em',
                }}
            >
                🔒 Giao dịch được mã hóa SSL và bảo mật bởi VNPay
            </p>
        </div>
    )
}
