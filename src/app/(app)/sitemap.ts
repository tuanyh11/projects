import configPromise from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const payload = await getPayload({ config: configPromise })

    // Fetch all published products
    const products = await payload.find({
        collection: 'products',
        limit: 1000,
        where: { _status: { equals: 'published' } },
        select: { slug: true, updatedAt: true },
    })

    // Fetch all published posts
    const posts = await payload.find({
        collection: 'posts' as any,
        limit: 1000,
        where: { status: { equals: 'published' } },
        select: { slug: true, updatedAt: true },
    })

    // Fetch all published pages
    const pages = await payload.find({
        collection: 'pages',
        limit: 100,
        where: { _status: { equals: 'published' } },
        select: { slug: true, updatedAt: true },
    })

    const now = new Date().toISOString()

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/shop`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
    ]

    // Dynamic product pages
    const productPages: MetadataRoute.Sitemap = products.docs.map((product: any) => ({
        url: `${baseUrl}/products/${product.slug}`,
        lastModified: product.updatedAt || now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    // Dynamic blog pages
    const blogPages: MetadataRoute.Sitemap = posts.docs.map((post: any) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt || now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }))

    // Dynamic CMS pages
    const cmsPages: MetadataRoute.Sitemap = pages.docs.map((page: any) => ({
        url: `${baseUrl}/${page.slug}`,
        lastModified: page.updatedAt || now,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
    }))

    return [...staticPages, ...productPages, ...blogPages, ...cmsPages]
}
