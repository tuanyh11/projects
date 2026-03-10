import { GlobalConfig } from 'payload'

export const HomePage: GlobalConfig = {
    slug: 'home-page',
    admin: {
        group: 'Content',
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            name: 'heroSection',
            type: 'group',
            fields: [
                { name: 'headline', type: 'text', required: true },
                { name: 'subheadline', type: 'text' },
                { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
                { name: 'ctaText', type: 'text' },
                { name: 'ctaLink', type: 'text' },
            ],
        },
        {
            name: 'whyChooseUs',
            type: 'array',
            maxRows: 4,
            fields: [
                { name: 'icon', type: 'text', admin: { description: 'Icon name (e.g., Lucide icon name)' } },
                { name: 'title', type: 'text' },
                { name: 'description', type: 'textarea' },
            ],
        },
        {
            name: 'featuredProducts',
            type: 'relationship',
            relationTo: 'products',
            hasMany: true,
            maxDepth: 1,
        },
        {
            name: 'testimonials',
            type: 'array',
            fields: [
                { name: 'customerName', type: 'text' },
                { name: 'review', type: 'textarea' },
                { name: 'rating', type: 'number', min: 1, max: 5 },
            ],
        },
    ],
}
