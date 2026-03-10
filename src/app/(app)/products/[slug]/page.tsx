import type { Media, Product } from '@/payload-types'

import { Gallery } from '@/components/product/Gallery'
import { ProductDescription } from '@/components/product/ProductDescription'
import { ProductTabs } from '@/components/product/ProductTabs'
import configPromise from '@payload-config'
import { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'

type Args = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })
  if (!product) return notFound()

  const gallery = product.gallery?.filter((item) => typeof item.image === 'object') || []
  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const canIndex = product._status === 'published'
  const seoImage = metaImage || (gallery.length ? (gallery[0]?.image as Media) : undefined)

  return {
    description: product.meta?.description || '',
    openGraph: seoImage?.url
      ? { images: [{ alt: seoImage?.alt, height: seoImage.height!, url: seoImage?.url, width: seoImage.width! }] }
      : null,
    robots: { follow: canIndex, googleBot: { follow: canIndex, index: canIndex }, index: canIndex },
    title: product.meta?.title || product.title,
  }
}

export default async function ProductPage({ params }: Args) {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })
  if (!product) return notFound()

  const gallery =
    product.gallery
      ?.filter((item) => typeof item.image === 'object')
      .map((item) => ({ ...item, image: item.image as Media })) || []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined

  const productJsonLd = {
    name: product.title,
    '@context': 'https://schema.org',
    '@type': 'Product',
    description: product.description,
    image: metaImage?.url,
    offers: {
      '@type': 'AggregateOffer',
      availability: 'https://schema.org/InStock',
      price: product.priceInVND,
      priceCurrency: 'VND',
    },
  }

  const relatedProducts =
    product.relatedProducts?.filter((p) => typeof p === 'object') ?? []

  const payload = await getPayload({ config: configPromise })
  const reviewsData = await payload.find({
    collection: 'reviews',
    where: { product: { equals: product.id } },
  })
  const reviews = reviewsData.docs || []

  return (
    <React.Fragment>
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} type="application/ld+json" />

      {/* ═══ Breadcrumb — Zen ═══ */}
      <div className="border-b border-border/20 pt-24" style={{ backgroundColor: 'var(--washi)' }}>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors duration-400 font-light text-xs tracking-wide">Trang chủ</Link>
            <span className="text-border/50 text-xs">·</span>
            <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors duration-400 font-light text-xs tracking-wide">Đặc sản</Link>
            <span className="text-border/50 text-xs">·</span>
            <span className="text-foreground/70 font-light truncate max-w-[200px] text-xs tracking-wide">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* ═══ Main: Info Left + Gallery Grid Right ═══ */}
      <div style={{ backgroundColor: 'var(--washi)' }}>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

            {/* ═══ LEFT — Gallery Grid (58%) ═══ */}
            <div className="w-full lg:w-[58%]">
              <Suspense fallback={
                <div className="grid grid-cols-5 grid-rows-2 gap-2" style={{ height: 'clamp(400px, 50vh, 600px)' }}>
                  <div className="col-span-3 row-span-2 animate-pulse" style={{ borderRadius: '2px', background: 'var(--muted)' }} />
                  <div className="col-span-2 animate-pulse" style={{ borderRadius: '2px', background: 'var(--muted)', opacity: 0.7 }} />
                  <div className="col-span-2 animate-pulse" style={{ borderRadius: '2px', background: 'var(--muted)', opacity: 0.5 }} />
                </div>
              }>
                {gallery.length > 0 ? (
                  <Gallery gallery={gallery} />
                ) : (
                  <div
                    className="flex items-center justify-center relative overflow-hidden border border-border/20"
                    style={{
                      height: 'clamp(400px, 50vh, 600px)',
                      borderRadius: '2px',
                      background: 'linear-gradient(135deg, #f6f4ef, #faf8f3)',
                    }}
                  >
                    <span className="zen-kanji text-8xl" style={{ color: 'var(--matcha)', opacity: 0.06 }}>茶</span>
                    <div className="absolute top-4 left-4">
                      <div className="w-6 h-px" style={{ background: 'var(--matcha)', opacity: 0.15 }} />
                      <div className="w-px h-6" style={{ background: 'var(--matcha)', opacity: 0.15 }} />
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <div className="w-6 h-px ml-auto" style={{ background: 'var(--matcha)', opacity: 0.15 }} />
                      <div className="w-px h-6 ml-auto" style={{ background: 'var(--matcha)', opacity: 0.15 }} />
                    </div>
                  </div>
                )}
              </Suspense>
            </div>

            {/* ═══ RIGHT — Product Info (sticky) ═══ */}
            <div className="w-full lg:w-[42%]">
              <div className="lg:sticky lg:top-24">
                <ProductDescription product={product} />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <div className="border-t border-border/15" style={{ backgroundColor: 'var(--yuki)' }}>
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <ProductTabs product={product} reviews={reviews} />
        </div>
      </div>

      {/* ═══ Related Products — Zen ═══ */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-border/20" style={{ backgroundColor: 'var(--washi)' }}>
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <div className="flex items-center gap-4 mb-10">
              <span className="zen-kanji text-lg" style={{ color: 'var(--matcha)', opacity: 0.3 }}>薦</span>
              <h2 className="text-xl font-light text-foreground tracking-wide" style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}>Có thể bạn sẽ thích</h2>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, var(--border), transparent)' }} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {(relatedProducts as Product[]).map((rp) => {
                const img = rp.gallery?.[0]?.image
                return (
                  <Link
                    key={rp.id}
                    href={`/products/${rp.slug}`}
                    className="group product-card-zen flex flex-col"
                  >
                    <div className="aspect-square relative flex items-center justify-center overflow-hidden bg-muted/30" style={{ borderRadius: '2px' }}>
                      {img && typeof img === 'object' ? (
                        <Image src={img.url!} alt={rp.title} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" className="object-cover group-hover:scale-[1.04] transition-transform duration-[900ms] ease-out" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center pattern-seigaiha">
                          <span className="zen-kanji text-3xl" style={{ color: 'var(--matcha)', opacity: 0.15 }}>茶</span>
                        </div>
                      )}
                    </div>
                    <div className="py-3 flex flex-col flex-grow">
                      <p className="text-sm font-light text-foreground/75 line-clamp-2 group-hover:text-foreground transition-colors duration-400 tracking-wide">{rp.title}</p>
                      <div className="mt-auto pt-2 flex items-center justify-between">
                        <p className="text-foreground font-light" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                          {new Intl.NumberFormat('vi-VN').format(rp.priceInVND || 0)}₫
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  )
}

const queryProductBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    depth: 3,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        { slug: { equals: slug } },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
    populate: {
      variants: { title: true, priceInVND: true, inventory: true, options: true },
    },
  })

  return result.docs?.[0] || null
}
