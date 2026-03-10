'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface ContactFormInputs {
    fullName: string
    phone: string
    email: string
    topic: string
    message: string
}

const topicOptions = [
    { value: '', label: '✦ Bạn quan tâm điều gì?' },
    { value: 'Đặt phòng homestay', label: 'Đặt phòng homestay' },
    { value: 'Đặt tour 2N1Đ', label: 'Đặt tour 2N1Đ' },
    { value: 'Mua đặc sản online', label: 'Mua đặc sản online' },
    { value: 'Tổ chức sự kiện / Teambuilding', label: 'Tổ chức sự kiện / Teambuilding' },
    { value: 'Khác', label: 'Khác' },
]

// ═══ Custom Zen Select ═══
function ZenSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const selectedLabel = topicOptions.find(o => o.value === value)?.label || topicOptions[0].label

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full px-4 py-3.5 border border-white/15 bg-white/5 backdrop-blur-sm text-left text-sm font-light tracking-wide transition-all duration-300 flex items-center justify-between cursor-pointer"
                style={{ borderRadius: '2px' }}
            >
                <span className={value ? 'text-white/80' : 'text-white/30'}>{selectedLabel}</span>
                <svg
                    className={`w-3.5 h-3.5 text-white/30 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            {/* Dropdown */}
            <div
                className={`absolute left-0 right-0 top-full mt-1 z-50 border border-white/10 backdrop-blur-xl overflow-hidden transition-all duration-300 ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                style={{
                    borderRadius: '2px',
                    background: 'rgba(30, 28, 23, 0.95)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
            >
                {topicOptions.filter(o => o.value !== '').map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => { onChange(option.value); setOpen(false) }}
                        className={`w-full text-left px-4 py-3 text-sm font-light tracking-wide transition-all duration-300 cursor-pointer border-b border-white/5 last:border-0 flex items-center gap-3
                            ${value === option.value
                                ? 'text-white/90 bg-white/8'
                                : 'text-white/55 hover:text-white/80 hover:bg-white/5 hover:pl-5'
                            }`}
                    >
                        {value === option.value && (
                            <span className="zen-kanji text-xs" style={{ color: 'var(--matcha)', opacity: 0.6 }}>✓</span>
                        )}
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Hidden input for form */}
            <input type="hidden" value={value} />
        </div>
    )
}

export const ContactForm: React.FC = () => {
    const { register, handleSubmit, setValue, watch, reset } = useForm<ContactFormInputs>()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const topicValue = watch('topic', '')

    const onSubmit = async (data: ContactFormInputs) => {
        setIsSubmitting(true)
        try {
            const res = await fetch('/api/contact-submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData?.errors?.[0]?.message || 'Gửi thất bại')
            }

            toast.success('Gửi liên hệ thành công!', {
                description: 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.',
                duration: 5000,
            })
            reset()
            setValue('topic', '')
        } catch (error) {
            toast.error('Không thể gửi tin nhắn', {
                description: 'Vui lòng thử lại hoặc liên hệ qua Hotline / Zalo.',
                duration: 5000,
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <input
                    type="text"
                    placeholder="Họ tên"
                    {...register('fullName', { required: true })}
                    className="w-full px-4 py-3.5 border border-white/15 bg-white/5 backdrop-blur-sm outline-none focus:border-white/30 text-sm text-white placeholder:text-white/30 font-light tracking-wide transition-all duration-300"
                    style={{ borderRadius: '2px' }}
                />
                <input
                    type="tel"
                    placeholder="Số điện thoại"
                    {...register('phone', { required: true })}
                    className="w-full px-4 py-3.5 border border-white/15 bg-white/5 backdrop-blur-sm outline-none focus:border-white/30 text-sm text-white placeholder:text-white/30 font-light tracking-wide transition-all duration-300"
                    style={{ borderRadius: '2px' }}
                />
            </div>
            <input
                type="email"
                placeholder="Email"
                {...register('email', { required: true })}
                className="w-full px-4 py-3.5 border border-white/15 bg-white/5 backdrop-blur-sm outline-none focus:border-white/30 text-sm text-white placeholder:text-white/30 font-light tracking-wide transition-all duration-300"
                style={{ borderRadius: '2px' }}
            />

            {/* Custom Zen Select — thay thế native select */}
            <input type="hidden" {...register('topic', { required: true })} />
            <ZenSelect
                value={topicValue}
                onChange={(v) => setValue('topic', v)}
            />

            <textarea
                placeholder="Nội dung tin nhắn..."
                rows={4}
                {...register('message', { required: true })}
                className="w-full px-4 py-3.5 border border-white/15 bg-white/5 backdrop-blur-sm outline-none focus:border-white/30 text-sm text-white placeholder:text-white/30 font-light tracking-wide transition-all duration-300 resize-none"
                style={{ borderRadius: '2px' }}
            />
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 text-white text-[12px] font-light tracking-[0.15em] uppercase border border-white/15 hover:border-white/30 transition-all duration-500 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderRadius: '2px', background: 'linear-gradient(135deg, rgba(107,122,94,0.3) 0%, rgba(196,160,85,0.2) 100%)' }}
            >
                {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang gửi...
                    </span>
                ) : (
                    <>
                        Gửi tin nhắn
                        <svg className="w-3.5 h-3.5 inline-block ml-2 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                    </>
                )}
            </button>
        </form>
    )
}
