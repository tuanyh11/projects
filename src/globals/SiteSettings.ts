import { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
    slug: 'site-settings',
    admin: {
        group: 'Settings',
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            name: 'siteName',
            label: 'Tên website',
            type: 'text',
            required: true,
            defaultValue: 'Hồng Thái Na Hang',
        },
        {
            name: 'logo',
            type: 'upload',
            relationTo: 'media',
        },
        // ═══ Contact Info — dùng tab thay vì group để tránh prefix column ═══
        {
            type: 'tabs',
            tabs: [
                {
                    label: 'Thông tin liên hệ',
                    fields: [
                        {
                            name: 'hotline',
                            label: 'Hotline',
                            type: 'text',
                            defaultValue: '0988 456 789',
                        },
                        {
                            name: 'zalo',
                            label: 'Zalo',
                            type: 'text',
                            defaultValue: '0988 456 789',
                        },
                        {
                            name: 'email',
                            label: 'Email',
                            type: 'email',
                            defaultValue: 'info@hongthai-nahang.vn',
                        },
                        {
                            name: 'address',
                            label: 'Địa chỉ',
                            type: 'textarea',
                            defaultValue: 'Xã Hồng Thái, Na Hang, Tuyên Quang',
                        },
                        {
                            name: 'facebookPage',
                            label: 'Facebook Page',
                            type: 'text',
                        },
                        {
                            name: 'messengerLink',
                            label: 'Messenger Link',
                            type: 'text',
                            defaultValue: 'https://m.me/hongthai.nahang',
                        },
                    ],
                },
                {
                    label: 'Mạng xã hội',
                    fields: [
                        {
                            name: 'socialLinks',
                            label: 'Social Links',
                            type: 'array',
                            fields: [
                                {
                                    name: 'platform',
                                    type: 'text',
                                },
                                {
                                    name: 'url',
                                    type: 'text',
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
}
