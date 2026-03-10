import configPromise from '@payload-config'
import { getPayload } from 'payload'

const products = [
    {
        title: 'Gạo ST25 Hữu Cơ',
        slug: 'gao-st25-huu-co',
        riceType: 'gao-huu-co',
        origin: 'Sóc Trăng',
        weight: 5,
        cookingTime: '20-25 phút',
        priceInUSD: 185000,
        meta: { title: 'Gạo ST25 Hữu Cơ', description: 'Gạo ngon nhất thế giới 2019, thơm dẻo tự nhiên, canh tác hữu cơ 100%.' },
    },
    {
        title: 'Gạo Lứt Đỏ Điện Biên',
        slug: 'gao-lut-do-dien-bien',
        riceType: 'gao-lut',
        origin: 'Điện Biên',
        weight: 2,
        cookingTime: '35-40 phút',
        priceInUSD: 125000,
        meta: { title: 'Gạo Lứt Đỏ Điện Biên', description: 'Giàu dinh dưỡng, nhiều chất xơ, tốt cho tim mạch và hệ tiêu hoá.' },
    },
    {
        title: 'Gạo Thơm Lài Sữa',
        slug: 'gao-thom-lai-sua',
        riceType: 'gao-thom',
        origin: 'Long An',
        weight: 5,
        cookingTime: '18-20 phút',
        priceInUSD: 95000,
        meta: { title: 'Gạo Thơm Lài Sữa', description: 'Hương lài thoang thoảng, cơm trắng bóng dẻo mềm, thích hợp nấu cơm hàng ngày.' },
    },
    {
        title: 'Gạo Nếp Cái Hoa Vàng',
        slug: 'gao-nep-cai-hoa-vang',
        riceType: 'gao-nep',
        origin: 'Hải Dương',
        weight: 2,
        cookingTime: '30-35 phút',
        priceInUSD: 110000,
        meta: { title: 'Gạo Nếp Cái Hoa Vàng', description: 'Nếp dẻo thơm, hạt tròn mẩy, lý tưởng cho xôi, bánh chưng, bánh dày.' },
    },
    {
        title: 'Gạo Tám Xoan Hải Hậu',
        slug: 'gao-tam-xoan-hai-hau',
        riceType: 'gao-thom',
        origin: 'Nam Định',
        weight: 5,
        cookingTime: '20-22 phút',
        priceInUSD: 135000,
        meta: { title: 'Gạo Tám Xoan Hải Hậu', description: 'Đặc sản nổi tiếng miền Bắc, hạt gạo thon dài, cơm dẻo thơm đặc trưng.' },
    },
    {
        title: 'Gạo Japonica Nhật Bản',
        slug: 'gao-japonica-nhat-ban',
        riceType: 'gao-trang',
        origin: 'Ninh Bình',
        weight: 5,
        cookingTime: '22-25 phút',
        priceInUSD: 165000,
        meta: { title: 'Gạo Japonica Nhật Bản', description: 'Giống gạo Nhật trồng tại Việt Nam, hạt ngắn tròn, cơm dẻo dính phù hợp sushi.' },
    },
    {
        title: 'Gạo Hữu Cơ Quế Lâm',
        slug: 'gao-huu-co-que-lam',
        riceType: 'gao-huu-co',
        origin: 'Lào Cai',
        weight: 2,
        cookingTime: '20-25 phút',
        priceInUSD: 145000,
        meta: { title: 'Gạo Hữu Cơ Quế Lâm', description: 'Trồng trên ruộng bậc thang Sapa, không thuốc trừ sâu, an toàn tuyệt đối.' },
    },
    {
        title: 'Gạo Trắng Hạt Dài 64',
        slug: 'gao-trang-hat-dai-64',
        riceType: 'gao-trang',
        origin: 'An Giang',
        weight: 10,
        cookingTime: '18-20 phút',
        priceInUSD: 75000,
        meta: { title: 'Gạo Trắng Hạt Dài 64', description: 'Gạo phổ thông hạt dài, cơm ráo xốp, giá cả bình dân cho bữa cơm hàng ngày.' },
    },
    {
        title: 'Gạo Nàng Hoa 9',
        slug: 'gao-nang-hoa-9',
        riceType: 'gao-thom',
        origin: 'Đồng Tháp',
        weight: 5,
        cookingTime: '18-20 phút',
        priceInUSD: 89000,
        meta: { title: 'Gạo Nàng Hoa 9', description: 'Gạo thơm nhẹ, hạt dài trắng, cơm mềm dẻo vừa phải, giá hợp lý.' },
    },
    {
        title: 'Gạo Lứt Tím Than',
        slug: 'gao-lut-tim-than',
        riceType: 'gao-lut',
        origin: 'Hà Giang',
        weight: 1,
        cookingTime: '40-45 phút',
        priceInUSD: 98000,
        meta: { title: 'Gạo Lứt Tím Than', description: 'Siêu thực phẩm giàu anthocyanin, chống oxy hoá mạnh, tốt cho sức khoẻ.' },
    },
]

async function seed() {
    const payload = await getPayload({ config: configPromise })

    console.log('🌱 Bắt đầu thêm sản phẩm...\n')

    for (const product of products) {
        try {
            // Check if product already exists
            const existing = await payload.find({
                collection: 'products',
                where: { slug: { equals: product.slug } },
                limit: 1,
            })

            if (existing.docs.length > 0) {
                console.log(`⏭  Đã tồn tại: ${product.title}`)
                continue
            }

            await payload.create({
                collection: 'products',
                data: {
                    ...product,
                    _status: 'published',
                } as any,
            })

            console.log(`✅ Đã thêm: ${product.title} — ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.priceInUSD)}`)
        } catch (err: any) {
            console.error(`❌ Lỗi khi thêm ${product.title}:`, err.message || err)
        }
    }

    console.log('\n🎉 Hoàn tất!')
    process.exit(0)
}

seed()
