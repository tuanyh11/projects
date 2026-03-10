
import { RichText } from '@/components/RichText'
import configPromise from '@payload-config'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

type Args = {
    params: Promise<{
        slug?: string
    }>
}

async function getPost(slug: string) {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({
        collection: 'posts',
        limit: 1,
        where: { slug: { equals: slug } },
    })
    return posts.docs[0] || null
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
    const { slug } = await params
    if (!slug) return {}

    const post = await getPost(slug)
    if (!post) return {}

    const imageUrl = typeof post.heroImage === 'object' && post.heroImage?.url ? post.heroImage.url : null
    const categoryName = post.category && typeof post.category === 'object' ? post.category.title : ''

    return {
        title: post.title,
        description: post.excerpt || `Đọc bài viết "${post.title}" trên blog Hồng Thái Na Hang`,
        openGraph: {
            title: post.title,
            description: post.excerpt || `Đọc bài viết "${post.title}"`,
            type: 'article',
            publishedTime: post.publishDate || undefined,
            ...(categoryName && { tags: [categoryName] }),
            ...(imageUrl && {
                images: [
                    {
                        url: imageUrl,
                        alt: post.title,
                    },
                ],
            }),
        },
    }
}

export default async function BlogPost({ params }: Args) {
    const { slug } = await params

    if (!slug) return notFound()

    const post = await getPost(slug)
    if (!post) return notFound()

    const imageUrl = typeof post.heroImage === 'object' && post.heroImage?.url ? post.heroImage.url : null
    const authorName = post.author && typeof post.author === 'object'
        ? (post.author.name || post.author.email?.split('@')[0])
        : undefined

    // Blog post structured data
    const blogPostJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt || '',
        datePublished: post.publishDate || undefined,
        dateModified: post.updatedAt || post.publishDate || undefined,
        ...(authorName && {
            author: {
                '@type': 'Person',
                name: authorName,
            },
        }),
        ...(imageUrl && { image: imageUrl }),
    }

    return (
        <article className="min-h-screen bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostJsonLd) }}
            />

            {/* ═══ ZEN HERO ═══ */}
            <div className="relative w-full h-[60vh] md:h-[70vh] flex items-end justify-center overflow-hidden">
                <div className="absolute inset-0">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={post.title}
                            fill
                            sizes="100vw"
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full pattern-seigaiha" style={{ backgroundColor: 'var(--yuki)' }} />
                    )}
                    {/* Ink wash overlay */}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(30,28,23,0.85) 0%, rgba(30,28,23,0.4) 40%, rgba(30,28,23,0.15) 100%)' }} />
                </div>

                {/* Kanji watermark */}
                <div className="absolute top-16 right-10 pointer-events-none select-none hidden lg:block" style={{ opacity: 0.05 }}>
                    <span className="zen-kanji text-white" style={{ fontSize: '14rem', lineHeight: 1 }}>読</span>
                </div>

                <div className="relative z-10 container max-w-4xl mx-auto px-6 pb-14 text-center">
                    {post.category && typeof post.category === 'object' && (
                        <Link href="/blog" className="inline-flex items-center gap-2 mb-6 text-white/40 text-[10px] font-light tracking-[0.2em] uppercase border border-white/10 px-4 py-1.5 hover:border-white/25 transition-colors duration-400" style={{ borderRadius: '1px' }}>
                            {post.category.title}
                        </Link>
                    )}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-white leading-tight mb-8 tracking-tight" style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}>
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-center gap-6 text-white/35 text-xs font-light tracking-wide">
                        {post.publishDate && (
                            <time dateTime={post.publishDate}>{format(new Date(post.publishDate || ''), 'dd/MM/yyyy')}</time>
                        )}
                        {authorName && (
                            <>
                                <span className="text-white/15">·</span>
                                <span>{authorName}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ Content ═══ */}
            <div className="container max-w-3xl mx-auto px-6 py-16">
                {/* Zen separator */}
                <div className="flex items-center justify-center mb-12">
                    <div className="w-12 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--border))' }} />
                    <span className="zen-kanji text-foreground/10 text-lg mx-3">文</span>
                    <div className="w-12 h-px" style={{ background: 'linear-gradient(to left, transparent, var(--border))' }} />
                </div>

                <div className="prose prose-lg prose-headings:font-light prose-headings:text-foreground prose-headings:tracking-tight prose-p:text-muted-foreground prose-p:leading-[2] prose-p:font-light prose-a:text-primary hover:prose-a:text-primary/80 max-w-none" style={{ fontFamily: "'Noto Serif JP', sans-serif" }}>
                    {post.content && <RichText data={post.content} />}
                </div>

                {/* Back link */}
                <div className="mt-16 pt-8 border-t border-border/30 text-center">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-foreground/40 font-light text-[12px] tracking-[0.1em] hover:text-foreground transition-colors duration-400">
                        <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                        Trở về danh sách Blog
                    </Link>
                </div>
            </div>
        </article>
    )
}

