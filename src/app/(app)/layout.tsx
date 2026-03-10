import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import './globals.css'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const siteName = 'Hồng Thái Na Hang — Đặc Sản Vùng Cao'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F6F1' },
    { media: '(prefers-color-scheme: dark)', color: '#0C0B08' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description:
    'Mua đặc sản Hồng Thái, Na Hang chính gốc: trà Shan Tuyết cổ thụ, mật ong rừng, gạo nương, thổ cẩm. Ship toàn quốc, thanh toán COD.',
  keywords: [
    'đặc sản Hồng Thái',
    'trà Shan Tuyết',
    'mật ong rừng',
    'gạo nương',
    'Na Hang',
    'Tuyên Quang',
    'đặc sản vùng cao',
    'thổ cẩm Tày',
    'homestay Na Hang',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: baseUrl,
    siteName,
    title: siteName,
    description:
      'Khám phá đặc sản vùng cao Hồng Thái, Na Hang: trà Shan Tuyết cổ thụ, mật ong rừng, gạo nương. Ship toàn quốc.',
    images: [
      {
        url: `${baseUrl}/hong-thai-hero.jpg`,
        width: 1200,
        height: 630,
        alt: 'Hồng Thái Na Hang — Đặc sản vùng cao',
      },
    ],
  },
  alternates: {
    canonical: baseUrl,
  },
}

// Organization structured data for rich results
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Hồng Thái Na Hang',
  url: baseUrl,
  logo: `${baseUrl}/favicon.ico`,
  description:
    'Đặc sản vùng cao Hồng Thái, Na Hang, Tuyên Quang. Trà Shan Tuyết cổ thụ, mật ong rừng, gạo nương.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Na Hang',
    addressRegion: 'Tuyên Quang',
    addressCountry: 'VN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+84-988-456-789',
    contactType: 'customer service',
    availableLanguage: 'Vietnamese',
  },
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={[GeistSans.variable, GeistMono.variable].filter(Boolean).join(' ')}
      lang="vi"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

        {/* Preconnect + preload Google Fonts to prevent render-blocking */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@200;300;400;500&family=Shippori+Mincho:wght@400;500&display=swap"
          rel="stylesheet"
        />

        {/* Organization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body>
        <Providers>
          {/* <AdminBar /> */}
          <LivePreviewListener />

          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

