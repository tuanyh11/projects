import { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const Banners: CollectionConfig = {
    slug: 'banners',
    admin: {
        useAsTitle: 'title',
        group: 'Content',
    },
    access: {
        read: () => true,
        create: adminOnly,
        update: adminOnly,
        delete: adminOnly,
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
        },
        {
            name: 'subtitle',
            type: 'text',
        },
        {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            required: true,
        },
        {
            name: 'ctaText',
            type: 'text',
            label: 'Call To Action Text',
        },
        {
            name: 'ctaLink',
            type: 'text',
            label: 'Call To Action Link',
        },
    ],
}
