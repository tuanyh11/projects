'use client'
import type { Product, Variant } from '@/payload-types'

import { AddToCart } from '@/components/Cart/AddToCart'
import { RichText } from '@/components/RichText'
import { Suspense } from 'react'

import { StockIndicator } from '@/components/product/StockIndicator'
import { VariantSelector } from './VariantSelector'

export function ProductDescription({ product }: { product: Product }) {
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)

  let displayPrice = ''
  if (hasVariants) {
    const prices = (product.variants?.docs || [])
      .filter((v): v is Variant => v != null && typeof v === 'object')
      .map((v) => v.priceInVND || 0)
      .filter((p) => p > 0)
      .sort((a, b) => a - b)

    if (prices.length > 0) {
      const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + '₫'
      displayPrice = prices[0] === prices[prices.length - 1]
        ? fmt(prices[0])
        : `${fmt(prices[0])} – ${fmt(prices[prices.length - 1])}`
    }
  } else {
    const price = product.priceInVND || 0
    if (price > 0) {
      displayPrice = new Intl.NumberFormat('vi-VN').format(price) + '₫'
    }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Title */}
      <h1 className="text-2xl md:text-3xl tracking-tight text-foreground leading-[1.3]" style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}>{product.title}</h1>

      {/* Price */}
      {displayPrice && (
        <div className="flex items-baseline gap-3">
          <p className="text-2xl text-foreground" style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}>{displayPrice}</p>
          <span className="text-[10px] text-muted-foreground border border-border/40 px-2.5 py-0.5 tracking-widest font-light" style={{ borderRadius: '1px' }}>/ {(product as any).unit || 'kg'}</span>
        </div>
      )}

      {/* Zen separator */}
      <div style={{ width: '32px', height: '1px', background: 'linear-gradient(to right, var(--kincha), transparent)' }} />

      {/* Product attributes */}
      <div className="grid grid-cols-2 gap-3 py-2">
        {product.origin && (
          <div className="flex items-center gap-3 border border-border/30 px-4 py-3 transition-all duration-400 hover:border-border/50" style={{ borderRadius: '2px' }}>
            <span className="zen-kanji text-sm" style={{ color: 'var(--matcha)', opacity: 0.35 }}>地</span>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] mb-0.5 font-light">Xuất xứ</p>
              <p className="text-sm text-foreground font-light line-clamp-1">{product.origin as string}</p>
            </div>
          </div>
        )}
        {product.weight && (
          <div className="flex items-center gap-3 border border-border/30 px-4 py-3 transition-all duration-400 hover:border-border/50" style={{ borderRadius: '2px' }}>
            <span className="zen-kanji text-sm" style={{ color: 'var(--matcha)', opacity: 0.35 }}>量</span>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] mb-0.5 font-light">Khối lượng</p>
              <p className="text-sm text-foreground font-light line-clamp-1">{product.weight as number} {(product as any).unit || 'kg'}</p>
            </div>
          </div>
        )}
        {(product as any).usageInfo && (
          <div className="flex items-center gap-3 border border-border/30 px-4 py-3 transition-all duration-400 hover:border-border/50" style={{ borderRadius: '2px' }}>
            <span className="zen-kanji text-sm" style={{ color: 'var(--matcha)', opacity: 0.35 }}>用</span>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] mb-0.5 font-light">Sử dụng</p>
              <p className="text-sm text-foreground font-light line-clamp-1">{(product as any).usageInfo as string}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 border border-border/30 px-4 py-3 transition-all duration-400 hover:border-border/50" style={{ borderRadius: '2px' }}>
          <span className="zen-kanji text-sm" style={{ color: 'var(--matcha)', opacity: 0.35 }}>優</span>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] mb-0.5 font-light">Chất lượng</p>
            <p className="text-sm font-light line-clamp-1" style={{ color: 'var(--matcha)' }}>Khuyên dùng</p>
          </div>
        </div>
      </div>

      {/* Short description */}
      {product.description && (
        <div className="text-muted-foreground text-sm leading-[1.9] pl-4 py-1 font-light" style={{ borderLeft: '1px solid var(--kincha)', borderLeftWidth: '1px', opacity: 0.8 }}>
          <RichText data={product.description} enableGutter={false} />
        </div>
      )}

      <div className="h-px" style={{ background: 'linear-gradient(to right, var(--border), transparent)' }} />

      {/* Variants */}
      {hasVariants && (
        <>
          <Suspense fallback={null}>
            <VariantSelector product={product} />
          </Suspense>
          <div className="h-px" style={{ background: 'linear-gradient(to right, var(--border), transparent)' }} />
        </>
      )}

      {/* Stock */}
      <Suspense fallback={null}>
        <StockIndicator product={product} />
      </Suspense>

      {/* Add to cart */}
      <Suspense fallback={null}>
        <AddToCart product={product} />
      </Suspense>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-2 border-t border-border/30 text-[10px] text-muted-foreground/60 uppercase tracking-[0.15em] font-light">
        <span className="flex items-center gap-2 hover:text-foreground/60 transition-colors duration-400 cursor-default">
          <span className="zen-kanji text-xs" style={{ color: 'var(--matcha)', opacity: 0.3 }}>本</span>
          Hàng chính hãng
        </span>
        <span className="flex items-center gap-2 hover:text-foreground/60 transition-colors duration-400 cursor-default">
          <span className="zen-kanji text-xs" style={{ color: 'var(--matcha)', opacity: 0.3 }}>速</span>
          Giao hàng nhanh
        </span>
        <span className="flex items-center gap-2 hover:text-foreground/60 transition-colors duration-400 cursor-default">
          <span className="zen-kanji text-xs" style={{ color: 'var(--matcha)', opacity: 0.3 }}>返</span>
          Đổi trả 7 ngày
        </span>
      </div>
    </div>
  )
}
