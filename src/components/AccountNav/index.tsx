'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Props = {
  className?: string
}

export const AccountNav: React.FC<Props> = ({ className }) => {
  const pathname = usePathname()

  const navItems = [
    { href: '/account', label: 'Tài khoản & Địa chỉ', kanji: '設', match: '/account' },
    { href: '/orders', label: 'Lịch sử mua hàng', kanji: '買', match: '/orders' },
  ]

  return (
    <div className={clsx('border border-border/30 p-1.5 flex flex-nowrap items-center overflow-x-auto no-scrollbar', className)} style={{ borderRadius: '2px', backgroundColor: 'var(--card)' }}>
      <ul className="flex flex-nowrap gap-1 w-full lg:w-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.match || (item.match === '/orders' && pathname.startsWith('/orders'));
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                className={clsx(
                  'flex items-center gap-2.5 px-5 py-2.5 text-[12px] font-light transition-all duration-400 w-full whitespace-nowrap tracking-wide',
                  isActive
                    ? 'text-foreground border border-border/40'
                    : 'text-muted-foreground/60 hover:text-foreground border border-transparent'
                )}
                style={{ borderRadius: '1px' }}
              >
                <span className="zen-kanji text-xs" style={{ color: isActive ? 'var(--matcha)' : 'var(--muted-foreground)', opacity: isActive ? 0.6 : 0.25 }}>{item.kanji}</span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="lg:ml-auto ml-2 shrink-0 pl-3 border-l border-border/30 py-1">
        <Link
          href="/logout"
          className={clsx(
            'flex items-center gap-2 px-4 py-2.5 text-[12px] font-light transition-all duration-400 whitespace-nowrap tracking-wide',
            pathname === '/logout'
              ? 'text-foreground/60'
              : 'text-muted-foreground/40 hover:text-foreground/60'
          )}
          style={{ borderRadius: '1px' }}
        >
          <span className="zen-kanji text-xs" style={{ opacity: 0.3 }}>出</span>
          Đăng xuất
        </Link>
      </div>
    </div>
  )
}
