'use client'

import type { Product, Variant } from '@/payload-types'

import { useAuth } from '@/providers/Auth'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
type Props = {
  product: Product
}

export function AddToCart({ product }: Props) {
  const { addItem, cart, isLoading } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const variants = product.variants?.docs || []

  const selectedVariant = useMemo<Variant | undefined>(() => {
    if (product.enableVariants && variants.length) {
      const variantId = searchParams.get('variant')

      const validVariant = variants.find((variant) => {
        if (typeof variant === 'object') {
          return String(variant.id) === variantId
        }
        return String(variant) === variantId
      })

      if (validVariant && typeof validVariant === 'object') {
        return validVariant
      }
    }

    return undefined
  }, [product.enableVariants, searchParams, variants])

  const addToCart = useCallback(
    (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault()

      if (!user) {
        toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.')
        router.push(`/login?redirect=/products/${product.slug}`)
        return
      }

      addItem({
        product: product.id,
        variant: selectedVariant?.id ?? undefined,
      }).then(() => {
        toast.success('Đã thêm vào giỏ hàng!')
      })
    },
    [addItem, product, selectedVariant, user, router],
  )

  const disabled = useMemo<boolean>(() => {
    const existingItem = cart?.items?.find((item) => {
      const productID = typeof item.product === 'object' ? item.product?.id : item.product
      const variantID = item.variant
        ? typeof item.variant === 'object'
          ? item.variant?.id
          : item.variant
        : undefined

      if (productID === product.id) {
        if (product.enableVariants) {
          return variantID === selectedVariant?.id
        }
        return true
      }
    })

    if (existingItem) {
      const existingQuantity = existingItem.quantity

      if (product.enableVariants) {
        return existingQuantity >= (selectedVariant?.inventory || 0)
      }
      return existingQuantity >= (product.inventory || 0)
    }

    if (product.enableVariants) {
      if (!selectedVariant) {
        return true
      }

      if (selectedVariant.inventory === 0) {
        return true
      }
    } else {
      if (product.inventory === 0) {
        return true
      }
    }

    return false
  }, [selectedVariant, cart?.items, product])

  const isOutOfStock =
    (product.enableVariants && selectedVariant && selectedVariant.inventory === 0) ||
    (!product.enableVariants && product.inventory === 0)

  const label = isOutOfStock
    ? 'Hết hàng'
    : disabled
      ? 'Đã đạt giới hạn'
      : 'Thêm vào giỏ'

  return (
    <button
      aria-label="Add to cart"
      disabled={disabled || isLoading}
      onClick={(e) => {
        addToCart(e)
      }}
      type="button"
      className="btn-zen relative w-full sm:w-auto transition-all duration-500 disabled:opacity-40 disabled:pointer-events-none"
      style={{
        background: disabled ? 'var(--muted)' : 'var(--matcha)',
        color: disabled ? 'var(--muted-foreground)' : 'var(--washi)',
        padding: '14px 32px',
        borderRadius: '2px',
        fontSize: '13px',
        fontFamily: "'Noto Serif JP', serif",
        fontWeight: 300,
        letterSpacing: '0.1em',
        border: 'none',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  )
}
