import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { Plugin } from 'payload'

import { codAdapter } from '@/payments/adapters/cod'
import { momoAdapter } from '@/payments/adapters/momo'
import { vnpayAdapter } from '@/payments/adapters/vnpay'
import { stripeAdapter } from '@payloadcms/plugin-ecommerce/payments/stripe'

import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { isAdmin } from '@/access/isAdmin'
import { isDocumentOwner } from '@/access/isDocumentOwner'
import { ProductsCollection } from '@/collections/Products'
import { restoreInventoryOnCancel } from '@/hooks/inventoryHooks'
import { notifyTelegramOnNewOrder } from '@/hooks/notifyTelegramOnNewOrder'
import { Page, Product } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Ecommerce Template` : 'Payload Ecommerce Template'
}

const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      admin: {
        group: 'Content',
      },
    },
    formOverrides: {
      admin: {
        group: 'Content',
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isDocumentOwner,
    },
    addresses: {
      addressesCollectionOverride: ({ defaultCollection }) => {
        // Override the country field to make it optional
        const modifiedFields = defaultCollection.fields?.map((field) => {
          if ('name' in field && field.name === 'country') {
            return {
              ...field,
              required: false,
              defaultValue: 'VN',
            } as typeof field
          }
          return field
        })

        return {
          ...defaultCollection,
          fields: modifiedFields,
        }
      },
      addressFields: ({ defaultFields }) => {
        // Filter out country field - the plugin will add it back as a select
        // We'll override it in the collection override
        const modifiedFields = defaultFields
          .filter((field) => !('name' in field && field.name === 'country'))
          .map((field) => {
            if ('name' in field && field.name === 'postalCode') {
              return {
                ...field,
                required: false,
              } as typeof field
            }
            return field
          })

        return [
          ...modifiedFields,
          {
            name: 'province_id',
            type: 'number',
            label: 'Mã Tỉnh/Thành (GHN)',
            admin: { readOnly: true, position: 'sidebar' },
          },
          {
            name: 'province_name',
            type: 'text',
            label: 'Tỉnh/Thành',
            admin: { readOnly: true },
          },
          {
            name: 'district_id',
            type: 'number',
            label: 'Mã Quận/Huyện (GHN)',
            admin: { readOnly: true, position: 'sidebar' },
          },
          {
            name: 'district_name',
            type: 'text',
            label: 'Quận/Huyện',
            admin: { readOnly: true },
          },
          {
            name: 'ward_code',
            type: 'text',
            label: 'Mã Phường/Xã (GHN)',
            admin: { readOnly: true, position: 'sidebar' },
          },
          {
            name: 'ward_name',
            type: 'text',
            label: 'Phường/Xã',
            admin: { readOnly: true },
          },
        ]
      },
    },
    customers: {
      slug: 'users',
    },
    payments: {
      paymentMethods: [
        codAdapter(),
        vnpayAdapter(),
        momoAdapter(),
        stripeAdapter({
          secretKey: process.env.STRIPE_SECRET_KEY!,
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
          webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET!,
        }),
      ],
    },
    currencies: {
      defaultCurrency: 'VND',
      supportedCurrencies: [
        {
          code: 'VND',
          decimals: 0,
          label: 'Vietnamese Dong',
          symbol: '₫',
        },
      ],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
    },
    orders: {
      ordersCollectionOverride: ({ defaultCollection }) => {
        // Override status field — thêm các trạng thái theo flow TikTok Shop
        const fields = (defaultCollection.fields || []).map((field: any) => {
          if (field.name === 'status') {
            return {
              ...field,
              options: [
                { label: 'Chờ xử lý', value: 'pending' },
                { label: 'Đang xử lý', value: 'processing' },
                { label: 'Đang giao hàng', value: 'shipped' },
                { label: 'Hoàn thành', value: 'completed' },
                { label: 'Đã hủy', value: 'cancelled' },
                { label: 'Hoàn tiền', value: 'refunded' },
              ],
              admin: {
                ...field.admin,
                components: {
                  ...field.admin?.components,
                  Cell: '@/components/Admin/OrderStatusCell#OrderStatusCell',
                },
              },
            }
          }
          return field
        })

        return {
          ...defaultCollection,
          admin: {
            ...defaultCollection.admin,
            defaultColumns: ['id', 'status', 'customerEmail', 'amount', 'createdAt'],
          },
          hooks: {
            ...defaultCollection.hooks,
            afterChange: [
              ...(defaultCollection.hooks?.afterChange || []),
              notifyTelegramOnNewOrder,
              restoreInventoryOnCancel,
              // deductInventory: KHÔNG CẦN vì plugin ecommerce đã tự trừ kho trong confirmOrder
              // syncGHNOrder đã chuyển sang gọi thủ công qua admin API
            ],
          },
          fields: [
            ...fields,
            {
              name: 'orderActions',
              type: 'ui',
              admin: {
                position: 'sidebar',
                components: {
                  Field: '@/components/Admin/OrderStatusActions#OrderStatusActions',
                },
              },
            },
            {
              name: 'shippingFee',
              label: 'Phí vận chuyển (GHN)',
              type: 'number',
              admin: { position: 'sidebar' },
            },
            {
              name: 'trackingCode',
              label: 'Mã vận đơn',
              type: 'text',
              admin: { position: 'sidebar' },
            },
            {
              name: 'ghnStatus',
              label: 'Trạng thái GHN',
              type: 'select',
              options: [
                { label: 'Chờ lấy hàng', value: 'ready_to_pick' },
                { label: 'Đang lấy hàng', value: 'picking' },
                { label: 'Đang giao hàng', value: 'delivering' },
                { label: 'Giao thành công', value: 'delivered' },
                { label: 'Đã hủy', value: 'cancel' },
              ],
              admin: { position: 'sidebar' },
            },
          ],
        }
      }
    },
    transactions: {
      transactionsCollectionOverride: ({ defaultCollection }) => {
        // Fields địa chỉ giao hàng — mirror với addressFields của plugin + GHN fields
        const shippingFields: any[] = [
          { name: 'firstName', type: 'text', label: 'Họ' },
          { name: 'lastName', type: 'text', label: 'Tên' },
          { name: 'phone', type: 'text', label: 'Số điện thoại' },
          { name: 'addressLine1', type: 'text', label: 'Địa chỉ' },
          { name: 'province_id', type: 'number', label: 'Mã Tỉnh/Thành (GHN)' },
          { name: 'province_name', type: 'text', label: 'Tỉnh/Thành' },
          { name: 'district_id', type: 'number', label: 'Mã Quận/Huyện (GHN)' },
          { name: 'district_name', type: 'text', label: 'Quận/Huyện' },
          { name: 'ward_code', type: 'text', label: 'Mã Phường/Xã (GHN)' },
          { name: 'ward_name', type: 'text', label: 'Phường/Xã' },
        ]

        return {
          ...defaultCollection,
          fields: defaultCollection.fields?.map((field: any) => {
            if (field.type === 'tabs') {
              return {
                ...field,
                tabs: field.tabs?.map((tab: any) => {
                  const hasBilling = tab.fields?.some(
                    (f: any) => f.name === 'billingAddress'
                  )
                  if (hasBilling) {
                    return {
                      ...tab,
                      fields: [
                        ...tab.fields,
                        {
                          name: 'shippingAddress',
                          type: 'group',
                          fields: shippingFields,
                          label: 'Địa chỉ giao hàng',
                        },
                      ],
                    }
                  }
                  return tab
                }),
              }
            }
            return field
          }),
        }
      },
    },
    carts: {
      cartsCollectionOverride: ({ defaultCollection }) => {
        return {
          ...defaultCollection,
          hooks: {
            ...defaultCollection.hooks,
            beforeChange: [
              ...(defaultCollection.hooks?.beforeChange || []),
              async ({ data, req, originalDoc }) => {
                if (data?.items && Array.isArray(data.items)) {
                  for (const item of data.items) {
                    const productId =
                      typeof item.product === 'object' ? item.product?.id : item.product

                    // If this is an existing item and its quantity hasn't increased, skip validation
                    if (originalDoc?.items) {
                      const originalItem = originalDoc.items.find((oi: any) => {
                        const oiProductId = typeof oi.product === 'object' ? oi.product?.id : oi.product;
                        const oiVariantId = typeof oi.variant === 'object' ? oi.variant?.id : oi.variant;
                        const itemVariantId = typeof item.variant === 'object' ? item.variant?.id : item.variant;

                        return oiProductId === productId && oiVariantId === itemVariantId;
                      });

                      if (originalItem && item.quantity <= originalItem.quantity) {
                        continue; // It's just a removal or decrement, safe to skip
                      }
                    }

                    if (!productId) continue

                    try {
                      const product = await req.payload.findByID({
                        collection: 'products',
                        id: productId,
                        depth: 1, // in case variant info is populated
                      })

                      if (product) {
                        let targetInventory = product.inventory

                        if (product.enableVariants && item.variant) {
                          const variantId =
                            typeof item.variant === 'object' ? item.variant?.id : item.variant
                          if (product.variants?.docs) {
                            const variant = product.variants.docs.find(
                              (v: any) => typeof v === 'object' && v.id === variantId
                            )
                            if (variant && (variant as any).inventory !== undefined) {
                              targetInventory = (variant as any).inventory
                            }
                          }
                        }

                        if (targetInventory !== undefined && targetInventory !== null) {
                          if (item.quantity > targetInventory) {
                            throw new Error(
                              `Sản phẩm \"${product.title}\" không đủ hàng. Số lượng tối đa: ${targetInventory}`
                            )
                          }
                        }
                      }
                    } catch (error: any) {
                      console.error(`Kho hàng check failed for product ID ${productId}:`, error.message || error)
                      throw new Error(error.message || 'Lỗi kiểm tra kho hàng')
                    }
                  }
                }
                return data
              },
            ],
          },
        }
      },
    },
  }),
]
