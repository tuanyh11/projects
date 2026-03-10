'use client'

import type { CartItem } from '@/components/Cart'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import clsx from 'clsx'
import React from 'react'

export function DeleteItemButton({ item }: { item: CartItem }) {
  const { isLoading, removeItem } = useCart()
  const itemId = item.id

  return (
    <form>
      <button
        aria-label="Remove cart item"
        className={clsx(
          'flex items-center justify-center transition-all duration-400 hover:cursor-pointer',
          {
            'cursor-not-allowed opacity-30': !itemId || isLoading,
          },
        )}
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '2px',
          color: 'var(--foreground)',
          opacity: !itemId || isLoading ? 0.2 : 0.25,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.6' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.25' }}
        disabled={!itemId || isLoading}
        onClick={(e: React.FormEvent<HTMLButtonElement>) => {
          e.preventDefault()
          if (itemId) removeItem(itemId)
        }}
        type="button"
      >
        {/* Minimal X — sumi ink style */}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  )
}
