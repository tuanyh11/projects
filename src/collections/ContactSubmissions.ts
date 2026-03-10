import { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const ContactSubmissions: CollectionConfig = {
    slug: 'contact-submissions',
    admin: {
        useAsTitle: 'fullName',
        group: 'Quản lý',
        description: 'Danh sách các yêu cầu liên hệ từ khách hàng',
    },
    access: {
        read: adminOnly,
        create: () => true, // Cho phép mọi người gửi form (không cần đăng nhập)
        update: adminOnly,
        delete: adminOnly,
    },
    fields: [
        {
            name: 'fullName',
            label: 'Họ tên',
            type: 'text',
            required: true,
        },
        {
            name: 'phone',
            label: 'Số điện thoại',
            type: 'text',
            required: true,
        },
        {
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true,
        },
        {
            name: 'topic',
            label: 'Chủ đề',
            type: 'select',
            required: true,
            options: [
                { label: 'Đặt phòng homestay', value: 'Đặt phòng homestay' },
                { label: 'Đặt tour 2N1Đ', value: 'Đặt tour 2N1Đ' },
                { label: 'Mua đặc sản online', value: 'Mua đặc sản online' },
                { label: 'Tổ chức sự kiện / Teambuilding', value: 'Tổ chức sự kiện / Teambuilding' },
                { label: 'Khác', value: 'Khác' },
            ],
        },
        {
            name: 'message',
            label: 'Nội dung',
            type: 'textarea',
            required: true,
        },
        {
            name: 'status',
            label: 'Trạng thái',
            type: 'select',
            defaultValue: 'new',
            options: [
                { label: '🔵 Mới', value: 'new' },
                { label: '🟡 Đang xử lý', value: 'processing' },
                { label: '✅ Đã phản hồi', value: 'replied' },
                { label: '⬜ Đóng', value: 'closed' },
            ],
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'note',
            label: 'Ghi chú nội bộ',
            type: 'textarea',
            admin: {
                position: 'sidebar',
                description: 'Ghi chú của admin (khách hàng không nhìn thấy)',
            },
        },
    ],
}
