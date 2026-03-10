'use client'

import { CartModal } from '@/components/Cart/CartModal'
import type { Header } from '@/payload-types'
import { useAuth } from '@/providers/Auth'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

interface HeaderClientProps {
  header: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ header }) => {
  const [theme, setTheme] = useState<null | string>(null)
  const { headerTheme } = useHeaderTheme()
  const { user } = useAuth()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setTheme(headerTheme ?? null), [headerTheme])
  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerHeight = (document.querySelector('#main-header') as HTMLElement)?.offsetHeight
      if (headerHeight) {
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`)
      }
    }
    const handler = () => {
      setScrolled(window.scrollY > 20)
      updateHeaderHeight()
    }
    updateHeaderHeight()
    window.addEventListener('scroll', handler, { passive: true })
    window.addEventListener('resize', updateHeaderHeight, { passive: true })
    return () => {
      window.removeEventListener('scroll', handler)
      window.removeEventListener('resize', updateHeaderHeight)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  const isHome = pathname === '/'

  const links = [
    { href: '/', label: 'Trang chủ', kanji: '首' },
    { href: '/products', label: 'Đặc sản', kanji: '品' },
    { href: '/#about', label: 'Về chúng tôi', kanji: '紹' },
    { href: '/#rooms', label: 'Homestay', kanji: '宿' },
    { href: '/blog', label: 'Blog', kanji: '文' },
    { href: '/#contact', label: 'Liên hệ', kanji: '連' },
  ]

  const toggleMenu = useCallback(() => setMenuOpen(prev => !prev), [])

  const isOnDark = !scrolled && isHome
  const textColor = menuOpen
    ? 'rgba(255,255,255,0.9)'
    : isOnDark ? 'rgba(255,255,255,0.9)' : 'var(--foreground)'
  const mutedColor = menuOpen
    ? 'rgba(255,255,255,0.35)'
    : isOnDark ? 'rgba(255,255,255,0.35)' : 'var(--muted-foreground)'

  return (
    <>
      {/* ═══ MAIN HEADER BAR — ZEN ═══ */}
      <header
        id='main-header'
        className={`${isHome ? 'fixed' : 'sticky'} top-0 left-0 right-0 z-60 transition-all duration-700
          ${menuOpen
            ? 'bg-transparent'
            : scrolled
              ? 'border-b'
              : isHome
                ? 'bg-transparent'
                : 'border-b'
          }`}
        style={{
          backgroundColor: menuOpen ? 'transparent' : (scrolled || !isHome ? 'color-mix(in srgb, var(--background) 92%, transparent)' : 'transparent'),
          backdropFilter: (scrolled || !isHome) && !menuOpen ? 'blur(20px)' : 'none',
          borderColor: 'var(--border)',
          borderBottomColor: (scrolled || !isHome) && !menuOpen ? 'color-mix(in srgb, var(--border) 40%, transparent)' : 'transparent',
        }}
      >
        {/* Nav bar */}
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Logo — zen brushwork */}
            <Link href="/" className="flex items-center gap-3 relative z-[70]">
              {/* Mini enso mark */}
              <svg width="22" height="22" viewBox="0 0 44 44" fill="none" style={{ opacity: menuOpen ? 0.5 : (isOnDark ? 0.4 : 0.3) }}>
                <path
                  d="M22 4 C32,4 40,11 40,22 C40,32 33,40 22,40 C11,40 4,33 5,22 C6,13 13,5 20,4.3"
                  stroke={menuOpen || isOnDark ? 'white' : 'var(--matcha)'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div>
                <p className="text-[14px] tracking-[0.08em] transition-colors duration-500" style={{ color: textColor, fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
                  Hồng Thái
                </p>
                <p className="text-[7px] uppercase tracking-[0.4em] transition-colors duration-500" style={{ color: mutedColor, letterSpacing: '0.38em' }}>
                  Na Hang · Tuyên Quang
                </p>
              </div>
            </Link>

            {/* Desktop nav — zen minimal */}
            <nav className="hidden lg:flex items-center gap-0">
              {links.map((item, idx) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className="px-4 py-2 text-[11px] tracking-[0.12em] transition-all duration-400 uppercase font-light"
                    style={{
                      color: isActive
                        ? (isOnDark || menuOpen ? 'rgba(255,255,255,0.95)' : 'var(--foreground)')
                        : (isOnDark || menuOpen ? 'rgba(255,255,255,0.35)' : 'var(--muted-foreground)'),
                    }}
                    onMouseEnter={e => {
                      (e.target as HTMLElement).style.color = isOnDark || menuOpen ? 'rgba(255,255,255,0.8)' : 'var(--foreground)'
                    }}
                    onMouseLeave={e => {
                      (e.target as HTMLElement).style.color = isActive
                        ? (isOnDark || menuOpen ? 'rgba(255,255,255,0.95)' : 'var(--foreground)')
                        : (isOnDark || menuOpen ? 'rgba(255,255,255,0.35)' : 'var(--muted-foreground)')
                    }}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 relative z-[70]">

              {/* User account */}
              {user ? (
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-3 py-1.5 transition-all duration-400"
                  style={{ color: mutedColor }}
                >
                  <span
                    className="w-6 h-6 flex items-center justify-center text-[10px] font-light transition-colors border"
                    style={{
                      borderRadius: '50%',
                      borderColor: menuOpen || isOnDark ? 'rgba(255,255,255,0.2)' : 'var(--border)',
                      color: mutedColor,
                    }}
                  >
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                  <span className="hidden lg:block truncate max-w-[80px] text-[11px] tracking-wide">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="hidden lg:flex items-center text-[11px] tracking-[0.12em] px-4 py-2 transition-all duration-400 uppercase font-light"
                  style={{ color: mutedColor }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = textColor }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = mutedColor }}
                >
                  Đăng nhập
                </Link>
              )}

              {/* Cart */}
              {user && (
                <CartModal scrolled={scrolled} menuOpen={menuOpen} isHome={isHome} />
              )}

              {/* Menu toggle — sumi lines */}
              <button
                onClick={toggleMenu}
                className="relative w-10 h-10 flex items-center justify-center transition-all duration-400"
                style={{ color: mutedColor }}
                aria-label="Toggle menu"
              >
                <div className="w-5 h-4 relative hover:cursor-pointer">
                  <span className={`absolute left-0 h-px transition-all duration-500 ease-out ${menuOpen ? 'top-[7px] w-5 rotate-45' : 'top-0 w-5'}`}
                    style={{ backgroundColor: textColor }} />
                  <span className={`absolute left-0 top-[7px] h-px transition-all duration-500 ease-out ${menuOpen ? 'w-0 opacity-0' : 'w-3 opacity-100'}`}
                    style={{ backgroundColor: textColor }} />
                  <span className={`absolute left-0 h-px transition-all duration-500 ease-out ${menuOpen ? 'top-[7px] w-5 -rotate-45' : 'top-[14px] w-4'}`}
                    style={{ backgroundColor: textColor }} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ FULLSCREEN OVERLAY MENU — JAPAN ZEN ═══ */}
      <div
        className={`fixed inset-0 z-[55] transition-all duration-700 ease-out
          ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
      >
        {/* Dark background — nori color */}
        <div className={`absolute inset-0 transition-opacity duration-700 ${menuOpen ? 'opacity-[0.96]' : 'opacity-0'}`}
          style={{ backgroundColor: '#1E1C17' }} />

        {/* Shoji grid overlay */}
        <div className="absolute inset-0 pattern-shoji" style={{ opacity: 0.08 }} />

        {/* Enso watermark — large */}
        <div className="absolute top-1/2 right-16 -translate-y-1/2 hidden lg:block" style={{ opacity: 0.04 }}>
          <svg width="480" height="480" viewBox="0 0 120 120" fill="none">
            <path d="M60 8 C85,8 108,28 108,60 C108,88 88,112 60,112 C32,112 10,90 12,62 C14,38 34,16 56,12"
              stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        {/* Kanji decorations */}
        <div className="absolute bottom-0 left-0 pointer-events-none select-none hidden lg:block" style={{ opacity: 0.04 }}>
          <span className="zen-kanji text-white" style={{ fontSize: '22rem', lineHeight: 1 }}>静</span>
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center justify-center">
          <div className="container max-w-4xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-20 items-center">

              {/* Navigation links */}
              <nav className="lg:col-span-3 space-y-1">
                {links.map((item, idx) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="group flex items-center gap-6 py-4 transition-all duration-400 hover:pl-3"
                      style={{
                        transform: menuOpen ? 'translateX(0)' : 'translateX(-20px)',
                        opacity: menuOpen ? 1 : 0,
                        transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.06 + 0.2}s`,
                      }}
                    >
                      {/* Kanji label */}
                      <span className="zen-kanji text-sm w-6 text-center transition-opacity" style={{ color: 'rgba(255,255,255,0.25)', opacity: isActive ? 0.6 : 0.25 }}>
                        {item.kanji}
                      </span>
                      <p className={`text-2xl md:text-3xl font-light tracking-wide transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`}
                        style={{ fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
                        {item.label}
                      </p>
                    </Link>
                  )
                })}
              </nav>

              {/* Info panel */}
              <div
                className="hidden lg:block lg:col-span-2"
                style={{
                  transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
                  opacity: menuOpen ? 1 : 0,
                  transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
                }}
              >
                <div className="space-y-8">
                  {/* Enso small */}
                  <div className="mb-6">
                    <svg width="36" height="36" viewBox="0 0 44 44" fill="none" style={{ opacity: 0.2 }}>
                      <path d="M22 4 C32,4 40,11 40,22 C40,32 33,40 22,40 C11,40 4,33 5,22 C6,13 13,5 20,4.3"
                        stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    </svg>
                  </div>

                  <div>
                    <p className="text-[9px] text-white/20 uppercase tracking-[0.35em] mb-4 font-light">連絡 · Liên hệ</p>
                    <div className="space-y-2.5">
                      <p className="text-white/55 text-sm font-light">0988 456 789</p>
                      <p className="text-white/55 text-sm font-light">info@hongthai-nahang.vn</p>
                      <p className="text-white/55 text-sm font-light">Hồng Thái, Na Hang, Tuyên Quang</p>
                    </div>
                  </div>

                  <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

                  <div>
                    <p className="text-[9px] text-white/20 uppercase tracking-[0.35em] mb-4 font-light">フォロー · Theo dõi</p>
                    <div className="flex gap-5">
                      {['Facebook', 'Zalo', 'YouTube'].map((social) => (
                        <span key={social} className="text-white/35 text-xs font-light hover:text-white/60 transition-colors duration-400 cursor-pointer tracking-wide">
                          {social}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

                  <div>
                    <p className="text-[9px] text-white/20 uppercase tracking-[0.35em] mb-4 font-light">テーマ · Giao diện</p>
                    <ThemeSelector />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar in overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 p-6"
          style={{
            opacity: menuOpen ? 1 : 0,
            transition: 'opacity 0.6s ease 0.6s',
          }}
        >
          <div className="container max-w-4xl mx-auto flex items-center justify-between" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '9px', letterSpacing: '0.2em' }}>
            <p>© 2025 Hồng Thái · 紅太</p>
            <p>Na Hang · Tuyên Quang</p>
          </div>
        </div>
      </div>
    </>
  )
}
