import configPromise from '@payload-config'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'

export const metadata: Metadata = {
    title: 'Blog - Nhật ký Hồng Thái',
    description: 'Tin tức, trải nghiệm và những câu chuyện thú vị từ vùng cao Hồng Thái, Na Hang.',
    alternates: {
        canonical: '/blog',
    },
}

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
    const payload = await getPayload({ config: configPromise })

    const postsResult = await payload.find({
        collection: 'posts',
        where: {
            status: {
                equals: 'published',
            },
        },
        sort: '-publishDate',
        limit: 100,
    })

    const posts = postsResult.docs

    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            {/* ═══ ZEN BLOG HERO — Premium Dark ═══ */}
            <div className="relative overflow-hidden py-16 border-b border-border/20 zen-hero-dark">
                {/* Ambient glow orbs */}
                <div className="zen-orb-matcha" style={{ width: '500px', height: '400px', top: '-100px', right: '5%', opacity: 0.4 }} />
                <div className="zen-orb-kincha" style={{ width: '300px', height: '300px', bottom: '-80px', left: '10%', opacity: 0.3 }} />

                {/* Asanoha pattern */}
                <div className="absolute inset-0 pattern-asanoha" />

                {/* Kanji watermark */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden xl:block" style={{ opacity: 0.025 }}>
                    
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, transparent, rgba(12,11,8,0.2))' }}
                />

                <div className="container max-w-6xl mx-auto px-4 relative z-10">
                    {/* Enso mini — animated */}
                    <div className="mb-6">
                        <svg width="38" height="38" viewBox="0 0 44 44" fill="none" className="animate-zen-breathe" style={{ opacity: 0.35 }}>
                            <path d="M22 4 C32,4 40,11 40,22 C40,32 33,40 22,40 C11,40 4,33 5,22 C6,13 13,5 20,4.3"
                                stroke="var(--matcha)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                        </svg>
                    </div>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-6 h-px" style={{ background: 'linear-gradient(90deg, var(--kincha), transparent)', opacity: 0.6 }} />
                        <p className="text-[10px] uppercase tracking-[0.35em] font-light" style={{ color: 'rgba(212,184,128,0.55)' }}>Blog · 物語</p>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-light tracking-tight hero-title-accent"
                        style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300, color: 'rgba(232,228,219,0.9)' }}>
                        Góc nhỏ trải nghiệm
                    </h1>
                    <p className="mt-4 font-light text-sm leading-relaxed" style={{ color: 'rgba(145,141,133,0.75)' }}>
                        Cùng lắng nghe những câu chuyện bình yên giữa đại ngàn Đông Bắc
                    </p>
                </div>
            </div>

            <div className="container max-w-6xl mx-auto px-4 mt-14">
                {posts.length === 0 ? (
                    <div className="text-center py-20">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-6" style={{ opacity: 0.15 }}>
                            <path d="M24 4 C35,4 44,12 44,24 C44,35 36,44 24,44 C12,44 4,36 5,24 C6,14 14,6 22,4.5" stroke="var(--matcha)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                        </svg>
                        <p className="text-muted-foreground font-light">Chưa có bài viết nào được đăng. Hãy quay lại sau nhé!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post: any) => {
                            const imageUrl = typeof post.heroImage === 'object' && post.heroImage?.url ? post.heroImage.url : null

                            return (
                                <Link
                                    href={`/blog/${post.slug}`}
                                    key={post.id}
                                    className="group flex flex-col product-card-zen"
                                >
                                    <div className="relative h-56 w-full overflow-hidden" style={{ borderRadius: '2px' }}>
                                        {imageUrl ? (
                                            <Image
                                                src={imageUrl}
                                                alt={post.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                className="object-cover group-hover:scale-[1.04] transition-transform duration-[900ms] ease-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center pattern-shoji bg-muted/30">
                                                <span className="text-4xl" style={{ opacity: 0.08 }}>📝</span>
                                            </div>
                                        )}
                                        {post.category && typeof post.category === 'object' && (
                                            <span className="absolute top-3 left-3 bg-card/80 backdrop-blur-sm text-[9px] font-light px-3 py-1.5 text-foreground/70 tracking-widest uppercase" style={{ borderRadius: '1px' }}>
                                                {post.category.title}
                                            </span>
                                        )}
                                    </div>

                                    <div className="py-5 flex flex-col flex-1">
                                        <div className="flex items-center text-xs text-muted-foreground mb-3 gap-2">
                                            {post.publishDate && (
                                                <span className="text-[10px] tracking-[0.1em] font-light">{format(new Date(post.publishDate), 'dd/MM/yyyy')}</span>
                                            )}
                                            {post.author && typeof post.author === 'object' && (
                                                <>
                                                    <span className="text-border/50">·</span>
                                                    <span className="text-[10px] tracking-wide font-light">{post.author.name || post.author.email?.split('@')[0]}</span>
                                                </>
                                            )}
                                        </div>

                                        <h3 className="text-base font-light text-foreground/80 group-hover:text-foreground transition-colors duration-400 leading-relaxed mb-3 tracking-wide">
                                            {post.title}
                                        </h3>

                                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 font-light leading-[1.9]">
                                            {post.excerpt || 'Đọc chi tiết để khám phá câu chuyện đầy thú vị này!'}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-border/30 text-[11px] text-foreground/40 flex items-center group-hover:text-foreground/60 gap-1.5 transition-all duration-400 font-light tracking-[0.1em]">
                                            Đọc tiếp
                                            <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
