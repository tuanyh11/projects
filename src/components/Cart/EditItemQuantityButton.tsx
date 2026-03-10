'use client'

import { CartItem } from '@/components/Cart'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import clsx from 'clsx'
import React, { useMemo } from 'react'

export function EditItemQuantityButton({ type, item }: { item: CartItem; type: 'minus' | 'plus' }) {
  const { decrementItem, incrementItem, isLoading } = useCart()

  const disabled = useMemo(() => {
    if (!item.id) return true

    const target =
      item.variant && typeof item.variant === 'object'
        ? item.variant
        : item.product && typeof item.product === 'object'
          ? item.product
          : null

    if (
      target &&
      typeof target === 'object' &&
      target.inventory !== undefined &&
      target.inventory !== null
    ) {
      if (type === 'plus' && item.quantity !== undefined && item.quantity !== null) {
        return item.quantity >= target.inventory
      }
    }

    return false
  }, [item, type])

  return (
    <form>
      <button
        disabled={disabled || isLoading}
        aria-label={type === 'plus' ? 'Increase item quantity' : 'Reduce item quantity'}
        className={clsx(
          'flex items-center justify-center transition-all duration-300 hover:cursor-pointer',
          {
            'cursor-not-allowed opacity-30': disabled || isLoading,
          },
        )}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '0',
          color: 'var(--foreground)',
          opacity: disabled || isLoading ? 0.25 : 0.45,
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isLoading) {
            e.currentTarget.style.opacity = '0.8'
            e.currentTarget.style.background = 'rgba(107, 122, 94, 0.06)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = disabled || isLoading ? '0.25' : '0.45'
          e.currentTarget.style.background = 'transparent'
        }}
        onClick={(e: React.FormEvent<HTMLButtonElement>) => {
          e.preventDefault()
          if (item.id) {
            if (type === 'plus') {
              incrementItem(item.id)
            } else {
              decrementItem(item.id)
            }
          }
        }}
        type="button"
      >
        {type === 'plus' ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 2V8M2 5H8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5H8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </form>
  )
}
