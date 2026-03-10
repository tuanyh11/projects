'use client'

import { useState } from 'react'

export function CancelOrderSection({ orderId }: { orderId: string | number }) {
    const [showDialog, setShowDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [cancelled, setCancelled] = useState(false)

    const handleCancel = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/orders/${orderId}/cancel`, {
                method: 'PATCH',
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Lỗi khi hủy đơn hàng.')
                setLoading(false)
                return
            }
            setCancelled(true)
            setShowDialog(false)
            setLoading(false)
            window.location.reload()
        } catch {
            setError('Lỗi kết nối. Vui lòng thử lại.')
            setLoading(false)
        }
    }

    if (cancelled) return null

    return (
        <div
            className="border border-border/20 px-6 py-5 md:px-8 md:py-6 flex items-center justify-between gap-4"
            style={{ borderRadius: '2px', background: 'rgba(160,102,75,0.03)' }}
        >
            <p
                className="text-xs font-light tracking-wide text-foreground/60"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
                Bạn có thể hủy đơn trước khi shop gửi hàng
            </p>

            {!showDialog ? (
                <button
                    onClick={() => { setError(null); setShowDialog(true) }}
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-[11px] font-light tracking-widest uppercase border transition-all duration-300 hover:opacity-80"
                    style={{
                        borderRadius: '2px',
                        borderColor: 'rgba(160,102,75,0.3)',
                        color: '#a0664b',
                        fontFamily: "'Noto Serif JP', serif",
                    }}
                >
                    ✕ Hủy đơn hàng
                </button>
            ) : (
                <div className="flex items-center gap-2">
                    {error && (
                        <span className="text-[11px]" style={{ color: '#a0664b' }}>{error}</span>
                    )}
                    <button
                        onClick={() => setShowDialog(false)}
                        disabled={loading}
                        className="px-3 py-2 text-[11px] font-light tracking-widest uppercase border border-border/40 text-foreground/60 transition-all duration-300 disabled:opacity-40"
                        style={{ borderRadius: '2px', fontFamily: "'Noto Serif JP', serif" }}
                    >
                        Giữ lại
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-3 py-2 text-[11px] font-light tracking-widest uppercase transition-all duration-300 disabled:opacity-50"
                        style={{
                            borderRadius: '2px',
                            fontFamily: "'Noto Serif JP', serif",
                            background: 'rgba(160,102,75,0.85)',
                            color: '#fff',
                            border: '1px solid transparent',
                        }}
                    >
                        {loading ? 'Đang hủy...' : 'Xác nhận hủy'}
                    </button>
                </div>
            )}
        </div>
    )
}
