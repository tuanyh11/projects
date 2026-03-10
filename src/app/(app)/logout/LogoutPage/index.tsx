'use client'

import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

export const LogoutPage: React.FC = () => {
  const { logout } = useAuth()
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout()
        setSuccess('Đã đăng xuất thành công')
      } catch (_) {
        setError('Bạn đã đăng xuất rồi')
      }
      // Trigger animation after state updates
      setTimeout(() => setIsVisible(true), 100)
    }

    void performLogout()
  }, [logout])

  return (
    <div
      className="text-center transition-all duration-700"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
      }}
    >
      {(error || success) && (
        <>
          {/* Enso circle — farewell symbol */}
          <div className="flex justify-center mb-8">
            <svg width="72" height="72" viewBox="0 0 120 120" fill="none" style={{ opacity: 0.15 }}>
              <path
                d="M60 10 C95,10 110,40 110,60 C110,90 85,110 60,110 C30,110 10,85 10,60 C10,35 30,12 55,10.5"
                stroke="var(--matcha)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                className="animate-enso"
              />
            </svg>
          </div>

          {/* Kanji label */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="w-8 h-px" style={{ background: 'var(--border)' }} />
            <span className="zen-kanji text-sm" style={{ color: 'var(--matcha)', opacity: 0.3 }}>別</span>
            <div className="w-8 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* Status message */}
          <h1
            className="text-2xl font-light text-foreground/80 mb-3 tracking-tight"
            style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
          >
            {error || success}
          </h1>

          {/* Kincha stroke separator */}
          <div className="flex justify-center mb-6">
            <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to right, transparent, var(--kincha), transparent)', opacity: 0.4 }} />
          </div>

          {/* Description */}
          <p className="text-muted-foreground/60 text-sm font-light leading-relaxed mb-10 max-w-xs mx-auto">
            Cảm ơn bạn đã ghé thăm. Hẹn gặp lại bạn lần tới!
          </p>

          {/* Action buttons */}
          <div className="flex flex-col items-center gap-4">
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 px-8 py-3.5 text-[12px] tracking-[0.15em] uppercase font-light transition-all duration-500 border border-border/30 hover:border-border/60 text-foreground/60 hover:text-foreground"
              style={{ borderRadius: '2px' }}
            >
              Tiếp tục mua sắm
              <svg className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>

            <Link
              href="/login"
              className="group inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase font-light text-foreground/35 hover:text-foreground/65 transition-colors duration-500"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              <svg className="w-3 h-3 rotate-180 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              Đăng nhập lại
            </Link>
          </div>

          {/* Bottom zen decoration */}
          <div className="mt-14 flex items-center justify-center gap-4">
            <div className="w-12 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--border))' }} />
            <span className="text-[9px] text-muted-foreground/30 tracking-[0.3em] uppercase font-light">またね</span>
            <div className="w-12 h-px" style={{ background: 'linear-gradient(to left, transparent, var(--border))' }} />
          </div>
        </>
      )}
    </div>
  )
}
