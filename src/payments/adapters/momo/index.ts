import type { PaymentAdapter, PaymentAdapterClient } from '@payloadcms/plugin-ecommerce/types'
import crypto, { randomBytes } from 'crypto'

// ─── MoMo Helpers ─────────────────────────────────────────────────

/**
 * Tạo chữ ký HMAC-SHA256 cho MoMo
 * rawSignature phải có thứ tự các trường đúng như tài liệu MoMo
 */
function createMoMoSignature(rawSignature: string, secretKey: string): string {
    return crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex')
}

export interface MoMoPaymentResponse {
    partnerCode: string
    requestId: string
    orderId: string
    amount: number
    responseTime: number
    message: string
    resultCode: number
    payUrl: string
    deeplink?: string
    qrCodeUrl?: string
}

/**
 * Gọi MoMo API để tạo payment URL
 * Sử dụng requestType = 'payWithMethod' (phương thức mặc định MoMo v2)
 */
export async function createMoMoPaymentUrl({
    partnerCode,
    accessKey,
    secretKey,
    momoEndpoint,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    requestId,
}: {
    partnerCode: string
    accessKey: string
    secretKey: string
    momoEndpoint: string
    amount: number
    orderId: string
    orderInfo: string
    redirectUrl: string
    ipnUrl: string
    requestId: string
}): Promise<MoMoPaymentResponse> {
    const extraData = '' // base64 encoded extra data, để trống nếu không cần
    const requestType = 'payWithMethod'

    // Thứ tự các field phải đúng theo tài liệu MoMo
    const rawSignature = [
        `accessKey=${accessKey}`,
        `amount=${amount}`,
        `extraData=${extraData}`,
        `ipnUrl=${ipnUrl}`,
        `orderId=${orderId}`,
        `orderInfo=${orderInfo}`,
        `partnerCode=${partnerCode}`,
        `redirectUrl=${redirectUrl}`,
        `requestId=${requestId}`,
        `requestType=${requestType}`,
    ].join('&')

    const signature = createMoMoSignature(rawSignature, secretKey)

    const body = {
        partnerCode,
        accessKey,
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        lang: 'vi',
        extraData,
        requestType,
        signature,
    }

    const response = await fetch(`${momoEndpoint}/v2/gateway/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })

    if (!response.ok) {
        throw new Error(`MoMo API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    if (result.resultCode !== 0) {
        throw new Error(`MoMo payment failed: ${result.message} (code: ${result.resultCode})`)
    }

    return result as MoMoPaymentResponse
}

/**
 * Verify chữ ký từ MoMo IPN/Return callback
 */
export function verifyMoMoSignature(
    params: Record<string, string | number>,
    secretKey: string,
    receivedSignature: string,
): boolean {
    const {
        accessKey,
        amount,
        extraData,
        message,
        orderId,
        orderInfo,
        orderType,
        partnerCode,
        payType,
        requestId,
        responseTime,
        resultCode,
        transId,
    } = params as Record<string, string>

    const rawSignature = [
        `accessKey=${accessKey}`,
        `amount=${amount}`,
        `extraData=${extraData}`,
        `message=${message}`,
        `orderId=${orderId}`,
        `orderInfo=${orderInfo}`,
        `orderType=${orderType}`,
        `partnerCode=${partnerCode}`,
        `payType=${payType}`,
        `requestId=${requestId}`,
        `responseTime=${responseTime}`,
        `resultCode=${resultCode}`,
        `transId=${transId}`,
    ].join('&')

    const computedSignature = createMoMoSignature(rawSignature, secretKey)
    return computedSignature === receivedSignature
}

// ─── MoMo Adapter (Server) ─────────────────────────────────────────

export const momoAdapter = (): PaymentAdapter => {
    return {
        name: 'momo',
        label: 'Thanh toán qua MoMo',
        group: {
            name: 'momo',
            type: 'group',
            admin: {
                condition: (data) => data?.paymentMethod === 'momo',
            },
            fields: [
                {
                    name: 'momoOrderId',
                    type: 'text',
                    label: 'MoMo Order ID',
                },
                {
                    name: 'momoTransId',
                    type: 'text',
                    label: 'MoMo Transaction ID',
                },
                {
                    name: 'momoPayType',
                    type: 'text',
                    label: 'Phương thức thanh toán MoMo',
                },
                {
                    name: 'momoResultCode',
                    type: 'text',
                    label: 'Mã kết quả MoMo',
                },
            ],
        },

        initiatePayment: async ({ data, req, transactionsSlug }) => {
            const payload = req.payload
            const { customerEmail, currency, cart } = data
            const amount = cart.subtotal
            const billingAddress = data.billingAddress
            const shippingAddress = data.shippingAddress

            if (!cart || !cart.items || cart.items.length === 0) {
                throw new Error('Giỏ hàng trống.')
            }
            if (!customerEmail || typeof customerEmail !== 'string') {
                throw new Error('Vui lòng cung cấp email hợp lệ.')
            }

            const partnerCode = process.env.MOMO_PARTNER_CODE
            const accessKey = process.env.MOMO_ACCESS_KEY
            const secretKey = process.env.MOMO_SECRET_KEY
            const momoEndpoint =
                process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn'
            const serverUrl =
                process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

            if (!partnerCode || !accessKey || !secretKey) {
                throw new Error('MoMo chưa được cấu hình. Vui lòng liên hệ admin.')
            }

            const flattenedCart = cart.items.map((item) => {
                const productID =
                    typeof item.product === 'object' ? item.product.id : item.product
                const variantID = item.variant
                    ? typeof item.variant === 'object'
                        ? item.variant.id
                        : item.variant
                    : undefined
                const { product: _p, variant: _v, id: _id, ...rest } = item as any
                return {
                    ...rest,
                    product: productID as any,
                    quantity: item.quantity,
                    ...(variantID ? { variant: variantID as any } : {}),
                }
            })

            // Tạo mã đơn hàng và requestId duy nhất
            const orderId = `MOMO${Date.now()}`
            const requestId = `REQ${randomBytes(8).toString('hex')}`

            // Lưu transaction pending — bao gồm shippingAddress để confirmOrder lấy lại được
            await payload.create({
                collection: transactionsSlug as any,
                data: {
                    ...(req.user ? { customer: req.user.id } : { customerEmail }),
                    amount: amount || 0,
                    billingAddress,
                    shippingAddress,
                    cart: cart.id as any,
                    currency: currency.toUpperCase(),
                    items: flattenedCart as any,
                    paymentMethod: 'momo',
                    status: 'pending',
                    momo: {
                        momoOrderId: orderId,
                    },
                },
            } as any)

            // URL MoMo gọi sau khi thanh toán (IPN + redirect)
            const ipnUrl = `${serverUrl}/api/momo/ipn`
            const redirectUrl = `${serverUrl}/api/momo/ipn`

            // Gọi MoMo API tạo payment URL
            const momoResponse = await createMoMoPaymentUrl({
                partnerCode,
                accessKey,
                secretKey,
                momoEndpoint,
                amount: Math.round(amount || 0), // MoMo nhận số nguyên VND
                orderId,
                orderInfo: `Thanh toan don hang ${orderId}`,
                redirectUrl,
                ipnUrl,
                requestId,
            })

            return {
                clientSecret: orderId,
                paymentIntentID: orderId,
                paymentUrl: momoResponse.payUrl,
                qrCodeUrl: momoResponse.qrCodeUrl,
                shippingAddressAsJSON: JSON.stringify(shippingAddress),
                message: 'Khởi tạo thanh toán MoMo thành công',
            }
        },

        confirmOrder: async ({
            cartsSlug = 'carts',
            data,
            ordersSlug = 'orders',
            req,
            transactionsSlug = 'transactions',
        }) => {
            const payload = req.payload
            const customerEmail = data.customerEmail
            const paymentIntentID = data.paymentIntentID   // momoOrderId
            const momoTransId = data.momoTransId
            const momoPayType = data.momoPayType
            const momoResultCode = data.momoResultCode

            // Tìm transaction bằng momoOrderId
            const transactionsResults: any = await payload.find({
                collection: transactionsSlug as any,
                where: {
                    'momo.momoOrderId': {
                        equals: paymentIntentID,
                    },
                },
            } as any)

            const transaction = transactionsResults.docs[0]
            if (!transaction) {
                throw new Error('Không tìm thấy giao dịch MoMo.')
            }

            // Snapshot giỏ hàng
            const cartItemsSnapshot = (transaction.items || []).map((item: any) => {
                const { id, ...rest } = item
                if (rest.product && typeof rest.product === 'object')
                    rest.product = rest.product.id
                if (rest.variant && typeof rest.variant === 'object')
                    rest.variant = rest.variant.id
                return rest
            })

            // Lấy shippingAddress từ transaction (đã lưu khi initiatePayment)
            const shippingAddress =
                transaction.shippingAddress ||
                (data.shippingAddressAsJSON ? JSON.parse(data.shippingAddressAsJSON) : undefined)

            // Tạo đơn hàng — shippingAddress đầy đủ để syncGHNOrder hoạt động
            const order: any = await payload.create({
                collection: ordersSlug as any,
                data: {
                    amount: transaction.amount,
                    currency: transaction.currency?.toUpperCase() || 'VND',
                    ...(req.user ? { customer: req.user.id } : { customerEmail }),
                    items: cartItemsSnapshot as any,
                    shippingAddress,
                    status: 'pending',
                    transactions: [transaction.id] as any,
                },
            } as any)

            // Đánh dấu giỏ hàng đã mua
            const timestamp = new Date().toISOString()
            const cartID =
                typeof transaction.cart === 'object'
                    ? transaction.cart.id
                    : transaction.cart
            if (cartID) {
                await payload.update({
                    id: cartID as string,
                    collection: cartsSlug as any,
                    data: { purchasedAt: timestamp },
                } as any)
            }

            // Cập nhật transaction: succeeded + thông tin MoMo
            await payload.update({
                id: transaction.id as string,
                collection: transactionsSlug as any,
                data: {
                    order: order.id,
                    status: 'succeeded',
                    momo: {
                        ...transaction.momo,
                        momoTransId: momoTransId || '',
                        momoPayType: momoPayType || '',
                        momoResultCode: momoResultCode || '0',
                    },
                },
            } as any)

            return {
                message: 'Đặt hàng thành công qua MoMo',
                orderID: order.id,
                transactionID: transaction.id,
            }
        },
    }
}

// ─── MoMo Adapter Client ──────────────────────────────────────────

export const momoAdapterClient = (): PaymentAdapterClient => {
    return {
        name: 'momo',
        confirmOrder: true,
        initiatePayment: true,
        label: 'Thanh toán qua MoMo',
    }
}
