import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const Posts: CollectionConfig = {
    slug: 'posts',
    admin: {
        useAsTitle: 'title',
        group: 'Nội dung',
        defaultColumns: ['title', 'category', 'publishDate', 'status'],
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
            label: 'Tiêu đề',
            type: 'text',
            required: true,
        },
        {
            name: 'slug',
            label: 'Đường dẫn (Slug)',
            type: 'text',
            unique: true,
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'category',
            label: 'Danh mục',
            type: 'relationship',
            relationTo: 'categories',
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'publishDate',
            label: 'Ngày xuất bản',
            type: 'date',
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'author',
            label: 'Tác giả',
            type: 'relationship',
            relationTo: 'users',
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'status',
            label: 'Trạng thái',
            type: 'select',
            options: [
                { label: 'Bản nháp', value: 'draft' },
                { label: 'Đã xuất bản', value: 'published' },
            ],
            defaultValue: 'draft',
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'heroImage',
            label: 'Ảnh đại diện',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'excerpt',
            label: 'Đoạn trích',
            type: 'textarea',
        },
        {
            name: 'content',
            label: 'Nội dung',
            type: 'richText',
            editor: lexicalEditor({}),
            required: true,
        },
        {
            name: 'relatedPosts',
            label: 'Bài viết liên quan',
            type: 'relationship',
            relationTo: 'posts',
            hasMany: true,
        },
    ],
}
