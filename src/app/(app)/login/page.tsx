import { LoginForm } from '@/components/forms/LoginForm'
import { RenderParams } from '@/components/RenderParams'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function LoginPage() {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (user) {
        redirect(`/account?warning=${encodeURIComponent('You are already logged in.')}`)
    }

    return (
        <div className="fixed inset-0 z-[100] flex" style={{ backgroundColor: 'var(--washi)' }}>
            {/* Left — Zen decorative panel */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden" style={{ backgroundColor: '#1E1C17' }}>
                {/* Shoji grid */}
                <div className="absolute inset-0 pattern-shoji" style={{ opacity: 0.06 }} />

                {/* Enso circle — large */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ opacity: 0.06 }}>
                    <svg width="400" height="400" viewBox="0 0 120 120" fill="none">
                        <path d="M60 8 C85,8 108,28 108,60 C108,88 88,112 60,112 C32,112 10,90 12,62 C14,38 34,16 56,12"
                            stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
                    </svg>
                </div>

                {/* Kanji watermark */}
                <div className="absolute bottom-0 right-0 pointer-events-none select-none" style={{ opacity: 0.04 }}>

                </div>

                <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
                    <Link href="/" className="flex items-center gap-3">
                        <svg width="22" height="22" viewBox="0 0 44 44" fill="none" style={{ opacity: 0.4 }}>
                            <path d="M22 4 C32,4 40,11 40,22 C40,32 33,40 22,40 C11,40 4,33 5,22 C6,13 13,5 20,4.3"
                                stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                        </svg>
                        <div>
                            <p className="text-[14px] tracking-[0.08em]" style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}>Hồng Thái</p>
                            <p className="text-[7px] text-white/30 uppercase tracking-[0.4em]">Na Hang · 紅太</p>
                        </div>
                    </Link>

                    <div className="max-w-sm">
                        <h2 className="text-3xl font-light leading-snug mb-4 tracking-tight" style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}>
                            Chào mừng<br />trở lại
                        </h2>
                        <div className="mb-6" style={{ width: '40px', height: '1px', background: 'linear-gradient(to right, rgba(196,160,85,0.5), transparent)' }} />
                        <p className="text-white/30 leading-[1.9] font-light text-sm">
                            Đăng nhập để đặt phòng, đặt mua đặc sản và theo dõi chuyến hành trình của bạn.
                        </p>
                    </div>

                    <div className="border border-white/8 p-6" style={{ borderRadius: '2px' }}>
                        <p className="text-white/40 text-sm leading-[1.9] mb-4 font-light">
                            &ldquo;Homestay ấm cúng, view ngắm ruộng bậc thang cực đẹp. Mình đặc biệt thích trà Shan Tuyết cổ thụ ở đây.&rdquo;
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 flex items-center justify-center text-white/40 text-xs font-light border border-white/15" style={{ borderRadius: '50%' }}>M</div>
                            <div>
                                <p className="text-sm font-light text-white/50">Minh Hà</p>
                                <p className="text-[10px] text-white/20 font-light">Du khách từ Hà Nội</p>
                            </div>
                            <div className="ml-auto flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-amber-600/50 text-xs">★</span>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right — Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto" style={{ backgroundColor: 'var(--washi)' }}>
                <div className="w-full max-w-md">
                    <Link href="/" className="flex items-center gap-3 mb-12 lg:hidden">
                        <svg width="20" height="20" viewBox="0 0 44 44" fill="none" style={{ opacity: 0.3 }}>
                            <path d="M22 4 C32,4 40,11 40,22 C40,32 33,40 22,40 C11,40 4,33 5,22 C6,13 13,5 20,4.3"
                                stroke="var(--matcha)" strokeWidth="2" strokeLinecap="round" fill="none" />
                        </svg>
                        <span className="font-light text-foreground tracking-wide" style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}>Hồng Thái</span>
                    </Link>

                    <div className="mb-10">
                        <h1 className="text-2xl font-light text-foreground mb-2 tracking-tight" style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}>Đăng nhập</h1>
                        <div className="mb-4" style={{ width: '32px', height: '1px', background: 'linear-gradient(to right, var(--kincha), transparent)' }} />
                        <p className="text-muted-foreground text-sm font-light">Nhập thông tin tài khoản để tiếp tục mua sắm</p>
                    </div>

                    <RenderParams />
                    <LoginForm />

                    <p className="text-center text-xs text-muted-foreground mt-10 font-light">
                        Bằng việc đăng nhập, bạn đồng ý với{' '}
                        <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors sumi-underline">Điều khoản sử dụng</Link>
                        {' '}và{' '}
                        <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors sumi-underline">Chính sách bảo mật</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export const metadata: Metadata = {
    title: 'Đăng nhập - Hồng Thái',
    description: 'Đăng nhập tài khoản Hồng Thái Na Hang.',
}
