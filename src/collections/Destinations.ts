import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const Destinations: CollectionConfig = {
    slug: 'destinations',
    access: {
        read: () => true,
        create: adminOnly,
        update: adminOnly,
        delete: adminOnly,
    },
    admin: {
        useAsTitle: 'name',
        group: 'Du Lịch',
        defaultColumns: ['name', 'tag', 'order', 'isActive'],
        description: 'Các điểm đến du lịch tại Hồng Thái, Na Hang',
    },
    fields: [
        {
            name: 'name',
            label: 'Tên điểm đến',
            type: 'text',
            required: true,
        },
        {
            name: 'slug',
            label: 'Slug',
            type: 'text',
            unique: true,
            admin: { position: 'sidebar' },
        },
        {
            name: 'description',
            label: 'Mô tả',
            type: 'textarea',
            required: true,
        },
        {
            name: 'tag',
            label: 'Tag hiển thị',
            type: 'text',
            admin: { description: 'VD: 📸 Must-see, 🍵 Trải nghiệm, 💧 Phiêu lưu' },
        },
        {
            name: 'emoji',
            label: 'Emoji đại diện',
            type: 'text',
            admin: { description: 'VD: 🌾, 🌳, 💦, 🏡' },
        },
        {
            name: 'gradient',
            label: 'Gradient màu nền',
            type: 'select',
            options: [
                { label: 'Vàng (Amber → Yellow)', value: 'from-amber-400 to-yellow-600' },
                { label: 'Xanh lá (Emerald → Green)', value: 'from-emerald-500 to-green-700' },
                { label: 'Xanh dương (Cyan → Blue)', value: 'from-cyan-500 to-blue-600' },
                { label: 'Cam (Orange → Red)', value: 'from-orange-400 to-red-500' },
                { label: 'Tím (Violet → Purple)', value: 'from-violet-500 to-purple-700' },
                { label: 'Teal (Teal → Emerald)', value: 'from-teal-500 to-emerald-600' },
                { label: 'Hồng (Rose → Pink)', value: 'from-rose-400 to-pink-600' },
                { label: 'Xanh núi (Green → Teal)', value: 'from-green-500 to-teal-600' },
            ],
            defaultValue: 'from-emerald-500 to-green-700',
        },
        {
            name: 'image',
            label: 'Ảnh điểm đến',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'highlights',
            label: 'Điểm nổi bật',
            type: 'array',
            fields: [
                { name: 'text', type: 'text', required: true },
            ],
        },
        {
            name: 'order',
            label: 'Thứ tự hiển thị',
            type: 'number',
            defaultValue: 0,
            admin: { position: 'sidebar' },
        },
        {
            name: 'isActive',
            label: 'Hiển thị',
            type: 'checkbox',
            defaultValue: true,
            admin: { position: 'sidebar' },
        },
    ],
}
