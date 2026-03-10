import { syncGHNOrder } from '@/hooks/syncGHNOrder'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/**
 * Admin API — Quản lý trạng thái đơn hàng theo flow TikTok Shop
 *
 * PATCH /api/admin/orders/[id]/status
 * Body: { action: 'confirm' | 'ship' | 'complete' | 'cancel' }
 *
 * Flow: pending → processing → shipped → completed
 *       pending → cancelled
 *       processing → cancelled
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params
        const headers = await getHeaders()
        const payload = await getPayload({ config: configPromise })
        const { user } = await payload.auth({ headers })

        // Chỉ admin mới được thao tác
        if (!user || !(user as any).roles?.includes('admin')) {
            return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 })
        }

        const body = await req.json()
        const { action } = body as { action: string }

        if (!['confirm', 'ship', 'complete', 'cancel'].includes(action)) {
            return NextResponse.json(
                { error: 'Action không hợp lệ. Chấp nhận: confirm, ship, complete, cancel' },
                { status: 400 },
            )
        }

        // Lấy đơn hàng
        const order = await payload.findByID({
            collection: 'orders',
            id,
            depth: 2,
        }) as any

        if (!order) {
            return NextResponse.json({ error: 'Không tìm thấy đơn hàng.' }, { status: 404 })
        }

        const currentStatus = order.status

        // ═══ ACTION: confirm — pending → processing ═══
        if (action === 'confirm') {
            if (currentStatus !== 'pending') {
                return NextResponse.json(
                    { error: `Chỉ có thể xác nhận đơn ở trạng thái "Chờ xử lý". Hiện tại: "${currentStatus}"` },
                    { status: 400 },
                )
            }

            await payload.update({
                collection: 'orders',
                id,
                data: { status: 'processing' } as any,
            })

            return NextResponse.json({
                success: true,
                message: 'Đã xác nhận đơn hàng.',
                status: 'processing',
            })
        }

        // ═══ ACTION: ship — processing → shipped + tạo đơn GHN ═══
        if (action === 'ship') {
            if (currentStatus !== 'processing') {
                return NextResponse.json(
                    { error: `Chỉ có thể gửi hàng khi đơn ở trạng thái "Đang xử lý". Hiện tại: "${currentStatus}"` },
                    { status: 400 },
                )
            }

            if (order.trackingCode) {
                return NextResponse.json(
                    { error: `Đơn đã có mã vận đơn: ${order.trackingCode}` },
                    { status: 400 },
                )
            }

            // Cập nhật status → shipped
            await payload.update({
                collection: 'orders',
                id,
                data: { status: 'shipped' } as any,
            })

            // Gọi syncGHNOrder để tạo đơn vận chuyển
            try {
                await syncGHNOrder({
                    doc: { ...order, status: 'shipped' },
                    previousDoc: order,
                    req: { payload },
                })
            } catch (ghnError) {
                console.error('[Admin Ship] Lỗi tạo đơn GHN:', ghnError)
                // Vẫn trả success vì order đã chuyển shipped, GHN có thể retry
            }

            return NextResponse.json({
                success: true,
                message: 'Đã gửi hàng và tạo đơn vận chuyển GHN.',
                status: 'shipped',
            })
        }

        // ═══ ACTION: complete — shipped → completed ═══
        if (action === 'complete') {
            if (currentStatus !== 'shipped') {
                return NextResponse.json(
                    { error: `Chỉ có thể hoàn thành đơn ở trạng thái "Đang giao". Hiện tại: "${currentStatus}"` },
                    { status: 400 },
                )
            }

            await payload.update({
                collection: 'orders',
                id,
                data: { status: 'completed' } as any,
            })

            return NextResponse.json({
                success: true,
                message: 'Đơn hàng đã hoàn thành.',
                status: 'completed',
            })
        }

        // ═══ ACTION: cancel — pending/processing → cancelled ═══
        if (action === 'cancel') {
            if (!['pending', 'processing'].includes(currentStatus)) {
                return NextResponse.json(
                    { error: `Không thể hủy đơn ở trạng thái "${currentStatus}". Chỉ hủy được khi "Chờ xử lý" hoặc "Đang xử lý".` },
                    { status: 400 },
                )
            }

            await payload.update({
                collection: 'orders',
                id,
                data: { status: 'cancelled' } as any,
            })

            return NextResponse.json({
                success: true,
                message: 'Đã hủy đơn hàng.',
                status: 'cancelled',
            })
        }

        return NextResponse.json({ error: 'Action không hợp lệ.' }, { status: 400 })
    } catch (err) {
        console.error('[Admin Order Status]', err)
        return NextResponse.json({ error: 'Lỗi hệ thống.' }, { status: 500 })
    }
}
