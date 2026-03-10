import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm'

export default async function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-16" style={{ backgroundColor: 'var(--washi)' }}>
      <div className="w-full max-w-md px-6">
        {/* Enso mini */}
        <div className="mb-8 flex justify-center">
          <svg width="36" height="36" viewBox="0 0 44 44" fill="none" style={{ opacity: 0.15 }}>
            <path d="M22 4 C32,4 40,11 40,22 C40,32 33,40 22,40 C11,40 4,33 5,22 C6,13 13,5 20,4.3"
              stroke="var(--matcha)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <h1 className="text-2xl text-center text-foreground mb-2 tracking-tight" style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}>Quên mật khẩu</h1>
        <div className="flex justify-center mb-6">
          <div style={{ width: '32px', height: '1px', background: 'linear-gradient(to right, var(--kincha), transparent)' }} />
        </div>
        <p className="text-center text-muted-foreground text-sm font-light mb-8">Nhập email để khôi phục mật khẩu của bạn</p>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Enter your email address to recover your password.',
  openGraph: mergeOpenGraph({
    title: 'Forgot Password',
    url: '/forgot-password',
  }),
  title: 'Quên mật khẩu - Hồng Thái',
}
