'use client'

import React, { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'

export const ProductFilters: React.FC<{
    categoriesList: any[]
    currentCategory?: string
    currentSearch?: string
    currentSort?: string
    globalMinPrice: number
    globalMaxPrice: number
    currentMinPrice: number
    currentMaxPrice: number
    onUpdateFilters?: (updates: Record<string, string | null>) => void
}> = ({
    categoriesList,
    currentCategory,
    currentSearch,
    globalMinPrice,
    globalMaxPrice,
    currentMinPrice,
    currentMaxPrice,
    onUpdateFilters
}) => {
        const { register, watch, setValue } = useForm({
            defaultValues: {
                searchQuery: currentSearch || '',
                minPrice: currentMinPrice,
                maxPrice: currentMaxPrice
            }
        })

        const searchQuery = watch('searchQuery')
        const minPrice = watch('minPrice')
        const maxPrice = watch('maxPrice')

        useEffect(() => {
            setValue('minPrice', currentMinPrice)
            setValue('maxPrice', currentMaxPrice)
        }, [currentMinPrice, currentMaxPrice, setValue])

        const updateFilters = useCallback((updates: Record<string, string | null>) => {
            if (onUpdateFilters) {
                onUpdateFilters(updates)
            }
        }, [onUpdateFilters])

        useEffect(() => {
            const timer = setTimeout(() => {
                if (searchQuery !== (currentSearch || '')) {
                    updateFilters({ q: searchQuery })
                }
            }, 500)
            return () => clearTimeout(timer)
        }, [searchQuery, currentSearch, updateFilters])

        const formatPrice = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + 'đ'

        // Calculate percentage for progress bar
        const minPercent = ((minPrice - globalMinPrice) / (globalMaxPrice - globalMinPrice || 1)) * 100
        const maxPercent = ((maxPrice - globalMinPrice) / (globalMaxPrice - globalMinPrice || 1)) * 100

        return (
            <div className="sticky top-24 space-y-10">

                {/* ═══ Search — Zen ═══ */}
                <div>
                    <div className="flex items-center gap-2.5 mb-4">
                        <span className="zen-kanji text-xs" style={{ color: 'var(--matcha)', opacity: 0.35 }}>探</span>
                        <h3
                            className="text-xs text-foreground/75 uppercase tracking-[0.15em] font-light"
                            style={{ fontFamily: "'Noto Serif JP', serif" }}
                        >
                            Tìm kiếm
                        </h3>
                    </div>
                    <div className="relative">
                        <input
                            type="search"
                            placeholder="Tên sản phẩm..."
                            {...register('searchQuery')}
                            className="w-full border border-border/30 bg-transparent px-4 py-2.5 text-sm font-light tracking-wide
                                focus:outline-none focus:border-foreground/20 transition-all duration-500
                                placeholder:text-muted-foreground/30"
                            style={{ borderRadius: '2px', fontFamily: "'Noto Serif JP', serif" }}
                        />
                        {/* Search icon */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)', opacity: 0.3 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* ═══ Categories — Zen ═══ */}
                <div>
                    <div className="flex items-center gap-2.5 mb-4">
                        <span className="zen-kanji text-xs" style={{ color: 'var(--matcha)', opacity: 0.35 }}>類</span>
                        <h3
                            className="text-xs text-foreground/75 uppercase tracking-[0.15em] font-light"
                            style={{ fontFamily: "'Noto Serif JP', serif" }}
                        >
                            Danh mục
                        </h3>
                    </div>
                    <div className="space-y-0.5">
                        <button
                            onClick={() => updateFilters({ category: null })}
                            className="w-full text-left block px-3.5 py-2 text-sm font-light tracking-wide transition-all duration-500 cursor-pointer"
                            style={{
                                borderRadius: '2px',
                                fontFamily: "'Noto Serif JP', serif",
                                fontWeight: 300,
                                color: !currentCategory ? 'var(--matcha)' : 'var(--muted-foreground)',
                                opacity: !currentCategory ? 1 : 0.7,
                                background: !currentCategory ? 'rgba(107, 122, 94, 0.06)' : 'transparent',
                            }}
                        >
                            <span className="flex items-center gap-2.5">
                                <span
                                    className="w-1 h-1 shrink-0 transition-all duration-500"
                                    style={{
                                        borderRadius: '50%',
                                        background: !currentCategory ? 'var(--matcha)' : 'transparent',
                                    }}
                                />
                                Tất cả sản phẩm
                            </span>
                        </button>
                        {categoriesList.map((cat: any) => {
                            const isActive = currentCategory === cat.slug
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => updateFilters({ category: cat.slug })}
                                    className="w-full text-left block px-3.5 py-2 text-sm font-light tracking-wide transition-all duration-500 cursor-pointer"
                                    style={{
                                        borderRadius: '2px',
                                        fontFamily: "'Noto Serif JP', serif",
                                        fontWeight: 300,
                                        color: isActive ? 'var(--matcha)' : 'var(--muted-foreground)',
                                        opacity: isActive ? 1 : 0.7,
                                        background: isActive ? 'rgba(107, 122, 94, 0.06)' : 'transparent',
                                    }}
                                >
                                    <span className="flex items-center gap-2.5">
                                        <span
                                            className="w-1 h-1 shrink-0 transition-all duration-500"
                                            style={{
                                                borderRadius: '50%',
                                                background: isActive ? 'var(--matcha)' : 'transparent',
                                            }}
                                        />
                                        {cat.title}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* ═══ Zen separator ═══ */}
                <div style={{ width: '24px', height: '1px', background: 'linear-gradient(to right, var(--kincha), transparent)', opacity: 0.4 }} />

                {/* ═══ Price Slider — Zen ═══ */}
                <div>
                    <div className="flex items-center gap-2.5 mb-5">
                        <span className="zen-kanji text-xs" style={{ color: 'var(--matcha)', opacity: 0.35 }}>値</span>
                        <h3
                            className="text-xs text-foreground/75 uppercase tracking-[0.15em] font-light"
                            style={{ fontFamily: "'Noto Serif JP', serif" }}
                        >
                            Khoảng giá
                        </h3>
                    </div>

                    <div className="px-1">
                        {/* Custom range slider */}
                        <div className="relative h-[3px] mt-6 mb-5 rounded-full" style={{ background: 'color-mix(in srgb, var(--foreground) 20%, transparent)' }}>
                            {/* Active range indicator */}
                            <div
                                className="absolute h-full rounded-full transition-all duration-300"
                                style={{
                                    left: `${minPercent}%`,
                                    right: `${100 - maxPercent}%`,
                                    background: 'var(--matcha)',
                                }}
                            />

                            {/* Min thumb */}
                            <input
                                type="range"
                                min={globalMinPrice}
                                max={globalMaxPrice}
                                {...register('minPrice', {
                                    valueAsNumber: true,
                                    onChange: (e) => {
                                        const val = Math.min(Number(e.target.value), Number(maxPrice) - 10000);
                                        setValue('minPrice', val);
                                    }
                                })}
                                onMouseUp={() => updateFilters({ minPrice: String(minPrice), maxPrice: String(maxPrice) })}
                                onTouchEnd={() => updateFilters({ minPrice: String(minPrice), maxPrice: String(maxPrice) })}
                                className="absolute w-full -top-2.5 h-6 pointer-events-none bg-transparent!
                                    [&::-webkit-slider-thumb]:pointer-events-auto"
                            />

                            {/* Max thumb */}
                            <input
                                type="range"
                                min={globalMinPrice}
                                max={globalMaxPrice}
                                {...register('maxPrice', {
                                    valueAsNumber: true,
                                    onChange: (e) => {
                                        const val = Math.max(Number(e.target.value), Number(minPrice) + 10000);
                                        setValue('maxPrice', val);
                                    }
                                })}
                                onMouseUp={() => updateFilters({ minPrice: String(minPrice), maxPrice: String(maxPrice) })}
                                onTouchEnd={() => updateFilters({ minPrice: String(minPrice), maxPrice: String(maxPrice) })}
                                className="absolute w-full -top-2.5 h-6 pointer-events-none bg-transparent!
                                    [&::-webkit-slider-thumb]:pointer-events-auto"
                            />
                        </div>

                        {/* Price labels */}
                        <div className="flex items-center justify-between text-[11px] mt-3">
                            <span
                                className="px-2.5 py-1.5 border font-light tracking-wide"
                                style={{
                                    borderRadius: '2px',
                                    color: 'var(--foreground)',
                                    opacity: 0.85,
                                    fontFamily: "'Noto Serif JP', serif",
                                    borderColor: 'var(--border)',
                                    background: 'var(--card)',
                                }}
                            >
                                {formatPrice(minPrice)}
                            </span>
                            <span className="text-muted-foreground/40 text-[10px]">—</span>
                            <span
                                className="px-2.5 py-1.5 border font-light tracking-wide"
                                style={{
                                    borderRadius: '2px',
                                    color: 'var(--foreground)',
                                    opacity: 0.85,
                                    fontFamily: "'Noto Serif JP', serif",
                                    borderColor: 'var(--border)',
                                    background: 'var(--card)',
                                }}
                            >
                                {formatPrice(maxPrice)}
                            </span>
                        </div>
                    </div>
                </div>

            </div >
        )
    }
