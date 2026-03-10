import type { PaymentAdapter, PaymentAdapterClient } from '@payloadcms/plugin-ecommerce/types'
import { HashAlgorithm, ProductCode, VNPay, VnpLocale, ignoreLogger } from 'vnpay'

// ─── VNPay Instance Factory ────────────────────────────────────────

function createVNPayInstance(tmnCode: string, secureSecret: string): VNPay {
    return new VNPay({
        tmnCode,
        secureSecret,
        vnpayHost: 'https://sandbox.vnpayment.vn',
        testMode: true,
        hashAlgorithm: HashAlgorithm.SHA512,
        enableLog: false,
        loggerFn: ignoreLogger,
    })
}

// ─── IP Helper ────────────────────────────────────────────────────

function normalizeIp(rawIp: string): string {
    if (!rawIp || rawIp === '::1' || rawIp === '::ffff:127.0.0.1') return '127.0.0.1'
    if (rawIp.startsWith('::ffff:')) return rawIp.replace('::ffff:', '')
    return rawIp
}


// ─── VNPay Adapter (Server) ────────────────────────────────────────

export const vnpayAdapter = (): PaymentAdapter => {
    return {
        name: 'vnpay',
        label: 'Thanh toán qua VNPay',
        group: {
            name: 'vnpay',
            type: 'group',
            admin: {
                condition: (data) => data?.paymentMethod === 'vnpay',
            },
            fields: [
                {
                    name: 'vnpayTxnRef',
                    type: 'text',
                    label: 'VNPay Mã giao dịch',
                },
                {
                    name: 'vnpayTransactionNo',
                    type: 'text',
                    label: 'VNPay Transaction No',
                },
                {
                    name: 'vnpayBankCode',
                    type: 'text',
                    label: 'Ngân hàng',
                },
                {
                    name: 'vnpayResponseCode',
                    type: 'text',
                    label: 'Mã phản hồi VNPay',
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

            const tmnCode = process.env.VNPAY_TMN_CODE
            const secureSecret = process.env.VNPAY_HASH_SECRET
            const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
            const returnBaseUrl = process.env.VNPAY_RETURN_URL || serverUrl

            if (!tmnCode || !secureSecret) {
                throw new Error('VNPay chưa được cấu hình. Vui lòng liên hệ admin.')
            }

            const vnpay = createVNPayInstance(tmnCode, secureSecret)

            const flattenedCart = cart.items.map((item) => {
                const productID = typeof item.product === 'object' ? item.product.id : item.product
                const variantID = item.variant
                    ? typeof item.variant === 'object'
                        ? item.variant.id
                        : item.variant
                    : undefined
                const { product: _p, variant: _v, id: _id, ...customProperties } = item as any
                return {
                    ...customProperties,
                    product: productID as any,
                    quantity: item.quantity,
                    ...(variantID ? { variant: variantID as any } : {}),
                }
            })

            // Tạo mã giao dịch duy nhất
            const txnRef = `VNP${Date.now()}`

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
                    paymentMethod: 'vnpay',
                    status: 'pending',
                    vnpay: {
                        vnpayTxnRef: txnRef,
                    },
                },
            } as any)

            // Lấy IP của người dùng — VNPay chỉ chấp nhận IPv4
            const rawIp =
                (req.headers?.get?.('x-forwarded-for') as string)?.split(',')[0]?.trim() ||
                (req as any).ip ||
                '127.0.0.1'
            const ipAddr = normalizeIp(rawIp)

            const returnUrl = `${returnBaseUrl}/api/vnpay/ipn`

            // Dùng thư viện vnpay để tạo payment URL
            const paymentUrl = vnpay.buildPaymentUrl({
                vnp_Amount: Math.round(amount || 0),
                vnp_IpAddr: ipAddr,
                vnp_ReturnUrl: returnUrl,
                vnp_TxnRef: txnRef,
                vnp_OrderInfo: `Thanh toan don hang ${txnRef}`,
                vnp_OrderType: ProductCode.Other,
                vnp_Locale: VnpLocale.VN,
            })

            return {
                clientSecret: txnRef,
                paymentIntentID: txnRef,
                paymentUrl,
                shippingAddressAsJSON: JSON.stringify(shippingAddress),
                message: 'Khởi tạo thanh toán VNPay thành công',
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
            const paymentIntentID = data.paymentIntentID
            const vnpayTransactionNo = data.vnpayTransactionNo
            const vnpayBankCode = data.vnpayBankCode
            const vnpayResponseCode = data.vnpayResponseCode

            // Tìm transaction bằng txnRef
            const transactionsResults: any = await payload.find({
                collection: transactionsSlug as any,
                where: {
                    'vnpay.vnpayTxnRef': {
                        equals: paymentIntentID,
                    },
                },
            } as any)

            const transaction = transactionsResults.docs[0]
            if (!transaction) {
                throw new Error('Không tìm thấy giao dịch VNPay.')
            }

            // Lấy shippingAddress: ưu tiên từ transaction (đã lưu khi initiatePayment)
            // Fallback sang additionalData nếu có
            const shippingAddress =
                transaction.shippingAddress ||
                (data.shippingAddressAsJSON ? JSON.parse(data.shippingAddressAsJSON) : undefined)

            // Snapshot giỏ hàng
            const cartItemsSnapshot = (transaction.items || []).map((item: any) => {
                const { id, ...rest } = item
                if (rest.product && typeof rest.product === 'object') rest.product = rest.product.id
                if (rest.variant && typeof rest.variant === 'object') rest.variant = rest.variant.id
                return rest
            })

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
            const cartID = typeof transaction.cart === 'object' ? transaction.cart.id : transaction.cart
            if (cartID) {
                await payload.update({
                    id: cartID as string,
                    collection: cartsSlug as any,
                    data: { purchasedAt: timestamp },
                } as any)
            }

            // Cập nhật transaction: succeeded + thông tin VNPay
            await payload.update({
                id: transaction.id as string,
                collection: transactionsSlug as any,
                data: {
                    order: order.id,
                    status: 'succeeded',
                    vnpay: {
                        ...transaction.vnpay,
                        vnpayTransactionNo: vnpayTransactionNo || '',
                        vnpayBankCode: vnpayBankCode || '',
                        vnpayResponseCode: vnpayResponseCode || '00',
                    },
                },
            } as any)

            return {
                message: 'Đặt hàng thành công qua VNPay',
                orderID: order.id,
                transactionID: transaction.id,
            }
        },
    }
}

// ─── VNPay Adapter Client ──────────────────────────────────────────

export const vnpayAdapterClient = (): PaymentAdapterClient => {
    return {
        name: 'vnpay',
        confirmOrder: true,
        initiatePayment: true,
        label: 'Thanh toán qua VNPay',
    }
}
