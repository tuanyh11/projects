'use client'

import { useAuth } from '@/providers/Auth'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface HomeQuickAddProps {
    productId: string
    productSlug: string
}

export function HomeQuickAddButton({ productId, productSlug }: HomeQuickAddProps) {
    const { user } = useAuth()
    const { addItem } = useCart()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    return (
        <button
            type="button"
            aria-label="Thêm vào giỏ hàng"
            className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-500 ease-out z-20 cursor-pointer border border-white/30 bg-black/20 backdrop-blur-md hover:bg-white/20 hover:border-white/50"
            style={{ borderRadius: '2px' }}
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()

                if (!user) {
                    toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.')
                    router.push(`/login?redirect=/products/${productSlug}`)
                    return
                }

                setLoading(true)
                addItem({ product: productId }, 1)
                    .then(() => {
                        toast.success('Đã thêm vào giỏ hàng')
                    })
                    .catch(() => {
                        toast.error('Có lỗi xảy ra, vui lòng thử lại.')
                    })
                    .finally(() => {
                        setLoading(false)
                    })
            }}
        >
            {loading ? (
                <svg className="w-3 h-3 animate-spin text-white/70" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
                </svg>
            ) : (
                <svg className="w-3.5 h-3.5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            )}
        </button>
    )
}
