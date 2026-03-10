'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * MoMo Checkout Form
 *
 * Sau khi initiatePayment trả về paymentUrl (deep link MoMo),
 * component này tự động redirect khách sang trang MoMo để thanh toán.
 */
export const MoMoCheckoutForm = ({
    customerEmail,
    paymentIntentID,
    paymentUrl,
    qrCodeUrl,
    shippingAddressAsJSON,
    setProcessingPayment,
    setError,
}: {
    customerEmail?: string
    paymentIntentID: string
    paymentUrl: string
    qrCodeUrl?: string
    shippingAddressAsJSON?: string
    setProcessingPayment: (p: boolean) => void
    setError: (e: string | null) => void
}) => {
    const [isRedirecting, setIsRedirecting] = useState(false)
    const [countdown, setCountdown] = useState(3)
    const hasRedirected = useRef(false)

    useEffect(() => {
        if (!paymentUrl || hasRedirected.current) return

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
            {/* MoMo Info Box */}
            <div
                style={{
                    background: 'rgba(162, 27, 111, 0.04)',
                    border: '1px solid rgba(162, 27, 111, 0.15)',
                    borderRadius: '2px',
                    padding: '20px 24px',
                }}
            >
                {/* MoMo Logo + Title */}
                <div className="flex items-center gap-3 mb-4">
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #A21B6F 0%, #D0186A 100%)',
                            borderRadius: '8px',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        {/* MoMo "M" logo */}
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
                                fill="rgba(255,255,255,0.15)"
                            />
                            <text
                                x="12"
                                y="16.5"
                                textAnchor="middle"
                                fill="white"
                                fontSize="13"
                                fontWeight="700"
                                fontFamily="Arial, sans-serif"
                            >
                                M
                            </text>
                        </svg>
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
                            Cổng thanh toán MoMo
                        </p>
                        <p
                            className="text-[10px] font-light"
                            style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}
                        >
                            Ví điện tử hàng đầu Việt Nam
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
                    Bạn sẽ được chuyển đến ứng dụng{' '}
                    <strong className="font-normal" style={{ opacity: 1 }}>
                        MoMo
                    </strong>{' '}
                    để hoàn tất thanh toán. Đơn hàng sẽ được xác nhận tự động sau khi giao dịch
                    thành công.
                </p>

                {/* Supported methods */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {['Ví MoMo', 'ATM nội địa', 'Thẻ Visa/MC', 'QR Code'].map((method) => (
                        <span
                            key={method}
                            className="text-[10px] font-light px-2.5 py-1"
                            style={{
                                border: '1px solid rgba(162, 27, 111, 0.2)',
                                borderRadius: '2px',
                                color: 'rgba(162, 27, 111, 0.75)',
                                background: 'rgba(162, 27, 111, 0.04)',
                                fontFamily: "'Noto Serif JP', serif",
                            }}
                        >
                            {method}
                        </span>
                    ))}
                </div>
            </div>

            {/* Redirect Button + Countdown */}
            {!isRedirecting ? (
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleRedirectNow}
                        className="btn-zen transition-all duration-500"
                        style={{
                            background: 'linear-gradient(135deg, #A21B6F 0%, #D0186A 100%)',
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
                        Thanh toán với MoMo &rarr;
                    </button>
                    <span
                        className="text-xs font-light"
                        style={{
                            color: 'var(--muted-foreground)',
                            opacity: 0.6,
                            fontFamily: "'Noto Serif JP', serif",
                        }}
                    >
                        Tự động chuyển sau {countdown}s...
                    </span>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 44 44"
                        fill="none"
                        className="animate-spin"
                        style={{ opacity: 0.6 }}
                    >
                        <circle
                            cx="22"
                            cy="22"
                            r="18"
                            stroke="#A21B6F"
                            strokeWidth="2"
                            strokeDasharray="80 20"
                        />
                    </svg>
                    <span
                        className="text-xs font-light"
                        style={{
                            color: 'var(--foreground)',
                            opacity: 0.6,
                            fontFamily: "'Noto Serif JP', serif",
                        }}
                    >
                        Đang chuyển đến MoMo...
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
                🔒 Giao dịch được mã hóa và bảo mật bởi MoMo
            </p>
        </div>
    )
}
