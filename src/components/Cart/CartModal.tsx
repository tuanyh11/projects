'use client'

import { Price } from '@/components/Price'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Product } from '@/payload-types'
import { useCartSelection } from '@/providers/CartSelection'
import { DeleteItemButton } from './DeleteItemButton'
import { EditItemQuantityButton } from './EditItemQuantityButton'
import { OpenCartButton } from './OpenCart'

function getCartItemId(item: any): string {
  const product = item.product as { id: string }
  const variant = item.variant
  const variantId = variant && typeof variant === 'object' ? variant.id : variant
  return variantId ? `${product.id}_${variantId}` : product.id
}

export function CartModal({
  className,
  scrolled,
  menuOpen,
  isHome
}: {
  className?: string
  scrolled?: boolean
  menuOpen?: boolean
  isHome?: boolean
}) {
  const { cart } = useCart()
  const { isSelected, toggle, selectAll, deselectAll, selectedCount, totalCount } = useCartSelection()
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    // Lock body scroll when open
    document.body.style.overflow = 'hidden'
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const totalQuantity = useMemo(() => {
    if (!cart || !cart.items || !cart.items.length) return undefined
    return cart.items.reduce((quantity, item) => (item.quantity || 0) + quantity, 0)
  }, [cart])

  const selectedSubtotal = useMemo(() => {
    if (!cart?.items?.length) return 0
    return cart.items.reduce((sum, item) => {
      if (typeof item.product !== 'object' || !item.product) return sum
      const itemId = getCartItemId(item)
      if (!isSelected(itemId)) return sum

      const variant = item.variant
      const isVariant = Boolean(variant) && typeof variant === 'object'
      const price = isVariant ? variant?.priceInVND : item.product.priceInVND
      return sum + (price || 0) * (item.quantity || 0)
    }, 0)
  }, [cart?.items, isSelected])

  const allSelected = selectedCount === totalCount && totalCount > 0

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const itemCount = cart?.items?.length || 0

  return (
    <div className="relative">
      {/* Trigger button */}
      <OpenCartButton
        ref={triggerRef}
        className={className}
        quantity={totalQuantity}
        scrolled={scrolled}
        menuOpen={menuOpen}
        isHome={isHome}
        onClick={handleToggle}
      />

      {/* Backdrop overlay — cinematic dark, below header */}
      <div
        className="fixed left-0 right-0 bottom-0 z-80"
        style={{
          top: 'var(--header-height, 64px)',
          background: isOpen
            ? 'radial-gradient(ellipse at top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.65) 100%)'
            : 'transparent',
          backdropFilter: isOpen ? 'blur(6px)' : 'none',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 0.5s ease',
        }}
        onClick={() => setIsOpen(false)}
      />

      {/* ═══════════ FULL-WIDTH MEGA DROPDOWN — ZEN ═══════════ */}
      <div
        ref={panelRef}
        className="fixed left-0 right-0 z-85 overflow-hidden"
        style={{
          top: 'var(--header-height, 64px)',
          maxHeight: isOpen ? 'calc(100vh - var(--header-height, 64px))' : '0',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'max-height 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        <div
          className="relative"
          style={{
            background: 'color-mix(in srgb, var(--background) 97%, transparent)',
            backdropFilter: 'blur(32px) saturate(1.3)',
            borderBottom: '1px solid color-mix(in srgb, var(--border) 50%, transparent)',
          }}
        >
          {/* Top accent line — matcha to kincha gradient */}
          <div style={{
            height: '2px',
            background: 'linear-gradient(90deg, transparent 10%, var(--matcha) 35%, var(--kincha) 65%, transparent 90%)',
            opacity: 0.5,
          }} />

          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 pattern-seigaiha" style={{ opacity: 0.03 }} />

          {/* Large kanji watermark */}
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden lg:block" style={{ opacity: 0.025 }}>
            <span className="zen-kanji text-foreground" style={{ fontSize: '16rem', lineHeight: 1 }}>籠</span>
          </div>

          <div className="container max-w-6xl mx-auto px-4 relative z-10">

            {!cart || itemCount === 0 ? (
              /* ═══ Empty Cart — Zen Minimal ═══ */
              <div className="flex flex-col items-center justify-center gap-4 text-center py-20">
                {/* Enso */}
                <svg width="56" height="56" viewBox="0 0 120 120" fill="none" style={{ opacity: 0.1 }}>
                  <path
                    d="M60 10 C95,10 110,40 110,60 C110,90 85,110 60,110 C30,110 10,85 10,60 C10,35 30,12 55,10.5"
                    stroke="var(--matcha)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    className="animate-enso"
                  />
                </svg>
                <p
                  className="text-foreground/40 text-sm font-light"
                  style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300, letterSpacing: '0.06em' }}
                >
                  Giỏ hàng trống
                </p>
                <div style={{ width: '32px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--matcha), transparent)', opacity: 0.25 }} />
                <Link
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className="group inline-flex items-center gap-2 text-[11px] font-light tracking-[0.15em] uppercase text-foreground/40 hover:text-foreground transition-colors duration-500"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  Tiếp tục mua sắm
                  <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </Link>
              </div>

            ) : (
              /* ═══ Cart with items — Mega Layout ═══ */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-10">

                {/* ══ LEFT: Product List ══ */}
                <div className="lg:col-span-8 py-6">
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="select-all-mega"
                          checked={allSelected}
                          onCheckedChange={(checked) => {
                            if (checked) selectAll()
                            else deselectAll()
                          }}
                        />
                        <label
                          htmlFor="select-all-mega"
                          className="text-[12px] font-light text-foreground/40 cursor-pointer select-none tracking-wide"
                          style={{ fontFamily: "'Noto Serif JP', serif" }}
                        >
                          Chọn tất cả
                        </label>
                      </div>
                      <div className="h-3 w-px bg-border/40" />
                      <span className="text-[11px] text-muted-foreground font-light tracking-wider">
                        {totalCount} sản phẩm
                      </span>
                    </div>

                    {/* Close button */}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center gap-2 text-foreground/30 hover:text-foreground/60 transition-all duration-300"
                      aria-label="Đóng giỏ hàng"
                    >
                      <span className="text-[10px] font-light uppercase tracking-[0.15em] opacity-0 group-hover:opacity-100 transition-opacity duration-300">Đóng</span>
                      <div className="w-8 h-8 flex items-center justify-center border border-border/30 hover:border-border/60 transition-colors" style={{ borderRadius: '2px' }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                        </svg>
                      </div>
                    </button>
                  </div>

                  {/* Product list — scrollable */}
                  <div className="overflow-y-auto pr-2" style={{ maxHeight: '380px' }}>
                    <div className="grid grid-cols-1 gap-3">
                      {cart?.items?.map((item, i) => {
                        const product = item.product
                        const variant = item.variant

                        if (typeof product !== 'object' || !item || !product || !product.slug)
                          return <React.Fragment key={i} />

                        const itemId = getCartItemId(item)
                        const checked = isSelected(itemId)

                        const metaImage =
                          product.meta?.image && typeof product.meta?.image === 'object'
                            ? product.meta.image
                            : undefined

                        const firstGalleryImage =
                          typeof product.gallery?.[0]?.image === 'object'
                            ? product.gallery?.[0]?.image
                            : undefined

                        let image = firstGalleryImage || metaImage
                        let price = product.priceInVND

                        const isVariant = Boolean(variant) && typeof variant === 'object'

                        if (isVariant) {
                          price = variant?.priceInVND

                          const imageVariant = product.gallery?.find((item: any) => {
                            if (!item.variantOption) return false
                            const variantOptionID =
                              typeof item.variantOption === 'object'
                                ? item.variantOption.id
                                : item.variantOption

                            const hasMatch = variant?.options?.some((option: any) => {
                              if (typeof option === 'object') return option.id === variantOptionID
                              else return option === variantOptionID
                            })

                            return hasMatch
                          })

                          if (imageVariant && typeof imageVariant.image === 'object') {
                            image = imageVariant.image
                          }
                        }

                        return (
                          <div
                            className="group flex items-start gap-4 p-4 transition-all duration-500"
                            key={i}
                            style={{
                              background: checked ? 'rgba(107, 122, 94, 0.05)' : 'var(--card)',
                              border: `1px solid ${checked ? 'rgba(107, 122, 94, 0.15)' : 'color-mix(in srgb, var(--border) 60%, transparent)'}`,
                              borderRadius: '3px',
                            }}
                          >
                            {/* Checkbox */}
                            <div className="shrink-0 pt-2">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggle(itemId)}
                              />
                            </div>

                            {/* Product image — larger for mega dropdown */}
                            <Link
                              className="shrink-0"
                              href={`/products/${(item.product as Product)?.slug}`}
                              onClick={() => setIsOpen(false)}
                            >
                              <div
                                className="relative overflow-hidden"
                                style={{
                                  width: '80px',
                                  height: '80px',
                                  borderRadius: '3px',
                                  border: '1px solid color-mix(in srgb, var(--border) 50%, transparent)',
                                }}
                              >
                                {image?.url ? (
                                  <Image
                                    alt={image?.alt || product?.title || ''}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    height={80}
                                    src={image.url}
                                    width={80}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center pattern-seigaiha">
                                    <span className="zen-kanji text-xl" style={{ color: 'var(--matcha)', opacity: 0.1 }}>茶</span>
                                  </div>
                                )}
                              </div>
                            </Link>

                            {/* Info */}
                            <div className="flex flex-1 flex-col min-w-0 gap-1">
                              <div className="flex justify-between items-start gap-3">
                                <Link href={`/products/${(item.product as Product)?.slug}`} onClick={() => setIsOpen(false)} className="flex-1 min-w-0">
                                  <h4
                                    className="text-[14px] font-light text-foreground/80 leading-snug hover:text-foreground transition-colors duration-400 line-clamp-1"
                                    style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
                                  >
                                    {product?.title}
                                  </h4>
                                  {isVariant && variant ? (
                                    <p className="text-[10px] text-muted-foreground/50 capitalize mt-0.5 font-light tracking-wide">
                                      {variant.options
                                        ?.map((option: any) => {
                                          if (typeof option === 'object') return option.label
                                          return null
                                        })
                                        .join(', ')}
                                    </p>
                                  ) : null}
                                </Link>

                                <div className="shrink-0">
                                  <DeleteItemButton item={item} />
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-2">
                                {/* Quantity controls */}
                                <div
                                  className="flex items-center"
                                  style={{
                                    border: '1px solid var(--border)',
                                    borderRadius: '2px',
                                    height: '28px',
                                  }}
                                >
                                  <EditItemQuantityButton item={item} type="minus" />
                                  <span
                                    className="w-7 text-center text-[12px] font-light text-foreground/60"
                                    style={{ fontFamily: "'Noto Serif JP', serif" }}
                                  >
                                    {item.quantity}
                                  </span>
                                  <EditItemQuantityButton item={item} type="plus" />
                                </div>

                                {/* Price — unit + total */}
                                {typeof price === 'number' && item.quantity && (
                                  <div className="text-right flex items-baseline gap-3">
                                    {item.quantity > 1 && (
                                      <span className="text-[10px] text-muted-foreground/40 font-light">
                                        {new Intl.NumberFormat('vi-VN').format(price)}₫ × {item.quantity}
                                      </span>
                                    )}
                                    <Price
                                      amount={price * item.quantity}
                                      className="text-[14px] font-light text-foreground/75"
                                      currencyCode="VND"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* ══ RIGHT: Summary Panel ══ */}
                <div
                  className="lg:col-span-4 py-6 lg:py-6"
                  style={{
                    borderLeft: 'none',
                  }}
                >
                  <div
                    className="lg:sticky lg:top-0 p-6 relative overflow-hidden"
                    style={{
                      background: 'color-mix(in srgb, var(--muted) 40%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--border) 40%, transparent)',
                      borderRadius: '3px',
                    }}
                  >
                    {/* Mini pattern inside summary */}
                    <div className="absolute inset-0 pattern-asanoha" style={{ opacity: 0.02 }} />

                    {/* Kanji watermark in summary card */}
                    <div className="absolute -right-2 -bottom-4 pointer-events-none select-none" style={{ opacity: 0.03 }}>
                      <span className="zen-kanji text-foreground" style={{ fontSize: '8rem', lineHeight: 1 }}>計</span>
                    </div>

                    <div className="relative z-10">
                      {/* Summary header */}
                      <div className="flex items-center gap-3 mb-6">
                        <span className="zen-kanji text-sm" style={{ color: 'var(--matcha)', opacity: 0.3 }}>計</span>
                        <p
                          className="text-[11px] text-foreground/40 uppercase tracking-[0.2em] font-light"
                          style={{ fontFamily: "'Noto Serif JP', serif" }}
                        >
                          Tổng đơn hàng
                        </p>
                      </div>

                      {/* Zen stroke */}
                      <div className="mb-5" style={{ width: '32px', height: '1px', background: 'linear-gradient(to right, var(--matcha), transparent)', opacity: 0.3 }} />

                      {/* Selected items info */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] text-foreground/40 font-light">Sản phẩm đã chọn</span>
                          <span className="text-[13px] text-foreground/70 font-light" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                            {selectedCount}/{totalCount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] text-foreground/40 font-light">Tạm tính</span>
                          <div style={{ fontFamily: "'Noto Serif JP', serif" }}>
                            <Price
                              amount={selectedSubtotal}
                              className="text-[13px] font-light text-foreground/70"
                              currencyCode="VND"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] text-foreground/40 font-light">Phí vận chuyển</span>
                          <span className="text-[11px] text-muted-foreground/50 font-light italic">tính khi thanh toán</span>
                        </div>
                      </div>

                      {/* Separator */}
                      <div className="mb-5" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />

                      {/* Total */}
                      <div className="flex items-baseline justify-between mb-6">
                        <span className="text-[13px] text-foreground/60 font-light" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                          Tổng cộng
                        </span>
                        <div style={{ fontFamily: "'Noto Serif JP', serif" }}>
                          <Price
                            amount={selectedSubtotal}
                            className="text-xl font-light text-foreground/90"
                            currencyCode="VND"
                          />
                        </div>
                      </div>

                      {/* Checkout button */}
                      <Link
                        href="/checkout"
                        onClick={() => setIsOpen(false)}
                        className="group block w-full text-center transition-all duration-500 relative overflow-hidden"
                        style={{
                          background: selectedCount === 0 ? 'var(--muted)' : 'var(--matcha)',
                          color: selectedCount === 0 ? 'var(--muted-foreground)' : 'var(--washi)',
                          padding: '14px 24px',
                          borderRadius: '3px',
                          fontSize: '12px',
                          fontFamily: "'Noto Serif JP', serif",
                          fontWeight: 300,
                          letterSpacing: '0.12em',
                          opacity: selectedCount === 0 ? 0.4 : 1,
                          pointerEvents: selectedCount === 0 ? 'none' : 'auto',
                        }}
                      >
                        {selectedCount === 0 ? (
                          'Chọn sản phẩm để thanh toán'
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            Thanh toán
                            <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                          </span>
                        )}
                      </Link>

                      {/* Continue shopping link */}
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setIsOpen(false)}
                          className="group inline-flex items-center gap-2 text-[10px] text-foreground/30 hover:text-foreground/60 uppercase tracking-[0.15em] font-light transition-colors duration-400"
                        >
                          <svg className="w-3 h-3 rotate-180 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                          Tiếp tục mua sắm
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Bottom accent line */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent 20%, var(--matcha) 40%, var(--kincha) 60%, transparent 80%)',
            opacity: 0.15,
          }} />
        </div>
      </div>
    </div>
  )
}
