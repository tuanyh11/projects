import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

export async function POST(req: Request) {
    try {
        const payload = await getPayload({ config: configPromise })

        // Verify user is authenticated
        const headersList = await getHeaders()
        const { user } = await payload.auth({ headers: headersList })

        if (!user) {
            return NextResponse.json(
                { error: 'Bạn cần đăng nhập để viết đánh giá' },
                { status: 401 },
            )
        }

        const data = await req.json()
        const { product, rating, comment, name } = data

        if (!product || !rating || !comment || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Validate rating range
        const ratingNum = Number(rating)
        if (ratingNum < 1 || ratingNum > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
        }

        const newReview = await payload.create({
            collection: 'reviews',
            data: {
                product,
                name: String(name).slice(0, 100), // Limit name length
                rating: ratingNum,
                comment: String(comment).slice(0, 1000), // Limit comment length
            },
        })

        return NextResponse.json({ success: true, review: newReview }, { status: 201 })
    } catch (error: any) {
        console.error('Error creating review:', error)
        return NextResponse.json({ error: error.message || 'Error executing request' }, { status: 500 })
    }
}
