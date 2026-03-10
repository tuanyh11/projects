'use client'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type CartSelectionContextType = {
    selectedIds: Set<string>
    isSelected: (itemId: string) => boolean
    toggle: (itemId: string) => void
    select: (itemId: string) => void
    deselect: (itemId: string) => void
    selectAll: () => void
    deselectAll: () => void
    selectedCount: number
    totalCount: number
}

const CartSelectionContext = createContext<CartSelectionContextType>({
    selectedIds: new Set(),
    isSelected: () => false,
    toggle: () => { },
    select: () => { },
    deselect: () => { },
    selectAll: () => { },
    deselectAll: () => { },
    selectedCount: 0,
    totalCount: 0,
})

const STORAGE_KEY = 'cart_selected_items'

export const CartSelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { cart } = useCart()
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    // Get all valid item IDs from cart
    const allItemIds = useMemo(() => {
        if (!cart?.items?.length) return [] as string[]
        return cart.items
            .filter((item) => {
                if (typeof item.product === 'object' && item.product) return true
                return false
            })
            .map((item) => {
                const product = item.product as { id: string }
                const variant = item.variant
                const variantId = variant && typeof variant === 'object' ? variant.id : variant
                return variantId ? `${product.id}_${variantId}` : product.id
            })
    }, [cart?.items])

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored) as string[]
                setSelectedIds(new Set(parsed))
            }
        } catch {
            // ignore
        }
    }, [])

    // When cart items change, auto-select new items and remove stale selections
    useEffect(() => {
        if (allItemIds.length === 0) return
        setSelectedIds((prev) => {
            const newSet = new Set<string>()
            for (const id of allItemIds) {
                // Keep previous selection OR auto-select new items
                if (prev.has(id) || !prev.size || !localStorage.getItem(STORAGE_KEY)) {
                    newSet.add(id)
                }
            }
            return newSet
        })
    }, [allItemIds])

    // Save to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selectedIds)))
        } catch {
            // ignore
        }
    }, [selectedIds])

    const isSelected = useCallback(
        (itemId: string) => selectedIds.has(itemId),
        [selectedIds],
    )

    const toggle = useCallback((itemId: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            if (next.has(itemId)) {
                next.delete(itemId)
            } else {
                next.add(itemId)
            }
            return next
        })
    }, [])

    const select = useCallback((itemId: string) => {
        setSelectedIds((prev) => new Set(prev).add(itemId))
    }, [])

    const deselect = useCallback((itemId: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            next.delete(itemId)
            return next
        })
    }, [])

    const selectAll = useCallback(() => {
        setSelectedIds(new Set(allItemIds))
    }, [allItemIds])

    const deselectAll = useCallback(() => {
        setSelectedIds(new Set())
    }, [])

    const value = useMemo(
        () => ({
            selectedIds,
            isSelected,
            toggle,
            select,
            deselect,
            selectAll,
            deselectAll,
            selectedCount: selectedIds.size,
            totalCount: allItemIds.length,
        }),
        [selectedIds, isSelected, toggle, select, deselect, selectAll, deselectAll, allItemIds.length],
    )

    return (
        <CartSelectionContext.Provider value={value}>
            {children}
        </CartSelectionContext.Provider>
    )
}

export const useCartSelection = () => useContext(CartSelectionContext)
