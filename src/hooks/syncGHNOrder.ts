import { createGHNOrder, type GHNOrderItem } from '@/utilities/ghn'

/**
 * Payload afterChange hook cho collection "orders".
 *
 * Tự động tạo đơn GHN khi đơn hàng mới được tạo hoặc cập nhật
 * mà chưa có mã vận đơn (trackingCode).
 */
export const syncGHNOrder = async ({ doc, previousDoc, req }: any) => {
    // Chỉ đẩy đơn khi chưa có trackingCode & có địa chỉ giao hàng hợp lệ
    const hasTrackingCode = doc?.trackingCode || previousDoc?.trackingCode
    const hasAddress = doc?.shippingAddress?.addressLine1 && doc?.shippingAddress?.district_id && doc?.shippingAddress?.ward_code

    if (hasTrackingCode || !hasAddress) {
        return doc
    }

    try {
        console.log('[GHN] Đang tạo đơn vận chuyển trên Giao Hàng Nhanh...')

        const items: GHNOrderItem[] = (doc.items || []).map((item: any) => ({
            name: typeof item.product === 'object' ? item.product.title : String(item.product),
            quantity: item.quantity ?? 1,
            weight: 200, // gram — cân nặng mặc định mỗi sản phẩm
            price: typeof item.price === 'number' ? item.price : 0,
        }))

        const result = await createGHNOrder({
            client_order_code: String(doc.id),
            to_name: [doc.shippingAddress?.firstName, doc.shippingAddress?.lastName]
                .filter(Boolean)
                .join(' ') || 'Khách hàng',
            to_phone: doc.shippingAddress?.phone || '',
            to_address: doc.shippingAddress?.addressLine1 || '',
            to_district_id: Number(doc.shippingAddress.district_id),
            to_ward_code: String(doc.shippingAddress.ward_code),
            // cod_amount = 0 với VNPay/MoMo (đã thu tiền trước), với COD = tổng đơn
            cod_amount: doc.paymentMethod === 'cod' ? (doc.amount ?? 0) : 0,
            weight: Math.max(items.reduce((sum: number, i: GHNOrderItem) => sum + i.weight * i.quantity, 0), 100),
            length: 15,
            width: 15,
            height: 15,
            items,
        })

        if (result.code === 200 && result.data?.order_code) {
            // Cập nhật tracking code & trạng thái vào đơn hàng Payload
            await req.payload.update({
                collection: 'orders',
                id: doc.id,
                data: {
                    trackingCode: result.data.order_code,
                    ghnStatus: 'ready_to_pick',
                },
            })
            console.log(`[GHN] ✅ Tạo đơn thành công — Mã vận đơn: ${result.data.order_code}`)
        } else {
            console.error(`[GHN] ❌ Lỗi từ API: ${result.message}`)
        }
    } catch (error) {
        console.error('[GHN] ❌ Lỗi kết nối API:', error)
    }

    return doc
}
