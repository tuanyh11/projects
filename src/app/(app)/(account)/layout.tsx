import type { ReactNode } from 'react'

import { AccountNav } from '@/components/AccountNav'
import { RenderParams } from '@/components/RenderParams'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ ZEN ACCOUNT HERO — Premium Dark ═══ */}
      <div className="relative overflow-hidden pt-24 pb-16 zen-hero-dark">
        {/* Ambient glow orbs */}
        <div className="zen-orb-matcha hidden dark:block" style={{ width: '400px', height: '300px', top: '-60px', left: '-80px', opacity: 0.6 }} />
        <div className="zen-orb-kincha hidden dark:block" style={{ width: '300px', height: '300px', top: '20px', right: '10%', opacity: 0.5 }} />

        {/* Shoji pattern */}
        <div className="absolute inset-0 pattern-shoji" style={{ opacity: 0.05 }} />

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 80% at 20% 50%, rgba(154,180,135,0.04) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 85% 20%, rgba(212,184,128,0.03) 0%, transparent 60%)'
          }}
        />

        {/* Kanji watermark */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden lg:block" style={{ opacity: 0.035 }}>
          <span className="zen-kanji text-foreground" style={{ fontSize: '18rem', lineHeight: 1 }}>人</span>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(12,11,8,0.3))' }}
        />

        <div className="container max-w-5xl mx-auto px-4 relative z-10">
          {user && (
            <div className="flex items-center gap-5">
              {/* Avatar — Glass circle */}
              <div className="w-14 h-14 flex items-center justify-center relative">
                {/* Outer ring */}
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="absolute inset-0 animate-zen-breathe">
                  <path d="M28 5 C41,5 51,14 51,28 C51,41 42,51 28,51 C14,51 5,41 6,28 C7,16 16,6 26,5.3"
                    stroke="rgba(196,160,85,0.35)" strokeWidth="1" strokeLinecap="round" fill="none" />
                </svg>
                {/* Inner glass */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(154,180,135,0.08)',
                    border: '1px solid rgba(154,180,135,0.15)',
                    backdropFilter: 'blur(12px)'
                  }}>
                  <span className="font-light text-base" style={{ fontFamily: "'Noto Serif JP', serif", color: 'rgba(212,184,128,0.8)' }}>
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>

              <div>
                {/* Label */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-4 h-px" style={{ background: 'rgba(212,184,128,0.4)' }} />
                  <span className="text-[9px] uppercase tracking-[0.3em] font-light" style={{ color: 'rgba(212,184,128,0.5)' }}>Thành viên · 会員</span>
                </div>
                <h1 className="text-xl md:text-2xl font-light tracking-tight hero-title-accent"
                  style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300, color: 'rgba(232,228,219,0.92)' }}>
                  Xin chào, {user.name || user.email?.split('@')[0]}
                </h1>
                <p className="text-[11px] font-light tracking-wide mt-1.5" style={{ color: 'rgba(145,141,133,0.7)' }}>{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4 -mt-5 relative z-20">
        <RenderParams className="" />

        {user && <AccountNav className="w-full mb-8" />}

        <div className="flex flex-col gap-6 pb-14">{children}</div>
      </div>
    </div>
  )
}
