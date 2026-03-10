/* eslint-disable no-restricted-exports */
import type { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL
  ? process.env.NEXT_PUBLIC_SERVER_URL
  : 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    host: baseUrl,
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/login',
          '/create-account',
          '/forgot-password',
          '/logout',
          '/checkout/*',
          '/next/*',
          '/find-order',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
