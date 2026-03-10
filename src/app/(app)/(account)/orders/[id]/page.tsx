import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

import { OrderStatus } from '@/components/OrderStatus'
import { Price } from '@/components/Price'
import { ProductItem } from '@/components/ProductItem'
import { AddressItem } from '@/components/addresses/AddressItem'
import { formatDateTime } from '@/utilities/formatDateTime'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { CancelOrderSection } from '@/components/CancelOrderSection'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string }>
}

export default async function Order({ params, searchParams }: PageProps) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const { id } = await params
  const { email = '' } = await searchParams

  let order: Order | null = null

  try {
    const {
      docs: [orderResult],
    } = await payload.find({
      collection: 'orders',
      user,
      overrideAccess: !Boolean(user),
      depth: 2,
      where: {
        and: [
          {
            id: {
              equals: id,
            },
          },
          ...(user
            ? [
              {
                customer: {
                  equals: user.id,
                },
              },
            ]
            : []),
          ...(email
            ? [
              {
                customerEmail: {
                  equals: email,
                },
              },
            ]
            : []),
        ],
      },
      select: {
        amount: true,
        currency: true,
        items: true,
        customerEmail: true,
        customer: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        shippingAddress: true,
        trackingCode: true,
        ghnStatus: true,
        shippingFee: true,
      },
    })

    const canAccessAsGuest =
      !user &&
      email &&
      orderResult &&
      orderResult.customerEmail &&
      orderResult.customerEmail === email
    const canAccessAsUser =
      user &&
      orderResult &&
      orderResult.customer &&
      (typeof orderResult.customer === 'object'
        ? orderResult.customer.id
        : orderResult.customer) === user.id

    if (orderResult && (canAccessAsGuest || canAccessAsUser)) {
      order = orderResult
    }
  } catch (error) {
    console.error(error)
  }

  if (!order) {
    notFound()
  }

  return (
    <div className="space-y-8">
      {/* ═══ Header — Back + Order ID ═══ */}
      <div className="flex items-center justify-between">
        {user ? (
          <Link
            href="/orders"
            className="flex items-center gap-2 text-muted-foreground/70 hover:text-foreground transition-colors duration-500 group"
          >
            <svg className="w-3.5 h-3.5 transition-transform duration-400 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span
              className="text-xs font-light tracking-[0.12em] uppercase"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              Tất cả đơn hàng
            </span>
          </Link>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2.5">
          <span className="zen-kanji text-xs" style={{ color: 'var(--matcha)', opacity: 0.3 }}>票</span>
          <span
            className="text-[11px] uppercase tracking-[0.15em] font-light px-3 py-1.5 border border-border/30"
            style={{ borderRadius: '1px', color: 'var(--foreground)', opacity: 0.8 }}
          >
            {`Đơn #${order.id}`}
          </span>
        </div>
      </div>

      {/* ═══ Cancel Order — hiện khi chưa gửi hàng (pending/processing) ═══ */}
      {(['pending', 'processing'].includes(order.status as string)) && !(order as any).trackingCode && user && (
        <CancelOrderSection orderId={order.id} />
      )}

      {/* ═══ Order Summary Card ═══ */}
      <div
        className="border border-border/20 px-6 py-6 md:px-8 md:py-8"
        style={{ borderRadius: '2px', background: 'var(--washi)' }}
      >
        {/* Zen separator top */}
        <div className="flex items-center gap-3 mb-7">
          <span className="zen-kanji text-sm" style={{ color: 'var(--matcha)', opacity: 0.25 }}>概</span>
          <h2
            className="text-sm text-foreground/80 tracking-wide"
            style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
          >
            Thông tin đơn hàng
          </h2>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, var(--border), transparent)' }} />
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Ngày đặt */}
          <div>
            <p
              className="text-[9px] uppercase tracking-[0.2em] font-light mb-2"
              style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}
            >
              Ngày đặt
            </p>
            <p
              className="text-sm font-light text-foreground/85"
              style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
            >
              <time dateTime={order.createdAt}>
                {formatDateTime({ date: order.createdAt, format: 'dd/MM/yyyy' })}
              </time>
            </p>
          </div>

          {/* Tổng cộng */}
          <div>
            <p
              className="text-[9px] uppercase tracking-[0.2em] font-light mb-2"
              style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}
            >
              Tổng cộng
            </p>
            {order.amount && (
              <span
                className="text-sm font-light text-foreground/85"
                style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
              >
                <Price amount={order.amount} as="span" />
              </span>
            )}
          </div>

          {/* Trạng thái */}
          {order.status && (
            <div>
              <p
                className="text-[9px] uppercase tracking-[0.2em] font-light mb-2"
                style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}
              >
                Trạng thái
              </p>
              <OrderStatus className="text-sm" status={order.status} />
            </div>
          )}
        </div>
      </div>

      {/* ═══ Products List ═══ */}
      {order.items && (
        <div
          className="border border-border/20 px-6 py-6 md:px-8 md:py-8"
          style={{ borderRadius: '2px', background: 'var(--washi)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="zen-kanji text-sm" style={{ color: 'var(--matcha)', opacity: 0.25 }}>品</span>
            <h2
              className="text-sm text-foreground/80 tracking-wide"
              style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
            >
              Sản phẩm
            </h2>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, var(--border), transparent)' }} />
          </div>

          <div>
            {order.items?.map((item, index) => {
              if (typeof item.product === 'string') return null
              if (!item.product || typeof item.product !== 'object') {
                return (
                  <div key={index} className="py-3 text-sm text-muted-foreground/40 font-light italic">
                    Sản phẩm không còn tồn tại.
                  </div>
                )
              }

              const variant =
                item.variant && typeof item.variant === 'object' ? item.variant : undefined

              return (
                <ProductItem
                  key={item.id}
                  product={item.product}
                  quantity={item.quantity}
                  variant={variant}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* ═══ Shipping Address ═══ */}
      {order.shippingAddress && (
        <div
          className="border border-border/20 px-6 py-6 md:px-8 md:py-8"
          style={{ borderRadius: '2px', background: 'var(--washi)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="zen-kanji text-sm" style={{ color: 'var(--matcha)', opacity: 0.25 }}>届</span>
            <h2
              className="text-sm text-foreground/80 tracking-wide"
              style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
            >
              Địa chỉ giao hàng
            </h2>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, var(--border), transparent)' }} />
          </div>
          <AddressItem address={order.shippingAddress} hideActions />
        </div>
      )}

      {/* ═══ Tracking ═══ */}
      {((order as any).trackingCode || (order as any).ghnStatus) && (
        <div
          className="border border-border/20 px-6 py-6 md:px-8 md:py-8"
          style={{ borderRadius: '2px', background: 'var(--washi)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="zen-kanji text-sm" style={{ color: 'var(--matcha)', opacity: 0.25 }}>運</span>
            <h2
              className="text-sm text-foreground/80 tracking-wide"
              style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
            >
              Theo dõi vận chuyển
            </h2>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, var(--border), transparent)' }} />
          </div>

          <div className="space-y-5">
            {(order as any).trackingCode && (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className="text-[9px] uppercase tracking-[0.2em] font-light mb-1.5"
                    style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}
                  >
                    Mã vận đơn GHN
                  </p>
                  <p
                    className="text-sm font-light tracking-wide text-foreground/85"
                    style={{ fontFamily: "'Noto Serif JP', serif" }}
                  >
                    {(order as any).trackingCode}
                  </p>
                </div>
                <a
                  href={`https://tracking.ghn.dev/?order_code=${(order as any).trackingCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-[10px] px-4 py-2 tracking-widest uppercase font-light border border-border/30
                    text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-all duration-500"
                  style={{ borderRadius: '2px' }}
                >
                  Tra cứu →
                </a>
              </div>
            )}

            {(order as any).ghnStatus && (
              <div>
                <p
                  className="text-[9px] uppercase tracking-[0.2em] font-light mb-1.5"
                  style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}
                >
                  Trạng thái vận chuyển
                </p>
                <GHNStatusBadge status={(order as any).ghnStatus} />
              </div>
            )}

            {(order as any).shippingFee != null && (order as any).shippingFee > 0 && (
              <div>
                <p
                  className="text-[9px] uppercase tracking-[0.2em] font-light mb-1.5"
                  style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}
                >
                  Phí vận chuyển
                </p>
                <p
                  className="text-sm font-light text-foreground/85"
                  style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
                >
                  <Price amount={(order as any).shippingFee} />
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══ GHN Status Badge — Zen ═══
function GHNStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; color: string; bg: string; border: string }> = {
    ready_to_pick: { label: 'Chờ lấy hàng', color: 'var(--kincha)', bg: 'rgba(183,142,86,0.06)', border: 'rgba(183,142,86,0.15)' },
    picking: { label: 'Đang lấy hàng', color: 'var(--kincha)', bg: 'rgba(183,142,86,0.06)', border: 'rgba(183,142,86,0.15)' },
    delivering: { label: 'Đang giao hàng', color: 'var(--matcha)', bg: 'rgba(107,122,94,0.06)', border: 'rgba(107,122,94,0.15)' },
    delivered: { label: 'Giao thành công', color: 'var(--matcha)', bg: 'rgba(107,122,94,0.08)', border: 'rgba(107,122,94,0.2)' },
    cancel: { label: 'Đã hủy', color: '#a0664b', bg: 'rgba(160,102,75,0.06)', border: 'rgba(160,102,75,0.15)' },
  }

  const info = statusMap[status] || { label: status, color: 'var(--foreground)', bg: 'transparent', border: 'var(--border)' }

  return (
    <span
      className="inline-block text-[9px] uppercase tracking-[0.15em] py-1.5 px-3 font-light"
      style={{
        borderRadius: '1px',
        color: info.color,
        background: info.bg,
        border: `1px solid ${info.border}`,
      }}
    >
      {info.label}
    </span>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  return {
    description: `Order details for order ${id}.`,
    openGraph: mergeOpenGraph({
      title: `Order ${id}`,
      url: `/orders/${id}`,
    }),
    title: `Order ${id}`,
  }
}
