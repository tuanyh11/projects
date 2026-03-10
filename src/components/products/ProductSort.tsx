'use client'

import React, { useEffect, useRef, useState } from 'react';

const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price-asc', label: 'Giá thấp → cao' },
    { value: 'price-desc', label: 'Giá cao → thấp' },
]

export const ProductSort: React.FC<{ currentSort?: string; onUpdateSort?: (sort: string) => void }> = ({ currentSort, onUpdateSort }) => {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const currentOption = sortOptions.find(o => o.value === (currentSort || 'newest'))

    const handleSelect = (value: string) => {
        if (onUpdateSort) {
            onUpdateSort(value)
        }
        setIsOpen(false)
    }

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false)
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <div ref={containerRef} className="relative" style={{ zIndex: 20 }}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center gap-3 transition-all duration-500 focus:outline-none"
                style={{
                    padding: '8px 16px 8px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: '2px',
                    background: 'var(--card)',
                    minWidth: '160px',
                }}
            >
                {/* Kanji accent */}
                <span
                    className="zen-kanji text-[10px] transition-opacity duration-500"
                    style={{ color: 'var(--matcha)', opacity: isOpen ? 0.6 : 0.25 }}
                >
                    序
                </span>

                {/* Selected label */}
                <span
                    className="flex-1 text-left text-[13px] font-light tracking-wide"
                    style={{
                        color: 'var(--foreground)',
                        opacity: 0.7,
                        fontFamily: "'Noto Serif JP', serif",
                        fontWeight: 300,
                    }}
                >
                    {currentOption?.label}
                </span>

                {/* Arrow icon — rotates when open */}
                <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    className="transition-transform duration-500 ease-out"
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        opacity: 0.35,
                    }}
                >
                    <path
                        d="M2 3.5L5 6.5L8 3.5"
                        stroke="var(--foreground)"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {/* Dropdown Popover */}
            <div
                style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    minWidth: '180px',
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '2px',
                    boxShadow: '0 8px 32px rgba(30, 28, 23, 0.08), 0 2px 8px rgba(30, 28, 23, 0.04)',
                    overflow: 'hidden',
                    transformOrigin: 'top right',
                    transition: 'opacity 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1)',
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateY(0) scaleY(1)' : 'translateY(-6px) scaleY(0.96)',
                    pointerEvents: isOpen ? 'auto' : 'none',
                }}
            >
                {/* Top decorative line */}
                <div
                    style={{
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, var(--matcha), transparent)',
                        opacity: 0.3,
                    }}
                />

                <div style={{ padding: '4px 0' }}>
                    {sortOptions.map((option) => {
                        const isActive = option.value === (currentSort || 'newest')
                        return (
                            <button
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className="w-full text-left transition-all duration-300 focus:outline-none"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 16px',
                                    fontSize: '13px',
                                    fontFamily: "'Noto Serif JP', serif",
                                    fontWeight: 300,
                                    letterSpacing: '0.04em',
                                    color: isActive ? 'var(--matcha)' : 'var(--foreground)',
                                    opacity: isActive ? 1 : 0.6,
                                    background: isActive ? 'rgba(107, 122, 94, 0.06)' : 'transparent',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(107, 122, 94, 0.04)'
                                        e.currentTarget.style.opacity = '0.85'
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.opacity = '0.6'
                                    }
                                }}
                            >
                                {/* Active indicator — small matcha dot */}
                                <span
                                    style={{
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        background: isActive ? 'var(--matcha)' : 'transparent',
                                        transition: 'background 0.3s ease',
                                        flexShrink: 0,
                                    }}
                                />
                                {option.label}
                            </button>
                        )
                    })}
                </div>

                {/* Bottom decorative line */}
                <div
                    style={{
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, var(--kincha), transparent)',
                        opacity: 0.15,
                    }}
                />
            </div>
        </div>
    )
}
