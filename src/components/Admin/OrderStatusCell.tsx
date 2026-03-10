'use client'

import React from 'react';

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
    pending: { label: 'Chờ xử lý', bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
    processing: { label: 'Đang xử lý', bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
    shipped: { label: 'Đang giao hàng', bg: '#E0E7FF', text: '#3730A3', border: '#A5B4FC' },
    completed: { label: 'Hoàn thành', bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
    cancelled: { label: 'Đã hủy', bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
    refunded: { label: 'Hoàn tiền', bg: '#F3E8FF', text: '#6B21A8', border: '#C4B5FD' },
}

export const OrderStatusCell: React.FC<{ cellData: string }> = ({ cellData }) => {
    const status = cellData || 'pending'
    const config = statusConfig[status] || statusConfig.pending

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                backgroundColor: config.bg,
                color: config.text,
                border: `1px solid ${config.border}`,
                whiteSpace: 'nowrap',
            }}
        >
            <span
                style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: config.text,
                    opacity: 0.7,
                }}
            />
            {config.label}
        </span>
    )
}
