import type { Metadata } from 'next'

import { FindOrderForm } from '@/components/forms/FindOrderForm'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'

export default async function FindOrderPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--washi)' }}>
      {/* ═══ ZEN HEADER ═══ */}
      <div className="relative overflow-hidden pt-28 pb-16" style={{ backgroundColor: '#1E1C17' }}>
        <div className="absolute inset-0 pattern-shoji" style={{ opacity: 0.06 }} />

        {/* Kanji watermark */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden lg:block" style={{ opacity: 0.04 }}>
          
        </div>

        <div className="container max-w-2xl mx-auto px-4 relative z-10 text-center">
          <svg width="36" height="36" viewBox="0 0 44 44" fill="none" className="mx-auto mb-5" style={{ opacity: 0.2 }}>
            <path d="M22 4 C32,4 40,11 40,22 C40,32 33,40 22,40 C11,40 4,33 5,22 C6,13 13,5 20,4.3"
              stroke="rgba(196,160,85,0.6)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
          <h1 className="text-3xl md:text-4xl font-light text-white mb-3 tracking-tight" style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}>Tìm đơn hàng</h1>
          <p className="text-white/25 max-w-md mx-auto font-light text-sm leading-relaxed">
            Nhập email và mã đơn hàng để tra cứu trạng thái giao hàng
          </p>
        </div>
      </div>

      <div className="container max-w-lg mx-auto px-4 -mt-8 relative z-20">
        <div className="card-washi p-8" style={{ borderRadius: '2px' }}>
          <FindOrderForm initialEmail={user?.email} />
        </div>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Tìm đơn hàng bằng email và mã đơn.',
  openGraph: mergeOpenGraph({
    title: 'Tìm đơn hàng',
    url: '/find-order',
  }),
  title: 'Tìm đơn hàng - Hồng Thái',
}
