import { OrderStatus as StatusOptions } from '@/payload-types'
import { cn } from '@/utilities/cn'

type Props = {
  status: StatusOptions
  className?: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Chờ xử lý',
    className: 'bg-[#F5F0E6] text-[#8B7A5E] border-[#E5DDD0]',
  },
  processing: {
    label: 'Đang xử lý',
    className: 'bg-[#EDF1F0] text-[#5E7A6B] border-[#D0DDD5]',
  },
  completed: {
    label: 'Hoàn thành',
    className: 'bg-[#F0F2ED] text-[#4A5940] border-[#D0DCC8]',
  },
  cancelled: {
    label: 'Đã hủy',
    className: 'bg-[#F5EFED] text-[#8B5E44] border-[#E5D5CC]',
  },
  shipped: {
    label: 'Đang giao',
    className: 'bg-[#EDF1F0] text-[#5E6E7A] border-[#D0D8DD]',
  },
}

export const OrderStatus: React.FC<Props> = ({ status, className }) => {
  const config = statusConfig[status as string] || {
    label: status,
    className: 'bg-muted text-muted-foreground border-border/40',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 text-[9px] tracking-[0.15em] font-light uppercase py-1 px-2.5 border',
        config.className,
        className,
      )}
      style={{ borderRadius: '1px' }}
    >
      {/* Zen dot indicator — square instead of round */}
      <span
        className="w-1 h-1 bg-current"
        style={{ opacity: 0.5, borderRadius: 0 }}
      />
      {config.label}
    </div>
  )
}
