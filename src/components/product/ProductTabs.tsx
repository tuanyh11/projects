'use client'

import { RichText } from '@/components/RichText';
import { useAuth } from '@/providers/Auth';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

export function ProductTabs({ product, reviews }: { product: any; reviews: any[] }) {
    const router = useRouter()
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<'desc' | 'nutri' | 'review'>('desc')

    // For submitting review
    const [rating, setRating] = useState(5)
    const [hoveredStar, setHoveredStar] = useState<number | null>(null)
    const [comment, setComment] = useState('')
    const [isPending, startTransition] = useTransition()

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!comment.trim()) return toast.error('Vui lòng nhập nội dung đánh giá.')

        const reviewName = user?.name || user?.email || 'Khách hàng ẩn danh'

        startTransition(async () => {
            try {
                const res = await axios.post('/api/reviews', { product: product.id, name: reviewName, rating, comment }, {
                    headers: { 'Content-Type': 'application/json' },
                });

                if (res.status >= 200 && res.status < 300) {
                    toast.success('Gửi đánh giá thành công! Cảm ơn bạn.')
                    setComment('')
                    setRating(5)
                    router.refresh()
                } else {
                    toast.error('Có lỗi xảy ra khi gửi đánh giá.')
                }
            } catch (err) {
                toast.error('Lỗi kết nối máy chủ.')
            }
        })
    }

    const tabs = [
        { key: 'desc' as const, label: 'Mô tả', kanji: '述' },
        { key: 'nutri' as const, label: 'Chi tiết', kanji: '詳' },
        { key: 'review' as const, label: `Đánh giá (${reviews?.length || 0})`, kanji: '評' },
    ]

    const avgRating = reviews?.length ? (reviews.reduce((acc, rev) => acc + (rev.rating || 5), 0) / reviews.length).toFixed(1) : '0.0'

    return (
        <div className="w-full py-8">
            {/* ═══ Tab navigation — Zen ink brush style ═══ */}
            <div className="flex items-end gap-0 mb-8">
                {tabs.map((tab, i) => {
                    const isActive = activeTab === tab.key
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`relative flex items-center gap-2.5 px-6 py-3.5 text-sm transition-all duration-500 tracking-wide cursor-pointer
                                ${isActive
                                    ? 'text-foreground'
                                    : 'text-muted-foreground/50 hover:text-muted-foreground/80'
                                }`}
                            style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
                        >
                            {/* Kanji accent */}
                            <span
                                className="zen-kanji text-xs transition-opacity duration-500"
                                style={{
                                    color: isActive ? 'var(--matcha)' : 'var(--muted-foreground)',
                                    opacity: isActive ? 0.5 : 0.15,
                                }}
                            >
                                {tab.kanji}
                            </span>

                            <span>{tab.label}</span>

                            {/* Active indicator — sumi ink line */}
                            <div
                                className="absolute bottom-0 left-4 right-4 h-px transition-all duration-600"
                                style={{
                                    background: isActive
                                        ? 'linear-gradient(to right, var(--matcha), transparent)'
                                        : 'transparent',
                                    opacity: isActive ? 0.6 : 0,
                                }}
                            />
                        </button>
                    )
                })}

                {/* Fading line extending to right */}
                <div className="flex-1 self-end mb-0">
                    <div className="h-px" style={{ background: 'linear-gradient(to right, var(--border), transparent)' }} />
                </div>
            </div>

            {/* ═══ Tab content — Zen style ═══ */}
            <div
                className="border border-border/20 px-6 py-8 md:px-10 md:py-10"
                style={{
                    borderRadius: '2px',
                    background: 'var(--washi)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
                }}
            >
                {/* ── Mô tả ── */}
                {activeTab === 'desc' && (
                    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/75 prose-p:leading-[1.9] prose-p:font-light">
                        {product.description ? (
                            <RichText data={product.description} enableGutter={false} />
                        ) : (
                            <ZenEmptyState kanji="文" message="Chưa có mô tả chi tiết cho sản phẩm này." />
                        )}
                    </div>
                )}

                {/* ── Chi tiết ── */}
                {activeTab === 'nutri' && (
                    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/75 prose-p:leading-[1.9] prose-p:font-light">
                        {(product as any).detailInfo ? (
                            <RichText data={(product as any).detailInfo} enableGutter={false} />
                        ) : (
                            <ZenEmptyState kanji="詳" message="Thông tin chi tiết đang được cập nhật." />
                        )}
                    </div>
                )}

                {/* ── Đánh giá ── */}
                {activeTab === 'review' && (
                    <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
                        {/* Reviews list */}
                        <div className="w-full lg:w-[55%]">
                            {/* Header */}
                            <div className="flex items-end justify-between mb-8 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
                                <div>
                                    <div className="flex items-center gap-2.5 mb-1">
                                        <span className="zen-kanji text-sm" style={{ color: 'var(--matcha)', opacity: 0.35 }}>声</span>
                                        <h4
                                            className="text-lg text-foreground tracking-wide"
                                            style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
                                        >
                                            Đánh giá từ khách hàng
                                        </h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground/50 font-light tracking-wide">Trải nghiệm thực tế từ người dùng</p>
                                </div>
                                {reviews.length > 0 && (
                                    <div className="text-right flex items-center gap-3">
                                        <span
                                            className="text-3xl text-foreground leading-none"
                                            style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
                                        >
                                            {avgRating}
                                        </span>
                                        <div className="flex flex-col items-start gap-1">
                                            <div className="flex gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <svg
                                                        key={i}
                                                        className={`w-3.5 h-3.5 ${i < Math.round(Number(avgRating)) ? 'fill-current' : 'fill-muted-foreground/15'}`}
                                                        style={{ color: i < Math.round(Number(avgRating)) ? 'var(--kincha)' : undefined }}
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground/40 tracking-widest font-light">{reviews.length} đánh giá</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Reviews */}
                            {reviews && reviews.length > 0 ? (
                                <div className="space-y-5">
                                    {reviews.map((rev: any, idx: number) => {
                                        const initials = rev.name ? rev.name.charAt(0).toUpperCase() : 'K'
                                        return (
                                            <div
                                                key={idx}
                                                className="border border-border/25 px-5 py-5 transition-all duration-500 hover:border-border/40"
                                                style={{ borderRadius: '2px' }}
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    {/* Avatar — zen circle */}
                                                    <div
                                                        className="w-9 h-9 flex items-center justify-center text-sm font-light border border-border/30"
                                                        style={{
                                                            borderRadius: '50%',
                                                            color: 'var(--matcha)',
                                                            background: 'linear-gradient(135deg, rgba(107,122,94,0.08), rgba(107,122,94,0.02))',
                                                        }}
                                                    >
                                                        {initials}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-foreground font-light">{rev.name || 'Khách hàng ẩn danh'}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <div className="flex gap-px">
                                                                {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                                                                    <svg key={i} className="w-3 h-3 fill-current" style={{ color: 'var(--kincha)' }} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                                ))}
                                                            </div>
                                                            <span
                                                                className="text-[9px] tracking-wide font-light px-2 py-0.5 border border-border/30"
                                                                style={{ borderRadius: '1px', color: 'var(--matcha)' }}
                                                            >
                                                                Đã mua
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground/35 font-light tracking-wide">
                                                        {new Date(rev.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-foreground/70 leading-[1.8] font-light pl-12">{rev.comment}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <ZenEmptyState kanji="声" message="Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nhận." />
                            )}
                        </div>

                        {/* Review form */}
                        <div className="w-full lg:w-[45%]">
                            <div
                                className="lg:sticky lg:top-28 border border-border/25 px-6 py-7"
                                style={{
                                    borderRadius: '2px',
                                    background: 'color-mix(in srgb, var(--background) 85%, var(--foreground) 5%)',
                                }}
                            >
                                {/* Form header */}
                                <div className="flex items-center gap-2.5 mb-1">
                                    <span className="zen-kanji text-sm" style={{ color: 'var(--matcha)', opacity: 0.35 }}>筆</span>
                                    <h4
                                        className="text-base text-foreground tracking-wide"
                                        style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
                                    >
                                        Để lại đánh giá
                                    </h4>
                                </div>
                                <p className="text-xs text-muted-foreground/45 font-light tracking-wide mb-6">
                                    Chia sẻ trải nghiệm của bạn để giúp người mua khác.
                                </p>

                                <form onSubmit={handleSubmitReview} className="space-y-5">
                                    {/* Rating */}
                                    <div>
                                        <label className="block text-xs text-muted-foreground/60 uppercase tracking-[0.12em] font-light mb-3">Chất lượng</label>
                                        <div className="flex gap-1.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    onMouseEnter={() => setHoveredStar(star)}
                                                    onMouseLeave={() => setHoveredStar(null)}
                                                    className="focus:outline-none transition-transform duration-300 hover:scale-110 cursor-pointer"
                                                >
                                                    <svg
                                                        className={`w-7 h-7 transition-colors duration-300 ${(hoveredStar !== null ? star <= hoveredStar : star <= rating)
                                                            ? 'fill-current'
                                                            : 'fill-muted-foreground/10'
                                                            }`}
                                                        style={{
                                                            color: (hoveredStar !== null ? star <= hoveredStar : star <= rating)
                                                                ? 'var(--kincha)'
                                                                : undefined,
                                                        }}
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    <div>
                                        <label htmlFor="comment" className="block text-xs text-muted-foreground/60 uppercase tracking-[0.12em] font-light mb-3">Cảm nhận</label>
                                        <textarea
                                            id="comment"
                                            rows={4}
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Sản phẩm rất tốt, hương vị đậm đà..."
                                            className="w-full resize-none border border-border/30 bg-background px-4 py-3 text-sm font-light text-foreground
                                                focus:outline-none focus:border-foreground/20 transition-all duration-500
                                                placeholder:text-muted-foreground/35 tracking-wide"
                                            style={{ borderRadius: '2px' }}
                                            disabled={isPending}
                                        />
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="btn-zen w-full py-3.5 text-sm font-light tracking-widest uppercase transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                                    >
                                        {isPending ? (
                                            <span
                                                className="w-4 h-4 border border-white/30 border-t-white animate-spin"
                                                style={{ borderRadius: '50%' }}
                                            />
                                        ) : (
                                            'Gửi đánh giá'
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ═══ Zen Empty State ═══
function ZenEmptyState({ kanji, message }: { kanji: string; message: string }) {
    return (
        <div className="text-center py-14 flex flex-col items-center gap-4">
            <div
                className="w-16 h-16 flex items-center justify-center border border-border/20"
                style={{ borderRadius: '50%' }}
            >
                <span className="zen-kanji text-2xl" style={{ color: 'var(--matcha)', opacity: 0.2 }}>{kanji}</span>
            </div>
            <p className="text-sm text-muted-foreground/50 font-light tracking-wide max-w-xs">{message}</p>
        </div>
    )
}
