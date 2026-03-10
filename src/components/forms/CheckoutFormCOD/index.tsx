'use client'

import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export const CODCheckoutForm = ({
    customerEmail,
    paymentIntentID,
    shippingAddressAsJSON,
    setProcessingPayment,
    setError,
}: {
    customerEmail?: string
    paymentIntentID: string
    shippingAddressAsJSON?: string
    setProcessingPayment: (p: boolean) => void
    setError: (e: string | null) => void
}) => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { clearCart } = useCart()
    const { confirmOrder } = usePayments()

    const handleConfirmOrder = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setProcessingPayment(true)
        setError(null)

        try {
            const confirmResult = await confirmOrder('cod', {
                additionalData: {
                    paymentIntentID,
                    ...(shippingAddressAsJSON ? { shippingAddressAsJSON } : {}),
                    ...(customerEmail ? { customerEmail } : {}),
                },
            })

            if (
                confirmResult &&
                typeof confirmResult === 'object' &&
                'orderID' in confirmResult &&
                confirmResult.orderID
            ) {
                const redirectUrl = `/orders/${confirmResult.orderID}${customerEmail ? `?email=${customerEmail}` : ''}`
                clearCart()
                router.push(redirectUrl)
            }
        } catch (err) {
            console.log({ err })
            setError(`Error while confirming order: ${err instanceof Error ? err.message : 'Unknown error'}`)
            setIsLoading(false)
            setProcessingPayment(false)
        }
    }

    return (
        <form onSubmit={handleConfirmOrder}>
            <div
                className="mb-6 leading-relaxed text-xs font-light"
                style={{
                    background: 'rgba(107, 122, 94, 0.05)',
                    border: '1px solid rgba(107, 122, 94, 0.12)',
                    borderRadius: '2px',
                    padding: '16px 20px',
                    fontFamily: "'Noto Serif JP', serif",
                    color: 'var(--foreground)',
                    opacity: 0.7,
                }}
            >
                Bạn đã chọn phương thức <strong className="font-normal" style={{ opacity: 1 }}>Thanh toán khi nhận hàng</strong>. Vui lòng kiểm tra lại thông tin nhận hàng và nhấn xác nhận.
            </div>
            <button
                disabled={isLoading}
                type="submit"
                className="btn-zen transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                    background: isLoading ? 'var(--muted)' : 'var(--matcha)',
                    color: isLoading ? 'var(--muted-foreground)' : 'var(--washi)',
                    padding: '14px 32px',
                    borderRadius: '2px',
                    fontSize: '13px',
                    fontFamily: "'Noto Serif JP', serif",
                    fontWeight: 300,
                    letterSpacing: '0.08em',
                    border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
            >
                {isLoading ? 'Đang xác nhận...' : 'Xác nhận đặt hàng'}
            </button>
        </form>
    )
}
