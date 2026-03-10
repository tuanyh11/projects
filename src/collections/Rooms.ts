import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const Rooms: CollectionConfig = {
    slug: 'rooms',
    access: {
        read: () => true,
        create: adminOnly,
        update: adminOnly,
        delete: adminOnly,
    },
    admin: {
        useAsTitle: 'name',
        group: 'Du Lịch',
        defaultColumns: ['name', 'type', 'price', 'isAvailable', 'order'],
        description: 'Phòng homestay & lưu trú tại Hồng Thái',
    },
    fields: [
        {
            name: 'name',
            label: 'Tên phòng',
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
            name: 'type',
            label: 'Loại phòng',
            type: 'select',
            required: true,
            options: [
                { label: 'Nhà sàn truyền thống', value: 'nha-san' },
                { label: 'Phòng riêng', value: 'phong-rieng' },
                { label: 'Giường tập thể (Dorm)', value: 'dorm' },
                { label: 'Bungalow', value: 'bungalow' },
                { label: 'Lều trại (Camping)', value: 'camping' },
                { label: 'Phòng VIP', value: 'vip' },
            ],
        },
        {
            name: 'description',
            label: 'Mô tả',
            type: 'textarea',
        },
        {
            name: 'price',
            label: 'Giá (VNĐ)',
            type: 'number',
            required: true,
            admin: { description: 'Giá mỗi đêm, VD: 350000' },
        },
        {
            name: 'priceUnit',
            label: 'Đơn vị giá',
            type: 'select',
            defaultValue: 'đêm/phòng',
            options: [
                { label: 'đêm/phòng', value: 'đêm/phòng' },
                { label: 'đêm/giường', value: 'đêm/giường' },
                { label: 'đêm/căn', value: 'đêm/căn' },
                { label: 'đêm/người', value: 'đêm/người' },
            ],
        },
        {
            name: 'capacity',
            label: 'Sức chứa',
            type: 'text',
            admin: { description: 'VD: 2-4 người' },
        },
        {
            name: 'amenities',
            label: 'Tiện ích',
            type: 'array',
            fields: [
                { name: 'name', label: 'Tên tiện ích', type: 'text', required: true },
            ],
        },
        {
            name: 'highlight',
            label: 'Badge nổi bật',
            type: 'text',
            admin: { description: 'VD: Phổ biến nhất, View đẹp nhất, Tiết kiệm' },
        },
        {
            name: 'highlightColor',
            label: 'Màu badge',
            type: 'select',
            defaultValue: 'bg-primary',
            options: [
                { label: 'Xanh (Primary)', value: 'bg-primary' },
                { label: 'Vàng (Amber)', value: 'bg-amber-500' },
                { label: 'Xanh dương (Sky)', value: 'bg-sky-500' },
                { label: 'Tím (Violet)', value: 'bg-violet-500' },
                { label: 'Hồng (Rose)', value: 'bg-rose-500' },
                { label: 'Xanh lá (Green)', value: 'bg-green-600' },
            ],
        },
        {
            name: 'emoji',
            label: 'Emoji đại diện',
            type: 'text',
            admin: { description: 'VD: 🏡, 🌄, 🎒, ⛺' },
        },
        {
            name: 'image',
            label: 'Ảnh phòng',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'bookingLink',
            label: 'Link đặt phòng',
            type: 'text',
            admin: { description: 'Link Messenger/Zalo để đặt phòng' },
        },
        {
            name: 'order',
            label: 'Thứ tự hiển thị',
            type: 'number',
            defaultValue: 0,
            admin: { position: 'sidebar' },
        },
        {
            name: 'isAvailable',
            label: 'Còn phòng',
            type: 'checkbox',
            defaultValue: true,
            admin: { position: 'sidebar' },
        },
    ],
}
