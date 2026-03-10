'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

export const ConfirmOrder: React.FC = () => {
  const { confirmOrder } = usePayments()
  const { cart, clearCart } = useCart()

  const searchParams = useSearchParams()
  const router = useRouter()
  const isConfirming = useRef(false)

  useEffect(() => {
    if (!cart || !cart.items || cart.items?.length === 0) {
      return
    }

    const method = searchParams.get('method') // 'stripe' | 'vnpay' | null

    // ─── MoMo return ────────────────────────────────────────────────
    if (method === 'momo') {
      const paymentIntentID = searchParams.get('paymentId')   // momoOrderId
      const momoTransId = searchParams.get('momoTransId')
      const momoPayType = searchParams.get('momoPayType')
      const momoResultCode = searchParams.get('momoResultCode')
      const email = searchParams.get('email')

      if (paymentIntentID && !isConfirming.current) {
        isConfirming.current = true

        confirmOrder('momo', {
          additionalData: {
            paymentIntentID,
            momoTransId: momoTransId || '',
            momoPayType: momoPayType || '',
            momoResultCode: momoResultCode || '0',
            ...(email ? { customerEmail: email } : {}),
          },
        })
          .then((result) => {
            if (result && typeof result === 'object' && 'orderID' in result && result.orderID) {
              clearCart()
              router.push(`/orders/${result.orderID}${email ? `?email=${email}` : ''}`)
            }
          })
          .catch((err) => {
            console.error('[MoMo ConfirmOrder]', err)
            router.push(`/checkout?error=${encodeURIComponent(err?.message || 'Lỗi xác nhận đơn hàng MoMo')}`)
          })
      } else if (!paymentIntentID) {
        router.push('/')
      }
      return
    }

    // ─── VNPay return ───────────────────────────────────────────────
    if (method === 'vnpay') {
      const paymentIntentID = searchParams.get('paymentId')
      const vnpayTransactionNo = searchParams.get('vnpayTransactionNo')
      const vnpayBankCode = searchParams.get('vnpayBankCode')
      const vnpayResponseCode = searchParams.get('vnpayResponseCode')
      const email = searchParams.get('email')

      if (paymentIntentID && !isConfirming.current) {
        isConfirming.current = true

        confirmOrder('vnpay', {
          additionalData: {
            paymentIntentID,
            vnpayTransactionNo: vnpayTransactionNo || '',
            vnpayBankCode: vnpayBankCode || '',
            vnpayResponseCode: vnpayResponseCode || '00',
            ...(email ? { customerEmail: email } : {}),
          },
        })
          .then((result) => {
            if (result && typeof result === 'object' && 'orderID' in result && result.orderID) {
              clearCart()
              router.push(`/orders/${result.orderID}${email ? `?email=${email}` : ''}`)
            }
          })
          .catch((err) => {
            console.error('[VNPay ConfirmOrder]', err)
            router.push(`/checkout?error=${encodeURIComponent(err?.message || 'Lỗi xác nhận đơn hàng VNPay')}`)
          })
      } else if (!paymentIntentID) {
        router.push('/')
      }
      return
    }

    // ─── Stripe return (legacy) ─────────────────────────────────────
    const paymentIntentID = searchParams.get('payment_intent')
    const email = searchParams.get('email')

    if (paymentIntentID) {
      if (!isConfirming.current) {
        isConfirming.current = true

        confirmOrder('stripe', {
          additionalData: {
            paymentIntentID,
          },
        }).then((result) => {
          if (result && typeof result === 'object' && 'orderID' in result && result.orderID) {
            router.push(`/shop/order/${result.orderID}?email=${email}`)
          }
        })
      }
    } else {
      router.push('/')
    }
  }, [cart, searchParams])

  return (
    <div
      className="text-center w-full flex flex-col items-center justify-center gap-6 py-24"
      style={{ background: 'var(--washi)' }}
    >
      {/* Enso circle */}
      <svg width="60" height="60" viewBox="0 0 120 120" fill="none" style={{ opacity: 0.12 }}>
        <path
          d="M60 10 C95,10 110,40 110,60 C110,90 85,110 60,110 C30,110 10,85 10,60 C10,35 30,12 55,10.5"
          stroke="var(--matcha)" strokeWidth="2" strokeLinecap="round" fill="none"
          className="animate-enso"
        />
      </svg>

      <div>
        <h1
          className="text-lg font-light text-foreground/60"
          style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300, letterSpacing: '0.06em' }}
        >
          Đang xác nhận đơn hàng...
        </h1>
        <p className="text-xs font-light mt-2 text-foreground/40" style={{ fontFamily: "'Noto Serif JP', serif" }}>
          Vui lòng không đóng trang này
        </p>
      </div>

      <LoadingSpinner className="w-12 h-6" />

      <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--matcha), transparent)', opacity: 0.2 }} />
    </div>
  )
}
