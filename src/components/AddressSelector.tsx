'use client'

import React, { useEffect, useRef, useState } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────
interface Province {
    ProvinceID: number
    ProvinceName: string
}

interface District {
    DistrictID: number
    DistrictName: string
}

interface Ward {
    WardCode: string
    WardName: string
}

export interface GHNAddressValue {
    province_id: number | null
    province_name: string
    district_id: number | null
    district_name: string
    ward_code: string
    ward_name: string
}

interface AddressSelectorProps {
    onAddressChange: (address: GHNAddressValue) => void
    initialValues?: {
        province_id?: number
        district_id?: number
        ward_code?: string
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Client-side Cache — tránh gọi API lặp lại cho cùng tỉnh/quận
// Cache tồn tại suốt session trình duyệt (module-level)
// ═══════════════════════════════════════════════════════════════════════════════
const cache = {
    provinces: null as Province[] | null,
    districts: new Map<number, District[]>(),
    wards: new Map<number, Ward[]>(),
}

async function fetchCached<T>(
    key: string,
    url: string,
    cacheMap?: Map<string | number, T[]>,
    cacheKey?: string | number,
): Promise<T[]> {
    // Check cache
    if (key === 'provinces' && cache.provinces) return cache.provinces as T[]
    if (cacheMap && cacheKey !== undefined && cacheMap.has(cacheKey)) return cacheMap.get(cacheKey) as T[]

    const res = await fetch(url)
    if (!res.ok) throw new Error(`Không thể tải dữ liệu`)
    const json = await res.json()
    const data = json.data ?? []

    // Store in cache
    if (key === 'provinces') cache.provinces = data
    if (cacheMap && cacheKey !== undefined) cacheMap.set(cacheKey, data)

    return data
}

// ═══════════════════════════════════════════════════════════════════════════════
// Zen Searchable Select — custom dropdown phong cách Zen
// ═══════════════════════════════════════════════════════════════════════════════
interface ZenAddressSelectProps {
    kanji: string
    label: string
    placeholder: string
    loadingText?: string
    value: string
    options: { value: string; label: string }[]
    onChange: (value: string) => void
    disabled?: boolean
    loading?: boolean
}

const ZenAddressSelect: React.FC<ZenAddressSelectProps> = ({
    kanji, label, placeholder, loadingText = 'Đang tải...', value, options, onChange, disabled, loading,
}) => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const ref = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Close on click outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
                setSearch('')
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Focus search input when open
    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus()
        }
    }, [open])

    const selectedLabel = options.find((o) => o.value === value)?.label || ''
    const filtered = search
        ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
        : options

    const handleSelect = (val: string) => {
        onChange(val)
        setOpen(false)
        setSearch('')
    }

    return (
        <div className="flex flex-col gap-1.5">
            {/* Label */}
            <label
                className="flex items-center gap-2 text-xs font-light text-foreground/50 tracking-wide"
                style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
            >
                <span className="zen-kanji text-[10px]" style={{ color: 'var(--matcha)', opacity: 0.35 }}>{kanji}</span>
                {label} <span style={{ color: 'var(--matcha)', opacity: 0.5 }}>*</span>
            </label>

            {/* Select Trigger */}
            <div ref={ref} className="relative">
                <button
                    type="button"
                    onClick={() => { if (!disabled) setOpen(!open) }}
                    disabled={disabled || loading}
                    className="w-full px-4 py-3 text-left text-sm font-light transition-all duration-500 flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    style={{
                        borderRadius: '2px',
                        border: open ? '1px solid rgba(107,122,94,0.3)' : '1px solid var(--border)',
                        background: open ? 'rgba(107,122,94,0.02)' : 'transparent',
                        fontFamily: "'Noto Serif JP', serif",
                        fontWeight: 300,
                    }}
                >
                    <span style={{ color: selectedLabel ? 'var(--foreground)' : 'var(--muted-foreground)', opacity: selectedLabel ? 0.8 : 0.5 }}>
                        {loading ? loadingText : (selectedLabel || placeholder)}
                    </span>
                    {loading ? (
                        <svg className="w-3.5 h-3.5 animate-spin" style={{ opacity: 0.3 }} viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="31.4" strokeDashoffset="10" />
                        </svg>
                    ) : (
                        <svg
                            className={`w-3 h-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                            style={{ opacity: 0.3 }}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    )}
                </button>

                {/* Dropdown */}
                {open && (
                    <div
                        className="absolute left-0 right-0 top-full mt-1 z-50 border border-border/60 overflow-hidden"
                        style={{
                            borderRadius: '2px',
                            background: 'var(--card)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        }}
                    >
                        {/* Search Input */}
                        <div
                            className="px-3 py-2 border-b"
                            style={{ borderColor: 'var(--border)' }}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-3.5 h-3.5" style={{ opacity: 0.25 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Tìm kiếm..."
                                    className="zen-input w-full text-sm font-light outline-none bg-transparent text-foreground/80 placeholder:text-foreground/25"
                                    style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
                                />
                            </div>
                        </div>

                        {/* Options List */}
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {filtered.length === 0 ? (
                                <div className="px-4 py-3 text-xs font-light text-foreground/30 text-center"
                                    style={{ fontFamily: "'Noto Serif JP', serif" }}>
                                    Không tìm thấy kết quả
                                </div>
                            ) : (
                                filtered.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        className={`w-full text-left px-4 py-2.5 text-sm font-light transition-all duration-200 cursor-pointer border-b last:border-0
                                            ${value === opt.value
                                                ? 'text-foreground/80 bg-muted/20'
                                                : 'text-foreground/55 hover:text-foreground/75 hover:bg-muted/10 hover:pl-5'
                                            }`}
                                        style={{
                                            fontFamily: "'Noto Serif JP', serif",
                                            fontWeight: 300,
                                            borderColor: 'var(--border)',
                                            opacity: 0.9,
                                        }}
                                    >
                                        {value === opt.value && (
                                            <span className="zen-kanji text-[10px] mr-2" style={{ color: 'var(--matcha)', opacity: 0.5 }}>✓</span>
                                        )}
                                        {opt.label}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AddressSelector — Main Component
// ═══════════════════════════════════════════════════════════════════════════════
export const AddressSelector: React.FC<AddressSelectorProps> = ({
    onAddressChange,
    initialValues,
}) => {
    const [provinces, setProvinces] = useState<Province[]>([])
    const [districts, setDistricts] = useState<District[]>([])
    const [wards, setWards] = useState<Ward[]>([])

    const [selectedProvince, setSelectedProvince] = useState<number | null>(
        initialValues?.province_id ?? null,
    )
    const [selectedDistrict, setSelectedDistrict] = useState<number | null>(
        initialValues?.district_id ?? null,
    )
    const [selectedWard, setSelectedWard] = useState<string>(initialValues?.ward_code ?? '')

    const [loadingProvinces, setLoadingProvinces] = useState(false)
    const [loadingDistricts, setLoadingDistricts] = useState(false)
    const [loadingWards, setLoadingWards] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const callbackRef = useRef(onAddressChange)
    useEffect(() => {
        callbackRef.current = onAddressChange
    }, [onAddressChange])

    // ── Fetch provinces (cached) ────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            setLoadingProvinces(true)
            setError(null)
            try {
                const data = await fetchCached<Province>('provinces', '/api/ghn/provinces')
                setProvinces(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi tải tỉnh/thành')
            } finally {
                setLoadingProvinces(false)
            }
        }
        load()
    }, [])

    // ── Fetch districts (cached by province_id) ────────────────────────────
    useEffect(() => {
        if (!selectedProvince) {
            setDistricts([])
            return
        }
        const load = async () => {
            setLoadingDistricts(true)
            setError(null)
            try {
                const data = await fetchCached<District>(
                    'districts',
                    `/api/ghn/districts?province_id=${selectedProvince}`,
                    cache.districts,
                    selectedProvince,
                )
                setDistricts(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi tải quận/huyện')
            } finally {
                setLoadingDistricts(false)
            }
        }
        load()
    }, [selectedProvince])

    // ── Fetch wards (cached by district_id) ─────────────────────────────────
    useEffect(() => {
        if (!selectedDistrict) {
            setWards([])
            return
        }
        const load = async () => {
            setLoadingWards(true)
            setError(null)
            try {
                const data = await fetchCached<Ward>(
                    'wards',
                    `/api/ghn/wards?district_id=${selectedDistrict}`,
                    cache.wards,
                    selectedDistrict,
                )
                setWards(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi tải phường/xã')
            } finally {
                setLoadingWards(false)
            }
        }
        load()
    }, [selectedDistrict])

    // ── Notify parent ───────────────────────────────────────────────────────
    useEffect(() => {
        const province = provinces.find((p) => p.ProvinceID === selectedProvince)
        const district = districts.find((d) => d.DistrictID === selectedDistrict)
        const ward = wards.find((w) => w.WardCode === selectedWard)

        callbackRef.current({
            province_id: selectedProvince,
            province_name: province?.ProvinceName ?? '',
            district_id: selectedDistrict,
            district_name: district?.DistrictName ?? '',
            ward_code: selectedWard,
            ward_name: ward?.WardName ?? '',
        })
    }, [selectedProvince, selectedDistrict, selectedWard, provinces, districts, wards])

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleProvinceChange = (val: string) => {
        const id = val ? Number(val) : null
        setSelectedProvince(id)
        setSelectedDistrict(null)
        setSelectedWard('')
        setDistricts([])
        setWards([])
    }

    const handleDistrictChange = (val: string) => {
        const id = val ? Number(val) : null
        setSelectedDistrict(id)
        setSelectedWard('')
        setWards([])
    }

    const handleWardChange = (val: string) => {
        setSelectedWard(val)
    }

    return (
        <div className="flex flex-col gap-3">
            {error && (
                <div className="text-[11px] font-light px-3 py-2" style={{
                    color: '#EF4444', opacity: 0.8,
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '2px',
                    background: 'rgba(239,68,68,0.04)',
                }}>
                    {error}
                </div>
            )}

            <ZenAddressSelect
                kanji="省"
                label="Tỉnh/Thành phố"
                placeholder="Chọn tỉnh/thành phố"
                loadingText="Đang tải tỉnh/thành..."
                value={selectedProvince?.toString() ?? ''}
                options={provinces.map((p) => ({ value: p.ProvinceID.toString(), label: p.ProvinceName }))}
                onChange={handleProvinceChange}
                loading={loadingProvinces}
            />

            <ZenAddressSelect
                kanji="区"
                label="Quận/Huyện"
                placeholder="Chọn quận/huyện"
                loadingText="Đang tải quận/huyện..."
                value={selectedDistrict?.toString() ?? ''}
                options={districts.map((d) => ({ value: d.DistrictID.toString(), label: d.DistrictName }))}
                onChange={handleDistrictChange}
                disabled={!selectedProvince}
                loading={loadingDistricts}
            />

            <ZenAddressSelect
                kanji="町"
                label="Phường/Xã"
                placeholder="Chọn phường/xã"
                loadingText="Đang tải phường/xã..."
                value={selectedWard}
                options={wards.map((w) => ({ value: w.WardCode, label: w.WardName }))}
                onChange={handleWardChange}
                disabled={!selectedDistrict}
                loading={loadingWards}
            />
        </div>
    )
}
