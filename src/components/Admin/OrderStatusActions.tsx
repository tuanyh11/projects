'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import React, { useCallback, useState } from 'react'

/**
 * Admin Component — Quản lý trạng thái đơn hàng theo flow TikTok Shop
 *
 * Flow: pending → processing → shipped → completed
 *       pending/processing → cancelled
 */
export const OrderStatusActions: React.FC = () => {
    const { id, initialData } = useDocumentInfo()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [currentStatus, setCurrentStatus] = useState<string | undefined>(undefined)

    // Lấy status từ initialData hoặc state
    const status = currentStatus || (initialData as any)?.status || 'unknown'

    const handleAction = useCallback(async (action: string) => {
        if (!id) return
        setLoading(true)
        setMessage(null)
        setError(null)

        try {
            const res = await fetch(`/api/admin/orders/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ action }),
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Lỗi xử lý')
                setLoading(false)
                return
            }

            setMessage(data.message)
            setCurrentStatus(data.status)
            setLoading(false)

            // Reload trang admin sau 1s để cập nhật dữ liệu
            setTimeout(() => window.location.reload(), 1000)
        } catch {
            setError('Lỗi kết nối server')
            setLoading(false)
        }
    }, [id])

    if (!id) return null

    // Status config
    const statusLabels: Record<string, string> = {
        pending: '🟡 Chờ xử lý',
        processing: '🔵 Đang xử lý',
        shipped: '🚚 Đang giao',
        completed: '✅ Hoàn thành',
        cancelled: '❌ Đã hủy',
    }

    // Xác định actions có thể thực hiện
    const availableActions: { action: string; label: string; color: string; bgColor: string }[] = []

    if (status === 'pending') {
        availableActions.push(
            { action: 'confirm', label: '✓ Xác nhận đơn', color: '#fff', bgColor: '#2563eb' },
            { action: 'cancel', label: '✕ Hủy đơn', color: '#fff', bgColor: '#dc2626' },
        )
    } else if (status === 'processing') {
        availableActions.push(
            { action: 'ship', label: '📦 Gửi hàng (tạo đơn GHN)', color: '#fff', bgColor: '#059669' },
            { action: 'cancel', label: '✕ Hủy đơn', color: '#fff', bgColor: '#dc2626' },
        )
    } else if (status === 'shipped') {
        availableActions.push(
            { action: 'complete', label: '✓ Hoàn thành đơn', color: '#fff', bgColor: '#059669' },
        )
    }

    return (
        <div style={{
            padding: '16px',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '8px',
            background: 'var(--theme-elevation-50)',
            marginBottom: '16px',
        }}>
            {/* Header */}
            <div style={{ marginBottom: '12px' }}>
                <p style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--theme-elevation-500)',
                    marginBottom: '6px',
                    fontWeight: 600,
                }}>
                    Quản lý đơn hàng
                </p>
                <p style={{
                    fontSize: '16px',
                    fontWeight: 600,
                }}>
                    {statusLabels[status] || status}
                </p>
            </div>

            {/* Actions */}
            {availableActions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {availableActions.map(({ action, label, color, bgColor }) => (
                        <button
                            key={action}
                            onClick={() => handleAction(action)}
                            disabled={loading}
                            style={{
                                padding: '10px 16px',
                                fontSize: '13px',
                                fontWeight: 500,
                                color,
                                background: loading ? '#999' : bgColor,
                                border: 'none',
                                borderRadius: '6px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1,
                                transition: 'opacity 0.2s',
                                width: '100%',
                            }}
                        >
                            {loading ? 'Đang xử lý...' : label}
                        </button>
                    ))}
                </div>
            )}

            {/* Khi đã hoàn thành hoặc hủy */}
            {availableActions.length === 0 && (
                <p style={{ fontSize: '13px', color: 'var(--theme-elevation-500)' }}>
                    Đơn hàng đã {status === 'completed' ? 'hoàn thành' : status === 'cancelled' ? 'bị hủy' : 'ở trạng thái cuối'}.
                </p>
            )}

            {/* Messages */}
            {message && (
                <div style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    background: '#dcfce7',
                    color: '#166534',
                    borderRadius: '4px',
                    fontSize: '13px',
                }}>
                    ✓ {message}
                </div>
            )}

            {error && (
                <div style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    background: '#fef2f2',
                    color: '#991b1b',
                    borderRadius: '4px',
                    fontSize: '13px',
                }}>
                    ✕ {error}
                </div>
            )}
        </div>
    )
}
