import { getPayload } from 'payload'
import config from '../src/payload.config'

const destinations = [
    {
        name: 'Ruộng Bậc Thang Hồng Thái',
        slug: 'ruong-bac-thang',
        description: 'Những thửa ruộng bậc thang uốn lượn theo sườn núi, vàng rực mùa lúa chín tháng 9-10. Là biểu tượng của Hồng Thái và là điểm check-in nổi tiếng nhất vùng.',
        tag: '📸 Must-see',
        emoji: '🌾',
        gradient: 'from-amber-400 to-yellow-600',
        order: 1,
        isActive: true,
    },
    {
        name: 'Rừng Trà Shan Tuyết Cổ Thụ',
        slug: 'rung-tra-shan-tuyet',
        description: 'Những cây trà cổ thụ hàng trăm năm tuổi mọc tự nhiên trên đỉnh núi. Du khách có thể hái trà, sao trà và thưởng trà ngay tại vườn với view núi rừng bao la.',
        tag: '🍵 Trải nghiệm',
        emoji: '🌳',
        gradient: 'from-emerald-500 to-green-700',
        order: 2,
        isActive: true,
    },
    {
        name: 'Thác Khuổi Nhi',
        slug: 'thac-khuoi-nhi',
        description: 'Thác nước hoang sơ cao hơn 30m ẩn mình trong rừng nguyên sinh. Nơi lý tưởng để tắm thác, cắm trại và hoà mình vào thiên nhiên.',
        tag: '💧 Phiêu lưu',
        emoji: '💦',
        gradient: 'from-cyan-500 to-blue-600',
        order: 3,
        isActive: true,
    },
    {
        name: 'Bản Làng Khau Tràng',
        slug: 'ban-lang-khau-trang',
        description: 'Bản Tày truyền thống với nhà sàn cổ kính, nơi du khách trải nghiệm homestay, nấu ăn cùng gia đình bản địa và tìm hiểu văn hoá Tày.',
        tag: '🏘️ Homestay',
        emoji: '🏡',
        gradient: 'from-orange-400 to-red-500',
        order: 4,
        isActive: true,
    },
    {
        name: 'Đỉnh Núi Pù Đồn',
        slug: 'dinh-nui-pu-don',
        description: 'Đỉnh núi cao nhất vùng Hồng Thái, nơi lý tưởng để ngắm bình minh, săn mây và chiêm ngưỡng toàn cảnh thung lũng. Trekking khoảng 2-3 giờ.',
        tag: '⛰️ Trekking',
        emoji: '🥾',
        gradient: 'from-violet-500 to-purple-700',
        order: 5,
        isActive: true,
    },
    {
        name: 'Hồ Na Hang',
        slug: 'ho-na-hang',
        description: 'Hồ nước xanh ngọc giữa núi đá vôi hùng vĩ, được ví như "Hạ Long trên núi". Du thuyền ngắm cảnh, câu cá và nghỉ dưỡng.',
        tag: '🛶 Thư giãn',
        emoji: '🏞️',
        gradient: 'from-teal-500 to-emerald-600',
        order: 6,
        isActive: true,
    },
]

const rooms = [
    {
        name: 'Homestay Nhà Sàn Tày',
        slug: 'homestay-nha-san-tay',
        type: 'nha-san',
        description: 'Nhà sàn gỗ truyền thống người Tày, nằm giữa ruộng bậc thang. Trải nghiệm ngủ trên sàn gỗ ấm áp, thức dậy cùng tiếng chim hót.',
        price: 350000,
        priceUnit: 'đêm/phòng',
        capacity: '2-4 người',
        amenities: [{ name: 'Wifi' }, { name: 'Bữa sáng' }, { name: 'View núi' }, { name: 'Nước nóng' }],
        highlight: 'Phổ biến nhất',
        highlightColor: 'bg-primary',
        emoji: '🏡',
        order: 1,
        isAvailable: true,
    },
    {
        name: 'Phòng Đôi View Ruộng Bậc Thang',
        slug: 'phong-doi-view-ruong',
        type: 'phong-rieng',
        description: 'Phòng riêng tư với ban công nhìn thẳng ra ruộng bậc thang. Giường đôi êm ái, phòng tắm riêng.',
        price: 500000,
        priceUnit: 'đêm/phòng',
        capacity: '2 người',
        amenities: [{ name: 'Wifi' }, { name: '2 bữa ăn' }, { name: 'Ban công' }, { name: 'Phòng tắm riêng' }],
        highlight: 'View đẹp nhất',
        highlightColor: 'bg-amber-500',
        emoji: '🌄',
        order: 2,
        isAvailable: true,
    },
    {
        name: 'Dorm Backpacker',
        slug: 'dorm-backpacker',
        type: 'dorm',
        description: 'Giường tập thể cho dân phượt. Không gian chung ấm cúng, bếp nấu ăn, sân thượng xem stars.',
        price: 150000,
        priceUnit: 'đêm/giường',
        capacity: '1 người',
        amenities: [{ name: 'Wifi' }, { name: 'Tủ khoá' }, { name: 'Bếp chung' }, { name: 'Sân thượng' }],
        highlight: 'Tiết kiệm',
        highlightColor: 'bg-sky-500',
        emoji: '🎒',
        order: 3,
        isAvailable: true,
    },
    {
        name: 'Bungalow Ven Suối',
        slug: 'bungalow-ven-suoi',
        type: 'bungalow',
        description: 'Căn bungalow riêng biệt bên suối, nghe tiếng nước chảy róc rách. Có lò sưởi cho mùa đông.',
        price: 800000,
        priceUnit: 'đêm/căn',
        capacity: '2-3 người',
        amenities: [{ name: 'Wifi' }, { name: '3 bữa ăn' }, { name: 'Lò sưởi' }, { name: 'View suối' }, { name: 'Bồn tắm' }],
        highlight: 'Cao cấp',
        highlightColor: 'bg-violet-500',
        emoji: '🏕️',
        order: 4,
        isAvailable: true,
    },
    {
        name: 'Phòng Gia Đình',
        slug: 'phong-gia-dinh',
        type: 'nha-san',
        description: 'Phòng rộng rãi trên nhà sàn lớn, phù hợp cho gia đình có trẻ nhỏ. Sân vườn an toàn cho bé chơi.',
        price: 650000,
        priceUnit: 'đêm/phòng',
        capacity: '4-6 người',
        amenities: [{ name: 'Wifi' }, { name: '2 bữa ăn' }, { name: 'Sân vườn' }, { name: 'Nôi em bé' }],
        highlight: 'Cho gia đình',
        highlightColor: 'bg-rose-500',
        emoji: '👨‍👩‍👧‍👦',
        order: 5,
        isAvailable: true,
    },
    {
        name: 'Camping Đỉnh Đồi',
        slug: 'camping-dinh-doi',
        type: 'camping',
        description: 'Cắm trại trên đỉnh đồi, ngắm sao trời và bình minh. Lều và thiết bị được cung cấp sẵn.',
        price: 200000,
        priceUnit: 'đêm/người',
        capacity: '1-2 người',
        amenities: [{ name: 'Lều' }, { name: 'Túi ngủ' }, { name: 'BBQ' }, { name: 'Đèn pin' }],
        highlight: 'Phiêu lưu',
        highlightColor: 'bg-green-600',
        emoji: '⛺',
        order: 6,
        isAvailable: true,
    },
]

async function seed() {
    const payload = await getPayload({ config })

    console.log('🌿 Seeding destinations...')
    for (const dest of destinations) {
        const existing = await payload.find({ collection: 'destinations' as any, where: { slug: { equals: dest.slug } } })
        if (existing.docs.length > 0) {
            console.log(`  ⏭️  "${dest.name}" already exists, skipping`)
            continue
        }
        await payload.create({ collection: 'destinations' as any, data: dest as any })
        console.log(`  ✅ Created "${dest.name}"`)
    }

    console.log('\n🏡 Seeding rooms...')
    for (const room of rooms) {
        const existing = await payload.find({ collection: 'rooms' as any, where: { slug: { equals: room.slug } } })
        if (existing.docs.length > 0) {
            console.log(`  ⏭️  "${room.name}" already exists, skipping`)
            continue
        }
        await payload.create({ collection: 'rooms' as any, data: room as any })
        console.log(`  ✅ Created "${room.name}"`)
    }

    console.log('\n🎉 Seeding complete!')
    process.exit(0)
}

seed().catch((err) => {
    console.error('❌ Seeding failed:', err)
    process.exit(1)
})
