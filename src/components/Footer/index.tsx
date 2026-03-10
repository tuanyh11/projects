import type { Footer } from '@/payload-types'

import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'

const { COMPANY_NAME, SITE_NAME } = process.env

export async function Footer() {
  const footer: Footer = await getCachedGlobal('footer', 1)()
  const menu = footer.navItems || []
  const currentYear = new Date().getFullYear()
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : '')
  const copyrightName = COMPANY_NAME || SITE_NAME || ''

  return (
    <footer className="relative text-white overflow-hidden" style={{ backgroundColor: '#1E1C17' }}>
      {/* Shoji grid — very subtle */}
      <div className="absolute inset-0 pattern-shoji" style={{ opacity: 0.07 }} />

      {/* Large kanji watermark */}
      <div className="absolute bottom-0 right-0 pointer-events-none select-none hidden xl:block" style={{ opacity: 0.04 }}>
        <span className="zen-kanji text-white" style={{ fontSize: '30rem', lineHeight: 1 }}>徳</span>
      </div>

      {/* Top ink gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(107,122,94,0.3), transparent)' }} />

      <div className="container max-w-6xl mx-auto px-4 relative z-10">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 py-20">

          {/* Brand column */}
          <div className="md:col-span-5">
            <Link className="inline-flex items-center gap-3 mb-8" href="/">
              {/* Enso mark */}
              <svg width="24" height="24" viewBox="0 0 44 44" fill="none" style={{ opacity: 0.5 }}>
                <path
                  d="M22 4 C32,4 40,11 40,22 C40,32 33,40 22,40 C11,40 4,33 5,22 C6,13 13,5 20,4.3"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div>
                <p className="text-[14px] tracking-[0.08em]" style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300, color: 'rgba(255,255,255,0.85)' }}>
                  Hồng Thái
                </p>
                <p className="text-[7px] uppercase tracking-[0.4em] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Na Hang · 紅太</p>
              </div>
            </Link>

            <p className="text-sm leading-[2] max-w-sm mb-10 font-light" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Khám phá vẻ đẹp thiên nhiên hoang sơ, trải nghiệm văn hoá bản địa và thưởng thức đặc sản vùng cao tại Hồng Thái, Na Hang.
            </p>

            {/* Social links */}
            <div className="flex gap-6">
              {['Facebook', 'Zalo', 'YouTube', 'TikTok'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-xs font-light tracking-wide transition-colors duration-500 hover:text-white/70"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                  aria-label={social}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation column */}
          <div className="md:col-span-3">
            <div className="flex items-center gap-2 mb-7">
              <span className="zen-kanji text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>探</span>
              <p className="text-[9px] uppercase tracking-[0.35em] font-light" style={{ color: 'rgba(255,255,255,0.3)' }}>Khám phá</p>
            </div>
            <ul className="space-y-3.5">
              {[
                { label: 'Điểm đến', href: '/#destinations' },
                { label: 'Đặt phòng', href: '/#rooms' },
                { label: 'Tour 2N1Đ', href: '/#experience' },
                { label: 'Đặc sản', href: '/products' },
                { label: 'Blog', href: '/blog' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-light tracking-wide transition-colors duration-400 hover:text-white/70"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 mb-7">
              <span className="zen-kanji text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>連</span>
              <p className="text-[9px] uppercase tracking-[0.35em] font-light" style={{ color: 'rgba(255,255,255,0.3)' }}>Liên hệ</p>
            </div>
            <ul className="space-y-5">
              {[
                { kanji: '電', label: 'Hotline', value: '0988 456 789', href: 'tel:0988456789' },
                { kanji: '便', label: 'Email', value: 'info@hongthai-nahang.vn', href: 'mailto:info@hongthai-nahang.vn' },
                { kanji: '所', label: 'Địa chỉ', value: 'Xã Hồng Thái, Na Hang, Tuyên Quang', href: '#' },
              ].map((c, i) => (
                <li key={i}>
                  <a href={c.href} className="block group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="zen-kanji text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{c.kanji}</span>
                      <p className="text-[9px] uppercase tracking-[0.2em] font-light" style={{ color: 'rgba(255,255,255,0.25)' }}>{c.label}</p>
                    </div>
                    <p className="text-sm font-light tracking-wide transition-colors duration-400 group-hover:text-white/70" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {c.value}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-2" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '9px', letterSpacing: '0.2em' }}>
          <p>© {copyrightDate} {copyrightName} · 和 All rights reserved.</p>
          <p>Designed in Vietnam · 越南</p>
        </div>
      </div>
    </footer>
  )
}
