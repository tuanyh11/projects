import { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const Reviews: CollectionConfig = {
    slug: 'reviews',
    admin: {
        useAsTitle: 'comment',
        group: 'E-commerce',
    },
    access: {
        read: () => true,
        create: ({ req: { user } }) => Boolean(user), // Must be logged in
        update: adminOnly,
        delete: adminOnly,
    },
    fields: [
        {
            name: 'product',
            type: 'relationship',
            relationTo: 'products',
            required: true,
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'name',
            type: 'text',
            required: true,
            defaultValue: 'Khách hàng',
        },
        {
            name: 'rating',
            type: 'number',
            required: true,
            min: 1,
            max: 5,
        },
        {
            name: 'comment',
            type: 'textarea',
            required: true,
        },
    ],
}
