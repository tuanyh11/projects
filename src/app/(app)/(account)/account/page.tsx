import type { Metadata } from 'next'

import { AddressListing } from '@/components/addresses/AddressListing'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { AccountForm } from '@/components/forms/AccountForm'
import { OrderItem } from '@/components/OrderItem'
import { Button } from '@/components/ui/button'
import { Order } from '@/payload-types'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function AccountPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  let orders: Order[] | null = null

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent('Please login to access your account settings.')}`,
    )
  }

  try {
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 5,
      user,
      overrideAccess: false,
      pagination: false,
      where: {
        customer: {
          equals: user?.id,
        },
      },
    })

    orders = ordersResult?.docs || []
  } catch (error) { }

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* ═══ Account Settings Card ═══ */}
        <div className="card-washi p-6 md:p-8 relative overflow-hidden" style={{ borderRadius: '2px' }}>
          {/* Kanji watermark */}
          <div className="absolute top-0 right-0 pointer-events-none select-none" style={{ opacity: 0.03 }}>
            <span className="zen-kanji text-foreground" style={{ fontSize: '10rem', lineHeight: 1 }}>人</span>
          </div>

          <h1 className="text-xl md:text-2xl mb-6 tracking-tight text-foreground flex items-center gap-3 relative z-10" style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}>
            <span className="zen-kanji text-lg" style={{ color: 'var(--matcha)', opacity: 0.4 }}>人</span>
            Cài đặt tài khoản
          </h1>
          <div className="relative z-10">
            <AccountForm />
          </div>
        </div>

        {/* ═══ Address Card ═══ */}
        <div className="card-washi p-6 md:p-8 relative overflow-hidden flex flex-col" style={{ borderRadius: '2px' }}>
          <div className="absolute top-0 right-0 pointer-events-none select-none" style={{ opacity: 0.03 }}>
            <span className="zen-kanji text-foreground" style={{ fontSize: '10rem', lineHeight: 1 }}>所</span>
          </div>

          <h2 className="text-xl md:text-2xl mb-6 tracking-tight text-foreground flex items-center gap-3 relative z-10" style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}>
            <span className="zen-kanji text-lg" style={{ color: 'var(--matcha)', opacity: 0.4 }}>所</span>
            Địa chỉ giao hàng
          </h2>

          <div className="relative z-10 mb-6 grow">
            <AddressListing />
          </div>

          <div className="relative z-10 mt-auto">
            <CreateAddressModal />
          </div>
        </div>
      </div>

      {/* ═══ Orders Card ═══ */}
      <div className="card-washi p-8 md:p-10 relative overflow-hidden" style={{ borderRadius: '2px' }}>
        {/* Kanji watermark */}
        <div className="absolute top-0 right-0 pointer-events-none select-none" style={{ opacity: 0.03 }}>
          <span className="zen-kanji text-foreground" style={{ fontSize: '12rem', lineHeight: 1 }}>買</span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="zen-kanji text-xl" style={{ color: 'var(--matcha)', opacity: 0.4 }}>買</span>
          <h2 className="text-2xl tracking-tight text-foreground" style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}>
            Đơn hàng gần đây
          </h2>
        </div>

        <div className="mb-8 text-muted-foreground text-sm leading-[1.9] max-w-3xl font-light">
          <p>
            Dưới đây là các đơn hàng bạn đã đặt mua gần đây nhất. Bạn có thể theo dõi trạng thái đơn hàng và xem lại lịch sử thanh toán tại đây.
          </p>
        </div>

        {(!orders || !Array.isArray(orders) || orders?.length === 0) ? (
          <div className="text-center py-12 md:py-16 border border-dashed border-border/40 flex flex-col items-center mb-8 pattern-shoji" style={{ borderRadius: '2px' }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-5" style={{ opacity: 0.12 }}>
              <path d="M24 4 C35,4 44,12 44,24 C44,35 36,44 24,44 C12,44 4,36 5,24 C6,14 14,6 22,4.5"
                stroke="var(--matcha)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
            <p className="text-foreground/60 text-lg mb-1 font-light" style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}>Chưa có đơn hàng nào</p>
            <p className="text-muted-foreground text-sm font-light">Hãy khám phá các sản phẩm tuyệt vời của chúng tôi nhé!</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4 mb-8">
            {orders?.map((order, index) => (
              <li key={order.id} className="transition-all hover:bg-muted/5 group border border-transparent hover:border-border/40 p-1" style={{ borderRadius: '2px' }}>
                <OrderItem order={order} />
              </li>
            ))}
          </ul>
        )}

        <Button asChild variant="default" className="btn-zen font-light h-11 px-8 text-sm tracking-wide" style={{ borderRadius: '2px' }}>
          <Link href="/orders">Xem tất cả đơn hàng</Link>
        </Button>
      </div>
    </>
  )
}

export const metadata: Metadata = {
  description: 'Create an account or log in to your existing account.',
  openGraph: mergeOpenGraph({
    title: 'Account',
    url: '/account',
  }),
  title: 'Account',
}
