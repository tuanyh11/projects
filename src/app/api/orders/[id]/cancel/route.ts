import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

export async function PATCH(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params
        const headers = await getHeaders()
        const payload = await getPayload({ config: configPromise })
        const { user } = await payload.auth({ headers })

        if (!user) {
            return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })
        }

        // Tìm đơn hàng — phải thuộc về user này
        const { docs } = await payload.find({
            collection: 'orders',
            where: {
                and: [
                    { id: { equals: id } },
                    { customer: { equals: user.id } },
                ],
            },
            depth: 0,
        } as any)

        const order = docs[0] as any
        if (!order) {
            return NextResponse.json({ error: 'Không tìm thấy đơn hàng.' }, { status: 404 })
        }

        // Chỉ cho phép hủy khi chưa gửi hàng (pending hoặc processing)
        if (!['pending', 'processing'].includes(order.status)) {
            return NextResponse.json(
                { error: `Không thể hủy đơn hàng ở trạng thái "${order.status}".` },
                { status: 400 },
            )
        }

        // Chặn hủy nếu GHN đã lấy hàng (có trackingCode)
        if (order.trackingCode) {
            return NextResponse.json(
                { error: 'Đơn hàng đã được bàn giao cho đơn vị vận chuyển, không thể hủy.' },
                { status: 400 },
            )
        }

        // Cập nhật trạng thái → cancelled
        await payload.update({
            collection: 'orders',
            id: order.id,
            data: { status: 'cancelled' } as any,
        })

        return NextResponse.json({ success: true, message: 'Đã hủy đơn hàng thành công.' })
    } catch (err) {
        console.error('[Cancel Order]', err)
        return NextResponse.json({ error: 'Lỗi hệ thống.' }, { status: 500 })
    }
}
