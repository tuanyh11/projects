import { HomeQuickAddButton } from '@/components/Cart/HomeQuickAddButton'
import { ContactForm } from '@/components/forms/ContactForm'
import { ScrollAnimations } from '@/components/ScrollAnimations'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'

const roomTypeLabels: Record<string, string> = {
    'nha-san': 'Nhà sàn truyền thống',
    'phong-rieng': 'Phòng riêng',
    'dorm': 'Giường tập thể (Dorm)',
    'bungalow': 'Bungalow',
    'camping': 'Lều trại (Camping)',
    'vip': 'Phòng VIP',
}

export default async function HomePage() {
    const payload = await getPayload({ config: configPromise })
    const [featuredProducts, destinationsData, roomsData, postsData, reviewsData, siteSettings] = await Promise.all([
        payload.find({ collection: 'products', limit: 8, sort: '-createdAt', where: { _status: { equals: 'published' } } }),
        payload.find({ collection: 'destinations' as any, limit: 20, sort: 'order', where: { isActive: { equals: true } } }),
        payload.find({ collection: 'rooms' as any, limit: 20, sort: 'order', where: { isAvailable: { equals: true } } }),
        payload.find({ collection: 'posts' as any, limit: 6, sort: '-publishDate', where: { status: { equals: 'published' } } }),
        payload.find({ collection: 'reviews', limit: 6, sort: '-createdAt', depth: 1 }),
        payload.findGlobal({ slug: 'site-settings' as any, depth: 0 }),
    ])
    const destinations: any[] = destinationsData.docs
    const rooms: any[] = roomsData.docs
    const posts: any[] = postsData.docs
    const homeReviews: any[] = reviewsData.docs
    const contact = siteSettings as any || {}

    return (
        <article>
            <ScrollAnimations />

            {/* ═══════════ HERO — JAPAN ZEN ═══════════ */}
            <section data-hero className="relative min-h-screen flex items-end overflow-hidden" style={{ backgroundColor: '#171914' }}>
                {/* Background image — parallax, preloaded for LCP */}
                <div data-hero-bg className="absolute inset-0">
                    <Image
                        src="/hong-thai-hero.jpg"
                        alt="Hồng Thái Na Hang — Đặc sản vùng cao"
                        fill
                        sizes="100vw"
                        className="object-cover object-center"
                        priority
                        quality={85}
                    />
                </div>

                {/* Ink wash overlays */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(23,25,20,0.85) 0%, rgba(23,25,20,0.55) 50%, rgba(23,25,20,0.2) 100%)' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(23,25,20,0.92) 0%, transparent 50%, rgba(23,25,20,0.25) 100%)' }} />

                {/* Seigaiha pattern overlay — very subtle */}
                <div className="absolute inset-0 pattern-seigaiha opacity-30" />

                {/* Enso circle — decorative (top right) */}
                <div className="absolute top-12 right-12 hidden lg:block" style={{ opacity: 0.06 }}>
                    <svg width="280" height="280" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M60 8 C85,8 108,28 108,60 C108,88 88,112 60,112 C32,112 10,90 12,62 C14,38 34,16 56,12"
                            stroke="white"
                            strokeWidth="5"
                            strokeLinecap="round"
                            fill="none"
                            className="animate-enso"
                        />
                    </svg>
                </div>

                {/* Large Kanji decoration */}
                <div className="absolute bottom-0 right-0 overflow-hidden pointer-events-none select-none hidden xl:block">
                    <span className="kanji-bg text-white" style={{ fontSize: '28rem', opacity: 0.035, lineHeight: 1 }}>茶</span>
                </div>

                {/* Hero content */}
                <div data-hero-content className="container max-w-6xl mx-auto px-4 pb-28 pt-48 relative z-10">
                    <div className="max-w-xl">
                        {/* Kigo — season word label */}
                        <div className="flex items-center gap-4 mb-12">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.35))' }} />
                                <span className="text-white/55 text-[10px] tracking-[0.4em] uppercase font-light" style={{ fontFamily: 'Noto Serif JP, serif', letterSpacing: '0.4em' }}>Đặc sản vùng cao · Na Hang</span>
                            </div>
                        </div>

                        {/* Haiku-style heading */}
                        <h1 className="text-5xl md:text-7xl font-light text-white leading-[1.1] mb-4 tracking-tight">
                            Du lịch
                        </h1>
                        <h1 className="text-5xl md:text-7xl font-light text-white/80 leading-[1.1] mb-12 tracking-tight" style={{ fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
                            Hồng Thái
                        </h1>

                        {/* Zen brush stroke separator */}
                        <div className="mb-10" style={{ width: '60px', height: '1px', background: 'linear-gradient(to right, rgba(196,160,85,0.7), transparent)' }} />

                        <p className="text-base md:text-lg text-white/50 leading-[1.9] mb-14 max-w-sm font-light" style={{ letterSpacing: '0.02em' }}>
                            Trà Shan Tuyết cổ thụ · Mật ong rừng<br />
                            Gạo nương · Đặc sản núi rừng Đông Bắc
                        </p>

                        <div className="flex flex-wrap gap-4 items-center">
                            <Link href="/products" className="btn-zen group inline-flex items-center gap-3 text-white px-8 py-3.5 text-[12px] tracking-[0.15em] uppercase font-light transition-all duration-500 border border-white/15 hover:border-white/30">
                                Khám phá sản phẩm
                                <svg className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                            </Link>
                            <a href="#about" className="inline-flex items-center text-white/45 px-4 py-3.5 text-[12px] tracking-[0.15em] uppercase font-light hover:text-white/70 transition-all duration-500">
                                Về Hồng Thái
                            </a>
                        </div>
                    </div>

                    {/* Stats — minimal zen */}
                    <div className="hidden lg:flex items-center gap-12 absolute bottom-28 right-4">
                        {[
                            { value: '1,200m', label: '高 · Độ cao' },
                            { value: '100%', label: '自然 · Tự nhiên' },
                            { value: '48h', label: '配達 · Giao hàng' },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <p className="text-white/60 font-light text-lg tracking-wide" style={{ fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>{s.value}</p>
                                <p className="text-white/35 text-[9px] tracking-[0.2em] uppercase mt-1.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scroll line */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
                    <div className="w-px h-12" style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.15))' }} />
                </div>
            </section>

            {/* ═══════════ DIVIDER — ink brush ═══════════ */}
            <div className="flex items-center justify-center py-16 bg-background">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--border))' }} />
                    <span className="zen-kanji text-foreground/10 text-2xl">一</span>
                    <div className="w-16 h-px" style={{ background: 'linear-gradient(to left, transparent, var(--border))' }} />
                </div>
            </div>

            {/* ═══════════ PRODUCTS — ZEN GRID ═══════════ */}
            <section id="products" className="pb-28 bg-background">
                <div className="container max-w-6xl mx-auto px-4">
                    <div data-animate="section-header" className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-5 h-px" style={{ background: 'var(--matcha)', opacity: 0.5 }} />
                                <p className="text-[10px] uppercase tracking-[0.3em] font-light" style={{ color: 'var(--matcha)' }}>Đặc sản nổi bật · 名物</p>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-tight mb-3" style={{ fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>Sản phẩm từ núi rừng</h2>
                            <p className="text-muted-foreground font-light text-sm leading-relaxed">Chọn lọc kỹ lưỡng · Nguồn gốc rõ ràng · Ship toàn quốc</p>
                        </div>
                        <Link href="/products" className="group inline-flex items-center gap-2 text-foreground/50 text-[12px] font-light hover:text-foreground transition-colors duration-500 tracking-wide">
                            すべて見る Xem tất cả
                            <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                        </Link>
                    </div>

                    <div data-animate="stagger-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredProducts.docs.length > 0 ? featuredProducts.docs.map((prod: any) => (
                            <Link href={`/products/${prod.slug}`} key={prod.id} className="group block product-card-zen">
                                <div className="aspect-square bg-muted/60 relative overflow-hidden mb-4" style={{ borderRadius: '2px' }}>
                                    {prod.gallery?.[0]?.image && typeof prod.gallery[0].image === 'object' ? (
                                        <Image src={prod.gallery[0].image.url} alt={prod.title} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover group-hover:scale-[1.04] transition-transform duration-[900ms] ease-out" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center pattern-seigaiha">
                                            <span className="zen-kanji text-5xl" style={{ color: 'var(--matcha)', opacity: 0.2 }}>茶</span>
                                        </div>
                                    )}
                                    <HomeQuickAddButton productId={prod.id} productSlug={prod.slug} />
                                </div>
                                <h3 className="font-light text-sm text-foreground/85 mb-2 group-hover:text-foreground transition-colors duration-400 truncate tracking-wide">{prod.title}</h3>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-foreground font-light text-base" style={{ fontFamily: 'Noto Serif JP, serif' }}>{new Intl.NumberFormat('vi-VN').format(prod.priceInVND || 0)}₫</p>
                                    <span className="text-[11px] text-muted-foreground font-light">/ {prod.unit || 'kg'}</span>
                                </div>
                            </Link>
                        )) : (
                            ['Trà Shan Tuyết', 'Mật ong rừng', 'Gạo nương đặc sản', 'Thổ cẩm Tày', 'Rượu ngô men lá', 'Măng khô rừng', 'Tinh bột nghệ', 'Chè Shan dây'].map((name, idx) => (
                                <div key={idx} className="block product-card-zen">
                                    <div className="aspect-square bg-muted/60 flex items-center justify-center mb-4 pattern-seigaiha" style={{ borderRadius: '2px' }}>
                                        <span className="zen-kanji text-5xl" style={{ color: 'var(--matcha)', opacity: 0.15 }}>茶</span>
                                    </div>
                                    <h3 className="font-light text-sm text-foreground/75 tracking-wide">{name}</h3>
                                    <p className="text-muted-foreground text-xs mt-1 font-light">Sắp ra mắt</p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Trust bar — zen style */}
                    <div data-animate="fade-up" className="mt-20 pt-16 border-t border-border/40">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { kanji: '本', title: 'Hàng chính hãng', desc: '100% từ Hồng Thái' },
                                { kanji: '速', title: 'Giao toàn quốc', desc: 'Qua GHN Express' },
                                { kanji: '払', title: 'Thanh toán COD', desc: 'Nhận hàng rồi trả tiền' },
                                { kanji: '返', title: 'Đổi trả 7 ngày', desc: 'Nếu không hài lòng' },
                            ].map((item, i) => (
                                <div key={i} className="text-center group">
                                    <p className="zen-kanji text-2xl mb-3" style={{ color: 'var(--matcha)', opacity: 0.3 }}>{item.kanji}</p>
                                    <p className="font-light text-sm text-foreground/85 tracking-wide mb-1">{item.title}</p>
                                    <p className="text-xs text-muted-foreground/80 font-light">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════ ABOUT — ZEN BRAND STORY ═══════════ */}
            <section id="about" className="py-28 relative overflow-hidden" style={{ backgroundColor: 'var(--yuki)' }}>
                {/* Asanoha background pattern */}
                <div className="absolute inset-0 pattern-asanoha" />

                {/* Large kanji watermark */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden xl:block" style={{ opacity: 0.03 }}>
                    <span className="zen-kanji text-foreground" style={{ fontSize: '32rem', lineHeight: 1 }}>山</span>
                </div>

                <div className="container max-w-6xl mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div data-animate="slide-left">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-5 h-px" style={{ background: 'var(--matcha)', opacity: 0.5 }} />
                                <p className="text-[10px] uppercase tracking-[0.3em] font-light" style={{ color: 'var(--matcha)' }}>Về Hồng Thái · 紹介</p>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-light text-foreground leading-[1.3] mb-8 tracking-tight" style={{ fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
                                Nguồn gốc tạo nên<br />chất lượng khác biệt
                            </h2>
                            {/* Sumi ink stroke */}
                            <div className="mb-8" style={{ width: '48px', height: '1px', background: 'linear-gradient(to right, var(--kincha), transparent)' }} />
                            <p className="text-muted-foreground leading-[2] mb-10 font-light text-[15px]">
                                Hồng Thái nằm ở độ cao hơn 1.200m so với mực nước biển thuộc huyện Na Hang, Tuyên Quang. Khí hậu mát mẻ quanh năm cùng thổ nhưỡng màu mỡ tạo nên những sản phẩm nông nghiệp đặc biệt: trà Shan Tuyết từ cây trà hàng trăm năm tuổi, mật ong rừng nguyên chất, gạo nương thơm dẻo.
                            </p>

                            {/* Zen-style feature list — shin hanga inspired */}
                            <div className="space-y-0 mb-10">
                                {[
                                    { kanji: '茶', label: 'Trà Shan Tuyết', desc: 'Cây trà cổ 300+ tuổi' },
                                    { kanji: '蜜', label: 'Mật ong rừng', desc: 'Nguyên chất 100%' },
                                    { kanji: '米', label: 'Gạo nương đặc sản', desc: 'Canh tác truyền thống' },
                                    { kanji: '布', label: 'Thổ cẩm Tày', desc: 'Dệt thủ công' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-5 py-4 border-b border-border/30 last:border-0 group hover:pl-2 transition-all duration-400">
                                        <span className="zen-kanji text-xl flex-none w-6 text-center" style={{ color: 'var(--matcha)', opacity: 0.5 }}>{item.kanji}</span>
                                        <div className="flex items-baseline gap-3">
                                            <p className="font-light text-foreground/90 text-sm tracking-wide">{item.label}</p>
                                            <span className="text-muted-foreground/80 text-xs font-light">— {item.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link href="/products" className="group inline-flex items-center gap-3 text-foreground/50 text-[12px] font-light hover:text-foreground transition-colors duration-400 tracking-[0.1em]">
                                Khám phá sản phẩm
                                <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                            </Link>
                        </div>

                        {/* Image grid */}
                        <div className="relative" data-animate="slide-right">
                            <div data-animate="image-grid" className="grid grid-cols-12 grid-rows-6 gap-2 h-[520px]">
                                <div className="col-span-7 row-span-4 overflow-hidden relative group" style={{ borderRadius: '2px' }}>
                                    <Image src="/hong-thai-terraces.png" alt="Ruộng bậc thang Hồng Thái" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover group-hover:scale-[1.04] transition-transform duration-[900ms] ease-out" />
                                </div>
                                <div className="col-span-5 row-span-3 overflow-hidden relative group" style={{ borderRadius: '2px' }}>
                                    <Image src="/hong-thai-tea.png" alt="Trà Shan Tuyết cổ thụ" fill sizes="(max-width: 1024px) 100vw, 30vw" className="object-cover group-hover:scale-[1.04] transition-transform duration-[900ms] ease-out" />
                                </div>
                                <div className="col-span-5 row-span-3 overflow-hidden relative group" style={{ borderRadius: '2px' }}>
                                    <Image src="/hong-thai-village.png" alt="Bản làng Tày" fill sizes="(max-width: 1024px) 100vw, 30vw" className="object-cover group-hover:scale-[1.04] transition-transform duration-[900ms] ease-out" />
                                </div>
                                <div className="col-span-7 row-span-2 overflow-hidden relative group" style={{ borderRadius: '2px' }}>
                                    <Image src="/hong-thai-about.png" alt="Thu hoạch đặc sản" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover object-top group-hover:scale-[1.04] transition-transform duration-[900ms] ease-out" />
                                </div>
                            </div>

                            {/* Floating stat — washi card */}
                            <div data-animate="float-badge" className="absolute -bottom-5 -left-5 bg-card shadow-sm px-6 py-4 z-10 border border-border/40" style={{ borderRadius: '2px' }}>
                                <p className="text-2xl font-light text-foreground leading-none" style={{ fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>1,200<span className="text-sm">m</span></p>
                                <p className="text-[10px] text-muted-foreground mt-1.5 font-light tracking-wide">Độ cao so với mực nước biển</p>
                                <div className="mt-2" style={{ width: '24px', height: '1px', background: 'var(--kincha)', opacity: 0.5 }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════ TESTIMONIALS — ZEN ═══════════ */}
            <section className="py-28 bg-background">
                <div className="container max-w-6xl mx-auto px-4">
                    <div className="text-center mb-20">
                        {/* Enso mini decoration */}
                        <div className="flex items-center justify-center mb-8">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <path d="M24 4 C35,4 44,12 44,24 C44,35 36,44 24,44 C12,44 4,36 5,24 C6,14 14,6 22,4.5" stroke="var(--matcha)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />
                            </svg>
                        </div>
                        <div className="flex items-center justify-center gap-4 mb-5">
                            <div className="w-8 h-px border-border" style={{ background: 'var(--border)' }} />
                            <p className="text-[10px] uppercase tracking-[0.3em] font-light text-muted-foreground">Đánh giá · 評価</p>
                            <div className="w-8 h-px" style={{ background: 'var(--border)' }} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-tight" style={{ fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>Khách hàng nói gì?</h2>
                        <p className="text-muted-foreground mt-4 font-light text-sm">Phản hồi từ những khách hàng đã mua sản phẩm</p>
                    </div>
                    <div data-animate="stagger-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {homeReviews.length > 0 ? homeReviews.slice(0, 3).map((review: any, i: number) => {
                            const productName = typeof review.product === 'object' ? review.product?.title : ''
                            return (
                                <div key={review.id || i} className="p-8 bg-card border border-border/30 hover:border-border/60 transition-all duration-500 relative group" style={{ borderRadius: '2px' }}>
                                    {/* Kanji watermark */}
                                    <div className="absolute top-4 right-5 zen-kanji text-5xl" style={{ color: 'var(--matcha)', opacity: 0.05 }}>評</div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex gap-1">
                                            {Array.from({ length: review.rating || 5 }).map((_: any, j: number) => <span key={j} className="text-amber-600/50 text-xs">★</span>)}
                                        </div>
                                        {productName && <span className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase">{productName}</span>}
                                    </div>
                                    <p className="text-foreground/70 text-sm leading-[2] mb-8 font-light">&ldquo;{review.comment}&rdquo;</p>
                                    <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                                        <div className="w-7 h-7 flex items-center justify-center text-muted-foreground text-xs font-light border border-border/50" style={{ borderRadius: '50%' }}>{(review.name || 'K')[0]}</div>
                                        <div>
                                            <p className="font-light text-sm text-foreground/85 tracking-wide">{review.name || 'Khách hàng'}</p>
                                            <p className="text-xs text-muted-foreground font-light">
                                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        }) : (
                            <div className="col-span-3 text-center py-14">
                                <p className="zen-kanji text-3xl mb-4" style={{ color: 'var(--matcha)', opacity: 0.15 }}>評</p>
                                <p className="text-muted-foreground font-light text-sm">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══════════ BLOG — ZEN DARK ═══════════ */}
            <section id="blog" className="py-28 text-white relative overflow-hidden" style={{ backgroundColor: '#252820' }}>
                {/* Shoji pattern on dark bg */}
                <div className="absolute inset-0 pattern-shoji" style={{ opacity: 0.15 }} />

                {/* Large kanji */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden xl:block" style={{ opacity: 0.04 }}>
                    <span className="zen-kanji text-white" style={{ fontSize: '28rem', lineHeight: 1 }}>文</span>
                </div>

                <div className="container max-w-6xl mx-auto px-4 relative z-10">
                    <div data-animate="section-header" className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-5 h-px" style={{ background: 'rgba(255,255,255,0.2)' }} />
                                <p className="text-white/50 text-[10px] uppercase tracking-[0.3em] font-light">Blog · 物語</p>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-light tracking-tight" style={{ fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>Câu chuyện &amp; Cẩm nang</h2>
                            <p className="text-white/45 mt-3 max-w-md font-light text-sm leading-relaxed">Chia sẻ về sản phẩm, nguồn gốc và văn hoá vùng cao</p>
                        </div>
                        <Link href="/blog" className="group inline-flex items-center gap-2 text-white/45 text-[12px] font-light hover:text-white/70 transition-all duration-400 tracking-[0.1em]">
                            Xem tất cả
                            <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                        </Link>
                    </div>

                    {posts.length > 0 ? (
                        <div data-animate="stagger-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post: any) => {
                                const heroImg = post.heroImage && typeof post.heroImage === 'object' ? post.heroImage.url : null
                                const dateStr = post.publishDate
                                    ? new Date(post.publishDate).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })
                                    : ''
                                const categoryName = post.category && typeof post.category === 'object' ? post.category.title : ''

                                return (
                                    <Link href={`/blog/${post.slug || post.id}`} key={post.id} className="group flex flex-col" >
                                        <div className="aspect-[16/10] bg-white/5 relative overflow-hidden mb-5" style={{ borderRadius: '2px' }}>
                                            {heroImg ? (
                                                <Image src={heroImg} alt={post.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-[1.04] transition-transform duration-[900ms] ease-out" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center pattern-shoji" style={{ opacity: 0.3 }}>
                                                    <span className="zen-kanji text-4xl text-white/20">文</span>
                                                </div>
                                            )}
                                            {categoryName && (
                                                <span className="absolute top-3 left-3 bg-white/10 backdrop-blur-sm text-[9px] font-light px-3 py-1.5 text-white/70 tracking-widest uppercase" style={{ borderRadius: '1px' }}>
                                                    {categoryName}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col grow">
                                            {dateStr && <p className="text-white/35 text-[9px] uppercase tracking-[0.25em] mb-2 font-light">{dateStr}</p>}
                                            <h3 className="font-light text-white/85 text-base mb-2 group-hover:text-white transition-colors duration-400 line-clamp-2 leading-relaxed">
                                                {post.title}
                                            </h3>
                                            {post.excerpt && (
                                                <p className="text-white/40 text-sm leading-[1.9] line-clamp-2 font-light">{post.excerpt}</p>
                                            )}
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Cách phân biệt trà Shan Tuyết thật và giả', excerpt: 'Hướng dẫn chi tiết giúp bạn chọn được trà Shan Tuyết chính gốc Hồng Thái.' },
                                { title: 'Top 5 đặc sản không thể bỏ lỡ từ Na Hang', excerpt: 'Từ trà Shan Tuyết cổ thụ đến mật ong rừng và rượu ngô men lá truyền thống.' },
                                { title: 'Câu chuyện người dệt thổ cẩm cuối cùng', excerpt: 'Nghề dệt thổ cẩm truyền thống đang được gìn giữ bởi những người phụ nữ Tày.' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex flex-col">
                                    <div className="aspect-[16/10] bg-white/5 flex items-center justify-center mb-5 pattern-shoji opacity-30" style={{ borderRadius: '2px' }}>
                                        <span className="zen-kanji text-4xl text-white/20">文</span>
                                    </div>
                                    <h3 className="font-light text-white/85 text-base mb-2 leading-relaxed">{item.title}</h3>
                                    <p className="text-white/40 text-sm leading-[1.9] line-clamp-2 font-light">{item.excerpt}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ═══════════ ROOMS / HOMESTAY — ZEN ═══════════ */}
            <section id="rooms" className="py-28 bg-background">
                <div className="container max-w-6xl mx-auto px-4">
                    <div data-animate="section-header" className="text-center mb-20">
                        {/* Enso circle mini */}
                        <div className="flex items-center justify-center mb-8">
                            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                                <path d="M24 4 C35,4 44,12 44,24 C44,35 36,44 24,44 C12,44 4,36 5,24 C6,14 14,6 22,4.5" stroke="var(--matcha)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.25" />
                            </svg>
                        </div>
                        <div className="flex items-center justify-center gap-4 mb-5">
                            <div className="w-8 h-px" style={{ background: 'var(--border)' }} />
                            <p className="text-[10px] uppercase tracking-[0.3em] font-light text-muted-foreground">Dịch vụ · 宿泊</p>
                            <div className="w-8 h-px" style={{ background: 'var(--border)' }} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-tight" style={{ fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>Homestay &amp; Lưu trú</h2>
                        <p className="text-muted-foreground mt-4 font-light text-sm">Ngoài mua sắm, bạn có thể đến tận nơi trải nghiệm</p>
                    </div>

                    <div data-animate="stagger-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rooms.map((room: any) => {
                            const priceFormatted = new Intl.NumberFormat('vi-VN').format(room.price || 0)
                            const unit = (room.priceUnit || 'đêm/phòng').split('/')[1] || 'phòng'
                            const typeLabel = roomTypeLabels[room.type] || room.type
                            const amenities = room.amenities || []
                            const bookingMsg = encodeURIComponent(`Xin chào, tôi muốn đặt ${room.name}`)
                            return (
                                <div key={room.id} className="group flex flex-col product-card-zen">
                                    <div className="h-52 bg-muted/50 relative overflow-hidden mb-6" style={{ borderRadius: '2px' }}>
                                        {room.image && typeof room.image === 'object' ? (
                                            <Image src={room.image.url} alt={room.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-[1.04] transition-transform duration-[900ms] ease-out" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center pattern-seigaiha">
                                                <span className="zen-kanji text-5xl" style={{ color: 'var(--matcha)', opacity: 0.15 }}>{room.emoji || '宿'}</span>
                                            </div>
                                        )}
                                        {room.highlight && <span className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-[9px] font-light px-3 py-1.5 text-foreground/70 tracking-wider" style={{ borderRadius: '1px' }}>{room.highlight}</span>}
                                    </div>
                                    <div className="flex flex-col grow">
                                        <p className="text-[9px] text-muted-foreground uppercase tracking-[0.25em] mb-2 font-light">{typeLabel}</p>
                                        <h3 className="font-light text-lg text-foreground/80 mb-2 group-hover:text-primary transition-colors duration-400 tracking-wide" style={{ fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>{room.name}</h3>
                                        {room.description && <p className="text-muted-foreground text-xs mb-4 line-clamp-2 font-light leading-[1.8]">{room.description}</p>}

                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {amenities.map((a: any, j: number) => (
                                                <span key={j} className="text-[9px] bg-muted text-foreground/40 px-2 py-1 font-light tracking-wide" style={{ borderRadius: '1px' }}>{a.name || a}</span>
                                            ))}
                                        </div>

                                        {room.capacity && <p className="text-xs text-muted-foreground mb-4 font-light">{room.capacity}</p>}

                                        <div className="mt-auto flex items-end justify-between pt-4 border-t border-border/30">
                                            <div>
                                                <span className="text-xl font-light text-foreground" style={{ fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>{priceFormatted}₫</span>
                                                <span className="text-xs text-muted-foreground ml-1 font-light">/{unit}</span>
                                            </div>
                                            <a href={room.bookingLink || `https://m.me/hongthai.nahang?text=${bookingMsg}`} target="_blank" rel="noopener noreferrer" className="text-foreground/40 text-[11px] font-light hover:text-foreground transition-colors duration-400 flex items-center gap-1.5 group/btn tracking-[0.1em]">
                                                Đặt ngay
                                                <svg className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="mt-14 text-center">
                        <p className="text-muted-foreground text-sm font-light">
                            Đặt phòng qua Zalo/Messenger hoặc gọi <span className="text-foreground font-light" style={{ fontFamily: 'Noto Serif JP, serif' }}>{contact.hotline || '0988 456 789'}</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══════════ DESTINATIONS — ZEN GRID ═══════════ */}
            <section id="destinations" className="py-28 relative overflow-hidden" style={{ backgroundColor: 'var(--yuki)' }}>
                <div className="absolute inset-0 pattern-asanoha" />

                <div className="container max-w-6xl mx-auto px-4 relative z-10">
                    <div data-animate="section-header" className="text-center mb-20">
                        <div className="flex items-center justify-center gap-4 mb-5">
                            <div className="w-8 h-px" style={{ background: 'var(--border)' }} />
                            <p className="text-[10px] uppercase tracking-[0.3em] font-light text-muted-foreground">Khám phá · 探索</p>
                            <div className="w-8 h-px" style={{ background: 'var(--border)' }} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-tight" style={{ fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>Điểm đến Hồng Thái</h2>
                        <p className="text-muted-foreground mt-4 font-light text-sm">Nơi sản sinh ra những đặc sản tuyệt vời</p>
                    </div>

                    <div data-animate="stagger-grid" className="grid grid-cols-12 auto-rows-[140px] gap-2">
                        {destinations.map((place: any, idx: number) => {
                            const spans = [
                                'col-span-12 md:col-span-7 row-span-3',
                                'col-span-12 md:col-span-5 row-span-3',
                                'col-span-6 md:col-span-6 row-span-2',
                                'col-span-6 md:col-span-6 row-span-2',
                                'col-span-12 md:col-span-8 row-span-2',
                                'col-span-12 md:col-span-4 row-span-2',
                            ]
                            const spanClass = spans[idx % spans.length] || 'col-span-6 row-span-2'
                            const isLarge = idx < 2

                            return (
                                <div key={place.id} className={`${spanClass} group relative overflow-hidden cursor-pointer`} style={{ borderRadius: '2px' }}>
                                    {(() => {
                                        const defaultImages: Record<string, string> = {
                                            'ruong-bac-thang': 'https://loremflickr.com/800/600/rice,terraces?lock=1',
                                            'rung-tra-shan-tuyet': 'https://loremflickr.com/800/600/tea,plantation,mountain?lock=2',
                                            'thac-khuoi-nhi': 'https://loremflickr.com/800/600/vietnam,waterfall?lock=3',
                                            'ban-lang-khau-trang': 'https://loremflickr.com/800/600/vietnam,village?lock=4',
                                            'dinh-nui-pu-don': 'https://loremflickr.com/800/600/vietnam,mountain,peak?lock=5',
                                            'ho-na-hang': 'https://loremflickr.com/800/600/vietnam,lake?lock=6',
                                        }
                                        const imgUrl = (place.image && typeof place.image === 'object') ? place.image.url : defaultImages[place.slug] || 'https://loremflickr.com/800/600/vietnam,nature?lock=7'
                                        return (
                                            <Image src={imgUrl} alt={place.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-[1.06] transition-transform duration-[1200ms] ease-out" />
                                        )
                                    })()}
                                    <div className="absolute inset-0 transition-all duration-700" style={{ background: 'linear-gradient(to top, rgba(30,28,23,0.65) 0%, rgba(30,28,23,0.1) 50%, transparent 100%)' }} />
                                    {place.tag && (
                                        <span className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm text-[9px] font-light px-3 py-1.5 z-10 text-foreground/70 tracking-widest uppercase" style={{ borderRadius: '1px' }}>
                                            {place.tag}
                                        </span>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                                        <h3 className={`font-light text-white mb-1 tracking-wide ${isLarge ? 'text-xl md:text-2xl' : 'text-base'}`} style={{ fontFamily: isLarge ? 'Noto Serif JP, serif' : undefined, fontWeight: 300 }}>
                                            {place.name}
                                        </h3>
                                        <p className={`text-white/60 leading-relaxed font-light ${isLarge ? 'text-sm line-clamp-2' : 'text-xs line-clamp-2'}`}>
                                            {place.description}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════════ CONTACT / CTA — ZEN DARK ═══════════ */}
            <section id="contact" className="py-28 text-white relative overflow-hidden" style={{ backgroundColor: '#1E1C17' }}>
                {/* Shoji pattern overlay */}
                <div className="absolute inset-0 pattern-shoji" style={{ opacity: 0.12 }} />

                {/* Ambient gradient glow — top */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 20% 0%, rgba(107,122,94,0.08) 0%, transparent 70%)' }} />

                {/* Ambient gradient glow — bottom right */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 50% at 80% 100%, rgba(196,160,85,0.06) 0%, transparent 70%)' }} />

                {/* Large kanji watermark */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden xl:block" style={{ opacity: 0.04 }}>
                    <span className="zen-kanji text-white" style={{ fontSize: '28rem', lineHeight: 1 }}>連</span>
                </div>

                {/* Enso circle — decorative (top left) */}
                <div className="absolute top-12 left-12 hidden lg:block" style={{ opacity: 0.05 }}>
                    <svg width="160" height="160" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M60 8 C85,8 108,28 108,60 C108,88 88,112 60,112 C32,112 10,90 12,62 C14,38 34,16 56,12"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            fill="none"
                        />
                    </svg>
                </div>

                <div className="container max-w-6xl mx-auto px-4 relative z-10">
                    <div data-animate="fade-up" className="border border-white/10 p-10 md:p-16 relative overflow-hidden backdrop-blur-sm" style={{ backgroundColor: 'rgba(30,28,23,0.6)', borderRadius: '2px' }}>
                        {/* Seigaiha subtle pattern inside card */}
                        <div className="absolute inset-0 pattern-seigaiha" style={{ opacity: 0.06 }} />

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
                            <div>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-5 h-px" style={{ background: 'rgba(255,255,255,0.2)' }} />
                                    <p className="text-white/50 text-[10px] uppercase tracking-[0.3em] font-light">Liên hệ · 連絡</p>
                                </div>
                                <h2 className="text-3xl font-light text-white mb-4 tracking-tight" style={{ fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>Liên hệ đặt hàng</h2>
                                {/* Kincha stroke */}
                                <div className="mb-8" style={{ width: '48px', height: '1px', background: 'linear-gradient(to right, rgba(196,160,85,0.7), transparent)' }} />
                                <p className="text-white/45 leading-[2] mb-10 font-light text-sm">Liên hệ để được tư vấn sản phẩm, đặt hàng số lượng lớn hoặc hợp tác phân phối đặc sản Hồng Thái.</p>
                                <div className="space-y-0">
                                    {[
                                        { kanji: '電', label: 'Hotline', value: contact.hotline || '0988 456 789', href: `tel:${(contact.hotline || '0988456789').replace(/\s/g, '')}` },
                                        { kanji: '話', label: 'Zalo', value: contact.zalo || contact.hotline || '0988 456 789', href: `https://zalo.me/${(contact.zalo || contact.hotline || '0988456789').replace(/\s/g, '')}` },
                                        { kanji: '便', label: 'Email', value: contact.email || 'info@hongthai-nahang.vn', href: `mailto:${contact.email || 'info@hongthai-nahang.vn'}` },
                                        { kanji: '所', label: 'Địa chỉ', value: contact.address || 'Xã Hồng Thái, Na Hang, Tuyên Quang', href: '#' },
                                    ].map((c, i) => (
                                        <a key={i} href={c.href} className="flex items-center gap-5 py-4 border-b border-white/10 last:border-0 hover:pl-2 transition-all duration-400 group">
                                            <span className="zen-kanji text-sm flex-none" style={{ color: 'rgba(154,180,135,0.6)' }}>{c.kanji}</span>
                                            <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] w-14 flex-none font-light">{c.label}</p>
                                            <p className="font-light text-white/70 text-sm group-hover:text-white transition-colors">{c.value}</p>
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <ContactForm />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </article>
    )
}

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Hồng Thái Na Hang — Đặc Sản Vùng Cao · Trà Shan Tuyết · Mật Ong Rừng',
        description: 'Mua đặc sản Hồng Thái, Na Hang chính gốc: trà Shan Tuyết cổ thụ, mật ong rừng, gạo nương, thổ cẩm. Ship toàn quốc, thanh toán COD.',
        alternates: {
            canonical: '/',
        },
    }
}
