import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import { LogoutPage } from './LogoutPage'

export default async function Logout() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 pattern-asanoha" style={{ opacity: 0.03 }} />

      {/* Ambient glow — top left */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 40% at 20% 20%, rgba(107,122,94,0.06) 0%, transparent 70%)' }} />

      {/* Ambient glow — bottom right */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 40% 40% at 80% 80%, rgba(196,160,85,0.04) 0%, transparent 70%)' }} />

      {/* Kanji watermark */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none" style={{ opacity: 0.025 }}>

      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <LogoutPage />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Bạn đã đăng xuất thành công.',
  openGraph: mergeOpenGraph({
    title: 'Đăng xuất',
    url: '/logout',
  }),
  title: 'Đăng xuất - Hồng Thái',
}
