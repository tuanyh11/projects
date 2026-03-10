import axios from 'axios'
import type { CollectionAfterChangeHook } from 'payload'

export const notifyTelegramOnNewOrder: CollectionAfterChangeHook = async ({
    doc,
    operation,
    req,
}) => {
    // Only trigger on order creation
    if (operation === 'create') {
        const token = process.env.TELEGRAM_BOT_TOKEN
        const chatId = process.env.TELEGRAM_CHAT_ID

        // Don't error out if config is missing, just skip the notification
        if (!token || !chatId) {
            req.payload.logger.warn('Missing Telegram Bot Token or Chat ID. Skipping notification...')
            return doc
        }

        const { id, amount, currency, customerEmail, shippingAddress } = doc

        // Safely parse address info
        const fullAddress = shippingAddress
            ? [shippingAddress.addressLine1, shippingAddress.addressLine2, shippingAddress.city, shippingAddress.state, shippingAddress.country].filter(Boolean).join(', ')
            : 'Không có địa chỉ'

        const phone = shippingAddress?.phone || 'N/A'
        const emailToUse = customerEmail || (typeof doc.customer === 'object' ? doc.customer?.email : undefined) || 'Khách vãng lai'
        const displayAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency || 'VND' }).format(amount || 0)

        const message = `
🎉 <b>Có Đơn Đặt Hàng Mới!</b>
🆔 <b>Mã Đơn:</b> #${id || 'KXĐ'}
📧 <b>Khách hàng:</b> ${emailToUse}
☎️ <b>SĐT:</b> ${phone}
💰 <b>Tổng tiền:</b> ${displayAmount}
📍 <b>Địa chỉ:</b> ${fullAddress}
    `.trim()

        try {
            await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            req.payload.logger.info(`Successfully sent Telegram notification for order: ${id}`)
        } catch (error) {
            req.payload.logger.error(`Failed to send Telegram notification: ${error}`)
        }
    }

    return doc
}
