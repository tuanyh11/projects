import type { PaymentAdapter, PaymentAdapterClient } from '@payloadcms/plugin-ecommerce/types'
import { randomBytes } from 'crypto'

export const codAdapter = (): PaymentAdapter => {
    return {
        name: 'cod',
        label: 'Thanh toán khi nhận hàng (COD)',
        group: {
            name: 'cod',
            type: 'group',
            admin: {
                condition: (data) => data?.paymentMethod === 'cod',
            },
            fields: [
                {
                    name: 'codToken',
                    type: 'text',
                    label: 'COD Trans Token',
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
                throw new Error('Cart is empty or not provided.')
            }

            if (!customerEmail || typeof customerEmail !== 'string') {
                throw new Error('A valid customer email is required.')
            }

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

            // Generate a unique token for this intent
            const token = 'cod_' + randomBytes(16).toString('hex')

            // Create pending transaction in db
            await payload.create({
                collection: transactionsSlug as any,
                data: {
                    ...(req.user ? { customer: req.user.id } : { customerEmail }),
                    amount: amount || 0,
                    billingAddress,
                    cart: cart.id as any,
                    currency: currency.toUpperCase(),
                    items: flattenedCart as any,
                    paymentMethod: 'cod',
                    status: 'pending',
                    cod: {
                        codToken: token,
                    },
                },
            } as any)

            return {
                clientSecret: token,
                message: 'Payment initialized successfully',
                paymentIntentID: token,
                // We will pass shippingAddress forward as well
                shippingAddressAsJSON: JSON.stringify(shippingAddress),
            }
        },
        confirmOrder: async ({ cartsSlug = 'carts', data, ordersSlug = 'orders', req, transactionsSlug = 'transactions' }) => {
            const payload = req.payload
            const customerEmail = data.customerEmail
            const paymentIntentID = data.paymentIntentID
            const shippingAddressFromIntent = data.shippingAddressAsJSON
                ? JSON.parse(data.shippingAddressAsJSON)
                : undefined

            const transactionsResults: any = await payload.find({
                collection: transactionsSlug as any,
                where: {
                    'cod.codToken': {
                        equals: paymentIntentID,
                    },
                },
            } as any)

            const transaction = transactionsResults.docs[0]
            if (!transaction) {
                throw new Error('No transaction found for the provided Payment Intent ID')
            }

            // Fetch the cart items from the transaction and remove IDs
            const cartItemsSnapshot = (transaction.items || []).map((item: any) => {
                const { id, ...rest } = item
                if (rest.product && typeof rest.product === 'object') rest.product = rest.product.id
                if (rest.variant && typeof rest.variant === 'object') rest.variant = rest.variant.id
                return rest
            })

            // Create order
            const order: any = await payload.create({
                collection: ordersSlug as any,
                data: {
                    amount: transaction.amount,
                    currency: transaction.currency?.toUpperCase() || 'VND',
                    ...(req.user ? { customer: req.user.id } : { customerEmail }),
                    items: cartItemsSnapshot as any,
                    shippingAddress: shippingAddressFromIntent,
                    status: 'pending', // Chờ shop xác nhận
                    transactions: [transaction.id] as any,
                },
            } as any)

            // Mark cart as purchased
            const timestamp = new Date().toISOString()
            const cartID = typeof transaction.cart === 'object' ? transaction.cart.id : transaction.cart
            if (cartID) {
                await payload.update({
                    id: cartID as string,
                    collection: cartsSlug as any,
                    data: {
                        purchasedAt: timestamp,
                    },
                } as any)
            }

            // Mark transaction as succeeded (because COD confirms order before cash is given)
            await payload.update({
                id: transaction.id as string,
                collection: transactionsSlug as any,
                data: {
                    order: order.id,
                    status: 'succeeded',
                },
            } as any)

            return {
                message: 'Order confirmed successfully',
                orderID: order.id,
                transactionID: transaction.id,
            }
        },
    }
}

export const codAdapterClient = (): PaymentAdapterClient => {
    return {
        name: 'cod',
        confirmOrder: true,
        initiatePayment: true,
        label: 'Thanh toán khi nhận hàng (COD)',
    }
}
