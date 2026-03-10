import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import Link from 'next/link'
import { Fragment } from 'react'

import { CheckoutPage } from '@/components/checkout/CheckoutPage'

export default function Checkout() {
  return (
    <div className="min-h-screen bg-background">
      {/* ═══ ZEN CHECKOUT HERO — Premium Dark ═══ */}
      <div className="relative overflow-hidden pt-24 pb-12 zen-hero-dark">
        {/* Ambient glow orbs */}
        <div className="zen-orb-kincha" style={{ width: '350px', height: '300px', top: '-50px', right: '15%', opacity: 0.4 }} />
        <div className="zen-orb-matcha" style={{ width: '280px', height: '250px', bottom: '-40px', left: '5%', opacity: 0.3 }} />

        {/* Shoji pattern */}
        <div className="absolute inset-0 pattern-shoji" style={{ opacity: 0.05 }} />

        {/* Kanji watermark */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden lg:block" style={{ opacity: 0.025 }}>
          
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-14 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(12,11,8,0.35))' }}
        />

        <div className="container max-w-5xl mx-auto px-4 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-6 text-[11px] font-light tracking-wide" style={{ color: 'rgba(145,141,133,0.6)' }}>
            <Link href="/" className="transition-colors duration-400 hover:text-[rgba(232,228,219,0.7)]" style={{ color: 'rgba(145,141,133,0.6)' }}>Trang chủ</Link>
            <span style={{ color: 'rgba(145,141,133,0.3)' }}>·</span>
            <Link href="/products" className="transition-colors duration-400 hover:text-[rgba(232,228,219,0.7)]" style={{ color: 'rgba(145,141,133,0.6)' }}>Sản phẩm</Link>
            <span style={{ color: 'rgba(145,141,133,0.3)' }}>·</span>
            <span style={{ color: 'rgba(232,228,219,0.6)' }}>Thanh toán</span>
          </div>

          <div className="flex items-center gap-4">
            <svg width="28" height="28" viewBox="0 0 44 44" fill="none" className="animate-zen-breathe" style={{ opacity: 0.45 }}>
              <path d="M22 4 C32,4 40,11 40,22 C40,32 33,40 22,40 C11,40 4,33 5,22 C6,13 13,5 20,4.3"
                stroke="rgba(212,184,128,0.7)" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-px" style={{ background: 'rgba(212,184,128,0.4)' }} />
                <span className="text-[9px] uppercase tracking-[0.3em] font-light" style={{ color: 'rgba(212,184,128,0.5)' }}>Hoàn tất đơn hàng</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-light tracking-tight"
                style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300, color: 'rgba(232,228,219,0.92)' }}>
                Thanh toán
              </h1>
              <p className="text-[11px] font-light tracking-wide mt-0.5" style={{ color: 'rgba(145,141,133,0.65)' }}>
                Xác nhận đơn hàng và thông tin giao hàng
              </p>
            </div>
          </div>

          {/* Zen security badges */}
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              { icon: '🔒', label: 'Bảo mật SSL' },
              { icon: '🚚', label: 'Giao hàng toàn quốc' },
              { icon: '↩️', label: 'Đổi trả 7 ngày' },
            ].map((badge, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-[10px] font-light px-3 py-1.5 tracking-wide zen-tag-kincha"
                style={{ borderRadius: '1px', color: 'rgba(145,141,133,0.7)' }}>
                <span className="text-xs" style={{ opacity: 0.5 }}>{badge.icon}</span>
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
        <div className="container max-w-5xl mx-auto px-4 mt-4">
          <div className="border border-amber-200/50 text-amber-800 text-sm p-4" style={{ borderRadius: '2px', backgroundColor: 'rgba(196,160,85,0.05)' }}>
            <Fragment>
              {'To enable checkout, you must '}
              <a
                href="https://dashboard.stripe.com/test/apikeys"
                rel="noopener noreferrer"
                target="_blank"
                className="underline font-medium"
              >
                obtain your Stripe API Keys
              </a>
              {' then set them as environment variables.'}
            </Fragment>
          </div>
        </div>
      )}

      <div className="container max-w-5xl mx-auto px-4 py-8">
        <CheckoutPage />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Thanh toán đơn hàng.',
  openGraph: mergeOpenGraph({
    title: 'Thanh toán',
    url: '/checkout',
  }),
  title: 'Thanh toán - Hồng Thái',
}
