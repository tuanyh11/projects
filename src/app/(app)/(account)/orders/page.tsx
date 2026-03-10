import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import { OrderItem } from '@/components/OrderItem'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function Orders() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  let orders: Order[] | null = null

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent('Please login to access your orders.')}`)
  }

  try {
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 0,
      pagination: false,
      user,
      overrideAccess: false,
      where: {
        customer: {
          equals: user?.id,
        },
      },
    })

    orders = ordersResult?.docs || []
  } catch (error) { }

  return (
    <div className="card-washi p-8 md:p-10 relative overflow-hidden" style={{ borderRadius: '2px' }}>
      {/* Kanji watermark */}
      <div className="absolute top-0 right-0 pointer-events-none select-none" style={{ opacity: 0.03 }}>
        <span className="zen-kanji text-foreground" style={{ fontSize: '14rem', lineHeight: 1 }}>注</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="zen-kanji text-xl" style={{ color: 'var(--matcha)', opacity: 0.4 }}>注</span>
          <div>
            <h1 className="text-2xl tracking-tight text-foreground" style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}>Đơn hàng của bạn</h1>
            <p className="text-sm text-muted-foreground font-light mt-0.5">
              {orders && orders.length > 0 ? `${orders.length} đơn hàng` : 'Chưa có đơn hàng nào'}
            </p>
          </div>
        </div>
      </div>

      {(!orders || !Array.isArray(orders) || orders?.length === 0) ? (
        <div className="text-center py-16 border border-dashed border-border/40 flex flex-col items-center pattern-shoji" style={{ borderRadius: '2px' }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-5" style={{ opacity: 0.12 }}>
            <path d="M24 4 C35,4 44,12 44,24 C44,35 36,44 24,44 C12,44 4,36 5,24 C6,14 14,6 22,4.5"
              stroke="var(--matcha)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
          <p className="text-foreground/60 text-lg mb-1 font-light" style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}>Chưa có đơn hàng nào</p>
          <p className="text-muted-foreground text-sm mb-6 font-light">Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!</p>
          <Link href="/products" className="btn-zen inline-flex items-center gap-2 text-sm font-light px-6 py-3 tracking-wide" style={{ borderRadius: '2px' }}>
            Xem sản phẩm
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders?.map((order) => (
            <li key={order.id} className="transition-all hover:bg-muted/5 group" style={{ borderRadius: '2px' }}>
              <OrderItem order={order} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Danh sách đơn hàng của bạn.',
  openGraph: mergeOpenGraph({
    title: 'Đơn hàng',
    url: '/orders',
  }),
  title: 'Đơn hàng',
}
