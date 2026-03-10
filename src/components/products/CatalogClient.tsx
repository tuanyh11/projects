'use client'

import { useAuth } from '@/providers/Auth'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ProductFilters } from './ProductFilters'
import { ProductSort } from './ProductSort'

export const CatalogClient: React.FC<{
    allProducts: any[]
    categoriesList: any[]
    globalMinPrice: number
    globalMaxPrice: number
    initialSearchQuery?: string
    initialCategory?: string
    initialMinPrice?: number
    initialMaxPrice?: number
    initialSortValue?: string
    initialPage?: number
}> = ({ allProducts, categoriesList, globalMinPrice, globalMaxPrice, initialSearchQuery, initialCategory, initialMinPrice, initialMaxPrice, initialSortValue, initialPage }) => {
    const ITEMS_PER_PAGE = 9

    const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '')
    const [category, setCategory] = useState<string | null>(initialCategory || null)
    const [minPrice, setMinPrice] = useState(initialMinPrice ?? globalMinPrice)
    const [maxPrice, setMaxPrice] = useState(initialMaxPrice ?? globalMaxPrice)
    const [sortValue, setSortValue] = useState(initialSortValue || 'newest')
    const [currentPage, setCurrentPage] = useState(initialPage && initialPage > 0 ? initialPage : 1)

    const { addItem } = useCart()
    const { user } = useAuth()
    const router = useRouter()
    const [addingProdId, setAddingProdId] = useState<string | null>(null)

    const filteredAndSortedProducts = useMemo(() => {
        let result = [...allProducts]

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(p => p.title?.toLowerCase().includes(query))
        }

        if (category) {
            result = result.filter(p => p.categories?.some((c: any) => c.slug === category))
        }

        result = result.filter(p => {
            const price = p.priceInVND || 0
            return price >= minPrice && price <= maxPrice
        })

        result.sort((a, b) => {
            if (sortValue === 'price-asc') {
                return (a.priceInVND || 0) - (b.priceInVND || 0)
            } else if (sortValue === 'price-desc') {
                return (b.priceInVND || 0) - (a.priceInVND || 0)
            } else {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }
        })

        return result
    }, [allProducts, searchQuery, category, minPrice, maxPrice, sortValue])

    const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE)

    const paginatedProducts = useMemo(() => {
        let page = currentPage
        if (page > totalPages && totalPages > 0) {
            page = totalPages
            setCurrentPage(page)
        }
        return filteredAndSortedProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
    }, [filteredAndSortedProducts, currentPage, totalPages])

    return (
        <div className="container max-w-6xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-10">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 flex-none">
                <ProductFilters
                    categoriesList={categoriesList}
                    currentCategory={category || undefined}
                    currentSearch={searchQuery}
                    globalMinPrice={globalMinPrice}
                    globalMaxPrice={globalMaxPrice}
                    currentMinPrice={minPrice}
                    currentMaxPrice={maxPrice}
                    onUpdateFilters={(updates) => {
                        let updated = false
                        if (updates.q !== undefined) {
                            setSearchQuery(updates.q || '')
                            updated = true
                        }
                        if (updates.category !== undefined) {
                            setCategory(updates.category)
                            updated = true
                        }
                        if (updates.minPrice !== undefined) {
                            setMinPrice(Number(updates.minPrice))
                            updated = true
                        }
                        if (updates.maxPrice !== undefined) {
                            setMaxPrice(Number(updates.maxPrice))
                            updated = true
                        }

                        if (updated) {
                            const newUrl = new URL(window.location.href)
                            if (updates.q) newUrl.searchParams.set('q', updates.q)
                            else if (updates.q === null) newUrl.searchParams.delete('q')

                            if (updates.category) newUrl.searchParams.set('category', updates.category)
                            else if (updates.category === null) newUrl.searchParams.delete('category')

                            if (updates.minPrice) newUrl.searchParams.set('minPrice', updates.minPrice)
                            if (updates.maxPrice) newUrl.searchParams.set('maxPrice', updates.maxPrice)

                            setCurrentPage(1)
                            newUrl.searchParams.delete('page')

                            window.history.replaceState({}, '', newUrl)
                        }
                    }}
                />
            </aside>

            {/* Main */}
            <main className="flex-1 min-w-0">
                {/* Toolbar */}
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-border/30">
                    <p className="text-sm text-muted-foreground flex items-center gap-3 font-light">
                        <span className="zen-kanji text-xs" style={{ color: 'var(--matcha)', opacity: 0.3 }}>数</span>
                        <span className="text-foreground/70 font-light">{filteredAndSortedProducts.length}</span> sản phẩm
                    </p>
                    <ProductSort currentSort={sortValue} onUpdateSort={(sort) => {
                        setSortValue(sort)
                        const newUrl = new URL(window.location.href)
                        if (sort && sort !== 'newest') newUrl.searchParams.set('sort', sort)
                        else newUrl.searchParams.delete('sort')

                        setCurrentPage(1)
                        newUrl.searchParams.delete('page')

                        window.history.replaceState({}, '', newUrl)
                    }} />
                </div>

                {filteredAndSortedProducts.length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-border/30 pattern-shoji" style={{ borderRadius: '2px' }}>
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-5" style={{ opacity: 0.12 }}>
                            <path d="M24 4 C35,4 44,12 44,24 C44,35 36,44 24,44 C12,44 4,36 5,24 C6,14 14,6 22,4.5"
                                stroke="var(--matcha)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                        </svg>
                        <p className="text-foreground/60 text-base mb-1 font-light" style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}>Không tìm thấy sản phẩm</p>
                        <p className="text-muted-foreground text-sm font-light">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                    </div>
                ) : (
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {paginatedProducts.map((prod: any) => (
                                <Link href={`/products/${prod.slug}`} key={prod.id} className="group product-card-zen flex flex-col">
                                    <div className="aspect-4/5 relative overflow-hidden bg-muted/20" style={{ borderRadius: '2px' }}>
                                        {prod.gallery && prod.gallery[0]?.image && typeof prod.gallery[0].image === 'object' ? (
                                            <Image src={prod.gallery[0].image.url} alt={prod.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover group-hover:scale-[1.04] transition-transform duration-[900ms] ease-out" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center pattern-seigaiha">
                                                <span className="zen-kanji text-4xl" style={{ color: 'var(--matcha)', opacity: 0.1 }}>茶</span>
                                            </div>
                                        )}
                                        {prod.categories && prod.categories[0] && typeof prod.categories[0] === 'object' && (
                                            <span className="absolute top-3 left-3 bg-card/80 backdrop-blur-sm text-[9px] font-light px-3 py-1.5 text-foreground/60 tracking-widest uppercase" style={{ borderRadius: '1px' }}>
                                                {prod.categories[0].title}
                                            </span>
                                        )}
                                        <button
                                            disabled={addingProdId === prod.id || prod.inventory === 0}
                                            onClick={async (e) => {
                                                e.preventDefault()
                                                if (!user) {
                                                    toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.')
                                                    router.push(`/login?redirect=/products`)
                                                    return
                                                }
                                                setAddingProdId(prod.id)
                                                try {
                                                    await addItem({
                                                        product: prod.id,
                                                    }, 1)
                                                    toast.success('Đã thêm vào giỏ hàng')
                                                } catch (err: any) {
                                                    toast.error('Có lỗi xảy ra, có thể sản phẩm đã vượt quá số lượng trong kho.')
                                                } finally {
                                                    setAddingProdId(null)
                                                }
                                            }}
                                            className="absolute bottom-3 right-3 w-9 h-9 flex items-center justify-center text-foreground/40 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-400 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed border border-border/30 bg-card/80 backdrop-blur-sm"
                                            style={{ borderRadius: '1px' }}
                                        >
                                            {addingProdId === prod.id ? (
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : prod.inventory === 0 ? (
                                                <span className="text-[8px] uppercase font-light text-center leading-none tracking-wider" style={{ color: 'var(--kincha)' }}>Hết</span>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    <div className="py-4 flex flex-col grow">
                                        <h3 className="text-sm font-light text-foreground/75 mb-1 group-hover:text-foreground transition-colors duration-400 line-clamp-2 tracking-wide">{prod.title}</h3>
                                        <p className="text-[10px] text-muted-foreground/50 mb-3 flex items-center gap-2 font-light tracking-widest">
                                            {prod.weight ? `${prod.weight}kg` : '1kg'} · {prod.origin || 'Việt Nam'}
                                        </p>
                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="text-foreground font-light" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.priceInVND || 150000)}
                                            </span>
                                            <span className="text-[9px] text-muted-foreground/40 border border-border/30 px-2 py-0.5 tracking-widest font-light" style={{ borderRadius: '1px' }}>/ {(prod as any).unit || 'kg'}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination Controls — Zen */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-6 mt-14 py-4">
                                <button
                                    className="text-[11px] font-light tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors duration-400 disabled:opacity-20 disabled:pointer-events-none uppercase"
                                    disabled={currentPage === 1}
                                    onClick={() => {
                                        const newPage = Math.max(1, currentPage - 1)
                                        setCurrentPage(newPage)
                                        const newUrl = new URL(window.location.href)
                                        newUrl.searchParams.set('page', String(newPage))
                                        window.history.replaceState({}, '', newUrl)
                                        window.scrollTo({ top: 300, behavior: 'smooth' })
                                    }}
                                >
                                    ← Trước
                                </button>

                                <div className="flex items-center gap-2 text-[11px] font-light text-muted-foreground/50 tracking-widest">
                                    <span className="text-foreground/60 px-2 py-0.5 border border-border/30" style={{ borderRadius: '1px' }}>{currentPage}</span>
                                    <span>·</span>
                                    <span>{totalPages}</span>
                                </div>

                                <button
                                    className="text-[11px] font-light tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors duration-400 disabled:opacity-20 disabled:pointer-events-none uppercase"
                                    disabled={currentPage === totalPages}
                                    onClick={() => {
                                        const newPage = Math.min(totalPages, currentPage + 1)
                                        setCurrentPage(newPage)
                                        const newUrl = new URL(window.location.href)
                                        newUrl.searchParams.set('page', String(newPage))
                                        window.history.replaceState({}, '', newUrl)
                                        window.scrollTo({ top: 300, behavior: 'smooth' })
                                    }}
                                >
                                    Sau →
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
