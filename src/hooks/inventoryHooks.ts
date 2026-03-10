/**
 * Hook hoàn lại tồn kho khi đơn hàng bị hủy.
 * 
 * LƯU Ý: Plugin @payloadcms/plugin-ecommerce đã TỰ ĐỘNG trừ inventory
 * trong confirmOrder endpoint. KHÔNG cần hook deductInventory riêng.
 * 
 * Hook này chỉ xử lý hoàn kho khi hủy đơn.
 */

export const restoreInventoryOnCancel = async ({ doc, previousDoc, operation, req }: any) => {
    if (operation !== 'update') return doc

    // Chỉ hoàn khi chuyển sang cancelled từ trạng thái khác
    if (doc.status !== 'cancelled' || previousDoc?.status === 'cancelled') return doc

    const items = doc.items
    if (!items || !Array.isArray(items) || items.length === 0) return doc

    const { payload } = req

    for (const item of items) {
        const productId = typeof item.product === 'object' ? item.product?.id : item.product
        const variantId = typeof item.variant === 'object' ? item.variant?.id : item.variant
        const qty = item.quantity || 1

        if (!productId) continue

        try {
            if (variantId) {
                const variant = await payload.findByID({
                    collection: 'variants',
                    id: variantId,
                    depth: 0,
                })
                const currentStock = variant.inventory ?? 0
                const newStock = currentStock + qty

                await payload.update({
                    collection: 'variants',
                    id: variantId,
                    data: { inventory: newStock },
                })

                console.log(`[Inventory] ↩ Hoàn lại Variant #${variantId}: ${currentStock} → ${newStock} (+${qty})`)
            } else {
                const product = await payload.findByID({
                    collection: 'products',
                    id: productId,
                    depth: 0,
                })
                const currentStock = product.inventory ?? 0
                const newStock = currentStock + qty

                await payload.update({
                    collection: 'products',
                    id: productId,
                    data: { inventory: newStock },
                })

                console.log(`[Inventory] ↩ Hoàn lại Product #${productId}: ${currentStock} → ${newStock} (+${qty})`)
            }
        } catch (err: any) {
            console.error(`[Inventory] Lỗi hoàn tồn kho cho product #${productId}:`, err.message)
        }
    }

    return doc
}
