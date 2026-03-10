import { CatalogClient } from '@/components/products/CatalogClient'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const metadata = {
    description: 'Khám phá bộ sưu tập đặc sản cao cấp từ vùng cao Na Hang.',
    title: 'Đặc sản Na Hang — Sản phẩm miền núi',
    alternates: {
        canonical: '/products',
    },
}

type SearchParams = { [key: string]: string | string[] | undefined }
type Props = { searchParams: Promise<SearchParams> }

export default async function ProductsPage({ searchParams }: Props) {
    const params = await searchParams
    const q = params.q as string | undefined
    const category = params.category as string | undefined
    const minPriceStr = params.minPrice as string | undefined
    const maxPriceStr = params.maxPrice as string | undefined
    const sort = params.sort as string | undefined
    const pageStr = params.page as string | undefined
    const payload = await getPayload({ config: configPromise })

    const lowestPriceProduct = await payload.find({ collection: 'products', sort: 'priceInVND', limit: 1 })
    const highestPriceProduct = await payload.find({ collection: 'products', sort: '-priceInVND', limit: 1 })

    const globalMinPrice = lowestPriceProduct.docs[0]?.priceInVND || 0
    const globalMaxPrice = highestPriceProduct.docs[0]?.priceInVND || 1000000

    const products = await payload.find({ collection: 'products', draft: false, overrideAccess: false, sort: '-createdAt', limit: 1000, where: { _status: { equals: 'published' } } })
    const categoriesList = await payload.find({ collection: 'categories', limit: 20 })

    return (
        <div className="min-h-screen bg-background">
            {/* ═══ ZEN PREMIUM HERO — Dark ═══ */}
            <div className="relative overflow-hidden pt-28 pb-16 zen-hero-dark">
                {/* Ambient glow orbs */}
                <div className="zen-orb-matcha" style={{ width: '600px', height: '500px', top: '-120px', left: '-100px', opacity: 0.35 }} />
                <div className="zen-orb-kincha" style={{ width: '400px', height: '350px', bottom: '-80px', right: '8%', opacity: 0.3 }} />

                {/* Shoji grid pattern */}
                <div className="absolute inset-0 pattern-shoji" style={{ opacity: 0.06 }} />

                {/* Kanji watermark */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden lg:block" style={{ opacity: 0.025 }}>
                    <span className="zen-kanji text-foreground" style={{ fontSize: '22rem', lineHeight: 1 }}>品</span>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, transparent, rgba(12,11,8,0.4))' }}
                />

                <div className="container max-w-6xl mx-auto px-4 relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-6 h-px" style={{ background: 'linear-gradient(90deg, rgba(212,184,128,0.6), transparent)' }} />
                        <p className="text-[10px] uppercase tracking-[0.35em] font-light" style={{ color: 'rgba(212,184,128,0.6)' }}>Đặc sản vùng cao · 名物</p>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-light mb-4 tracking-tight hero-title-accent"
                        style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300, color: 'rgba(232,228,219,0.92)' }}>
                        Sản phẩm <span style={{ color: 'rgba(212,184,128,0.75)' }}>miền núi</span>
                    </h1>
                    <p className="max-w-lg leading-[1.9] font-light text-sm" style={{ color: 'rgba(145,141,133,0.7)' }}>
                        Tinh hoa thiên nhiên từ núi rừng Đông Bắc — trà cổ thụ, mật ong rừng, gạo nương và nhiều đặc sản khác.
                    </p>

                    {/* Kanji tags — enhanced */}
                    <div className="flex flex-wrap gap-3 mt-8">
                        {[
                            { kanji: '茶', label: 'Trà Shan Tuyết' },
                            { kanji: '蜜', label: 'Mật ong rừng' },
                            { kanji: '米', label: 'Gạo nương' },
                            { kanji: '布', label: 'Thổ cẩm' },
                        ].map((tag, i) => (
                            <span key={i} className="inline-flex items-center gap-2 text-xs font-light px-4 py-2 tracking-wide zen-tag-kincha" style={{ borderRadius: '2px', color: 'rgba(232,228,219,0.45)' }}>
                                <span className="zen-kanji text-sm" style={{ color: 'rgba(212,184,128,0.6)' }}>{tag.kanji}</span>
                                {tag.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <CatalogClient
                allProducts={products.docs}
                categoriesList={categoriesList.docs}
                globalMinPrice={globalMinPrice}
                globalMaxPrice={globalMaxPrice}
                initialSearchQuery={q}
                initialCategory={category}
                initialMinPrice={minPriceStr ? Number(minPriceStr) : undefined}
                initialMaxPrice={maxPriceStr ? Number(maxPriceStr) : undefined}
                initialSortValue={sort}
                initialPage={pageStr ? Number(pageStr) : 1}
            />
        </div>
    )
}
