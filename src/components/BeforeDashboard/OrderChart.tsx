'use client'
import { useMemo } from 'react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

export const OrderChart = ({ orders }: { orders: any[] }) => {
    const chartData = useMemo(() => {
        const grouped = orders.reduce((acc, order) => {
            const date = new Date(order.createdAt).toISOString().split('T')[0]
            if (!acc[date]) acc[date] = 0
            acc[date] += 1
            return acc
        }, {} as Record<string, number>)

        const data = []
        for (let i = 6; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dateStr = d.toISOString().split('T')[0]
            data.push({
                date: new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                'Đơn hàng': grouped[dateStr] || 0,
            })
        }
        return data
    }, [orders])

    return (
        <div className="chart-container">
            <h3 className="chart-title">Đơn hàng 7 ngày qua</h3>
            <div style={{ width: '100%', height: '260px' }}>
                <ResponsiveContainer>
                    <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            stroke="#a3a3a3"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#a3a3a3"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#ededed"
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '8px',
                                border: '1px solid #ededed',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                                fontSize: '13px',
                                background: '#fff',
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="Đơn hàng"
                            stroke="#2563eb"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorOrders)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
