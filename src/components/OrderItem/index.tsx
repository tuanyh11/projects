import { OrderStatus } from '@/components/OrderStatus'
import { Price } from '@/components/Price'
import { Order } from '@/payload-types'
import { formatDateTime } from '@/utilities/formatDateTime'
import Link from 'next/link'

type Props = {
  order: Order
}

const ghnStatusLabels: Record<string, { label: string; color: string }> = {
  ready_to_pick: { label: 'Chờ lấy hàng', color: 'bg-[#F5F0E6] text-[#8B7A5E] border border-[#E5DDD0]' },
  picking: { label: 'Đang lấy hàng', color: 'bg-[#F0F2ED] text-[#6B7A5E] border border-[#D8DDD0]' },
  delivering: { label: 'Đang giao hàng', color: 'bg-[#EDF1F0] text-[#5E7A7A] border border-[#D0DDDA]' },
  delivered: { label: 'Giao thành công', color: 'bg-[#F0F2ED] text-[#4A5940] border border-[#D0DCC8]' },
  cancel: { label: 'Đã hủy', color: 'bg-[#F5EFED] text-[#8B5E44] border border-[#E5D5CC]' },
}

export const OrderItem: React.FC<Props> = ({ order }) => {
  const itemsLabel = 'sản phẩm'
  const ghnStatus = (order as any).ghnStatus as string | undefined
  const trackingCode = (order as any).trackingCode as string | undefined

  return (
    <div
      className="border border-border/30 px-5 py-4 md:px-6 md:py-5 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between transition-all duration-500 group relative overflow-hidden"
      style={{ borderRadius: '2px', background: 'var(--card)' }}
    >
      {/* Subtle matcha line accent on left */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-500 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(to bottom, var(--matcha), transparent)',
          opacity: 0.2,
        }}
      />

      <div className="flex flex-col gap-3 pl-2">
        <div className="flex items-center gap-3">
          {/* Order number — Zen mono style */}
          <span
            className="text-[11px] tracking-[0.15em] font-light px-3 py-1 border border-border/40"
            style={{
              borderRadius: '1px',
              color: 'var(--matcha)',
              fontFamily: "'Noto Serif JP', serif",
            }}
          >
            #{order.id}
          </span>
          {order.status && <OrderStatus status={order.status} />}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <p
            className="text-sm text-foreground/80 font-light"
            style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
          >
            <time dateTime={order.createdAt}>
              {formatDateTime({ date: order.createdAt, format: 'dd/MM/yyyy' })}
            </time>
          </p>

          <p className="text-xs text-muted-foreground/60 flex items-center gap-1.5 font-light">
            <span
              className="w-1 h-1"
              style={{
                background: 'var(--matcha)',
                borderRadius: '0',
                opacity: 0.3,
              }}
            />
            {order.items?.length} {itemsLabel}
          </p>

          {order.amount && (
            <Price
              as="span"
              amount={order.amount}
              currencyCode={order.currency ?? undefined}
              className="text-sm font-light text-foreground/90"
            />
          )}
        </div>

        {/* Tracking badge — Zen style */}
        {(ghnStatus || trackingCode) && (
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {trackingCode && (
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-light tracking-[0.1em] px-2.5 py-1"
                style={{
                  borderRadius: '1px',
                  background: 'var(--yuki)',
                  color: 'var(--foreground)',
                  opacity: 0.7,
                  fontFamily: "'Noto Serif JP', serif",
                }}
              >
                🚚 {trackingCode}
              </span>
            )}
            {ghnStatus && ghnStatusLabels[ghnStatus] && (
              <span
                className={`inline-flex items-center text-[9px] font-light uppercase tracking-[0.15em] px-2.5 py-1 ${ghnStatusLabels[ghnStatus].color}`}
                style={{ borderRadius: '1px' }}
              >
                {ghnStatusLabels[ghnStatus].label}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Detail button — Zen style */}
      <Link
        href={`/orders/${order.id}`}
        className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 text-[11px] font-light tracking-[0.15em] border border-border/40 text-foreground/60 hover:text-foreground hover:border-foreground/20 transition-all duration-400 btn-zen"
        style={{
          borderRadius: '2px',
          fontFamily: "'Noto Serif JP', serif",
        }}
      >
        Chi tiết
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </div>
  )
}
