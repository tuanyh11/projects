import { CollectionAfterChangeHook } from 'payload'

export const createCartForUser: CollectionAfterChangeHook = async ({ req, operation, doc }) => {
    if (operation === 'create') {
        try {
            await req.payload.create({
                collection: 'carts',
                data: {
                    customer: doc.id,
                    items: [],
                },
            })
        } catch (err) {
            console.error('Error creating cart for user', err)
        }
    }
    return doc
}
