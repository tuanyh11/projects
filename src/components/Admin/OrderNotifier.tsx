'use client'

import React, { useState } from 'react';

export const OrderNotifier: React.FC = () => {
    const [lastCheckedDate, setLastCheckedDate] = useState<string>(new Date().toISOString())

    // useEffect(() => {
    //     let timeout: NodeJS.Timeout

    //     const checkForNewOrders = async () => {
    //         try {
    //             // Query orders created after the 'lastCheckedDate'
    //             const res = await fetch(
    //                 `/api/orders?where[createdAt][greater_than]=${lastCheckedDate}&depth=0&limit=10&sort=-createdAt`,
    //                 {
    //                     headers: {
    //                         'Content-Type': 'application/json',
    //                     },
    //                 }
    //             )
    //             const data = await res.json()

    //             if (data && data.docs && data.docs.length > 0) {
    //                 // If we have new orders, trigger toast notifications for each
    //                 // Reversing array to show oldest first in the new batch, ending with the absolute newest
    //                 const newOrders = [...data.docs].reverse()

    //                 newOrders.forEach((order) => {
    //                     const amount = new Intl.NumberFormat('vi-VN', {
    //                         style: 'currency',
    //                         currency: order.currency || 'VND'
    //                     }).format(order.amount || 0)

    //                     const emailText = order.customerEmail || 'Khách vãng lai'
    //                     toast.success(`Có đơn hàng mới: #${order.id}`, {
    //                         description: `Khách: ${emailText} - Tổng: ${amount}`,
    //                         duration: 8000,
    //                         position: 'top-right',
    //                     })
    //                 })

    //                 // Update our checked date against the very newest order's creation time
    //                 if (data.docs[0]?.createdAt) {
    //                     setLastCheckedDate(data.docs[0].createdAt)
    //                 }
    //             }
    //         } catch (err) {
    //             console.error('Error checking for new orders:', err)
    //         } finally {
    //             // Poll every 10 seconds checking db
    //             timeout = setTimeout(checkForNewOrders, 10000)
    //         }
    //     }

    //     // Start initial polling
    //     timeout = setTimeout(checkForNewOrders, 10000)

    //     return () => {
    //         clearTimeout(timeout)
    //     }
    // }, [lastCheckedDate])

    // Does not render any UI footprint
    return null
}
