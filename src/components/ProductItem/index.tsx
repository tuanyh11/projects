import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Product, Variant } from '@/payload-types'
import Link from 'next/link'

type Props = {
  product: Product
  style?: 'compact' | 'default'
  variant?: Variant
  quantity?: number
  currencyCode?: string
}

export const ProductItem: React.FC<Props> = ({
  product,
  style = 'default',
  quantity,
  variant,
  currencyCode,
}) => {
  const { title } = product

  const metaImage =
    product.meta?.image && typeof product.meta?.image !== 'string' ? product.meta.image : undefined

  const firstGalleryImage =
    typeof product.gallery?.[0]?.image !== 'string' ? product.gallery?.[0]?.image : undefined

  let image = firstGalleryImage || metaImage

  const isVariant = Boolean(variant) && typeof variant === 'object'

  if (isVariant) {
    const imageVariant = product.gallery?.find((item) => {
      if (!item.variantOption) return false
      const variantOptionID =
        typeof item.variantOption === 'object' ? item.variantOption.id : item.variantOption

      const hasMatch = variant?.options?.some((option) => {
        if (typeof option === 'object') return option.id === variantOptionID
        else return option === variantOptionID
      })

      return hasMatch
    })

    if (imageVariant && typeof imageVariant.image !== 'string') {
      image = imageVariant.image
    }
  }

  const itemPrice = variant?.priceInVND || product.priceInVND
  const itemURL = `/products/${product.slug}${variant ? `?variant=${variant.id}` : ''}`

  return (
    <div
      className="flex items-center gap-4 py-4 border-b border-border/15 last:border-b-0 transition-colors duration-500 group"
    >
      {/* Product image — zen frame */}
      <Link
        href={itemURL}
        className="shrink-0 w-16 h-16 overflow-hidden border border-border/20 relative"
        style={{ borderRadius: '2px' }}
      >
        {image && typeof image !== 'string' ? (
          <Media
            className="w-full h-full"
            imgClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            resource={image}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
            <span className="zen-kanji text-lg" style={{ color: 'var(--matcha)', opacity: 0.1 }}>品</span>
          </div>
        )}
      </Link>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <Link
          href={itemURL}
          className="text-sm font-light text-foreground/90 hover:text-foreground transition-colors duration-400 tracking-wide line-clamp-1"
          style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
        >
          {title}
        </Link>
        {variant && (
          <p className="text-[10px] text-muted-foreground/55 tracking-widest font-light mt-0.5">
            {variant.options
              ?.map((option) => {
                if (typeof option === 'object') return option.label
                return null
              })
              .join(', ')}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground/55 font-light tracking-wide mt-1">
          Số lượng: {quantity}
        </p>
      </div>

      {/* Subtotal */}
      {itemPrice && quantity && (
        <div className="text-right shrink-0">
          <div
            className="text-sm font-light text-foreground/85"
            style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
          >
            <Price
              amount={itemPrice * quantity}
              currencyCode={currencyCode}
            />
          </div>
        </div>
      )}
    </div>
  )
}
