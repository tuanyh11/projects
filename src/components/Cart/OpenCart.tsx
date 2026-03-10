import clsx from 'clsx'
import { ShoppingBag } from 'lucide-react'
import { forwardRef } from 'react'

export const OpenCartButton = forwardRef<
  HTMLButtonElement,
  {
    className?: string
    quantity?: number
    scrolled?: boolean
    menuOpen?: boolean
    isHome?: boolean
    onClick?: () => void
  }
>(({ className, quantity, scrolled, menuOpen, isHome, onClick, ...rest }, ref) => {
  return (
    <button
      ref={ref}
      aria-label="Open cart"
      onClick={onClick}
      className={clsx(
        'relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300',
        menuOpen
          ? 'bg-white/15 text-white hover:bg-white/25'
          : scrolled || !isHome
            ? 'text-foreground hover:bg-muted border border-border/20'
            : 'text-white hover:bg-white/10 border border-white/10',
        className
      )}
      {...rest}
    >
      <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={2.5} />

      {quantity && quantity > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-[#0a1a12]">
          {quantity}
        </span>
      ) : null}
    </button>
  )
})

OpenCartButton.displayName = 'OpenCartButton'
