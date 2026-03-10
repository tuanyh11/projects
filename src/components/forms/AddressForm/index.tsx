'use client'
import { Address, Config } from '@/payload-types'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

import { AddressSelector, type GHNAddressValue } from '@/components/AddressSelector'
import { deepMergeSimple } from 'payload/shared'

type AddressFormValues = {

  firstName?: string | null
  lastName?: string | null
  company?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  phone?: string | null
}

type Props = {
  addressID?: Config['db']['defaultIDType']
  initialData?: Omit<Address, 'country' | 'id' | 'updatedAt' | 'createdAt'> & { country?: string }
  callback?: (data: Partial<Address>) => void
  skipSubmission?: boolean
}

// ═══ Zen Input Component ═══
const ZenInput: React.FC<{
  label: string
  kanji: string
  id: string
  required?: boolean
  error?: string
  type?: string
  autoComplete?: string
  placeholder?: string
  register: any
}> = ({ label, kanji, id, required, error, type = 'text', autoComplete, placeholder, register }) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={id}
      className="flex items-center gap-2 text-xs font-light text-foreground/50 tracking-wide"
      style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
    >
      <span className="zen-kanji text-[10px]" style={{ color: 'var(--matcha)', opacity: 0.35 }}>{kanji}</span>
      {label}{required && <span style={{ color: 'var(--matcha)', opacity: 0.5 }}>*</span>}
    </label>
    <input
      id={id}
      type={type}
      autoComplete={autoComplete}
      placeholder={placeholder}
      {...register}
      className="zen-input w-full px-4 py-3 text-sm font-light text-foreground/80 transition-all duration-500 outline-none"
      style={{
        borderRadius: '2px',
        border: error ? '1px solid rgba(239,68,68,0.4)' : '1px solid var(--border)',
        background: 'transparent',
        fontFamily: "'Noto Serif JP', serif",
        fontWeight: 300,
      }}
    />
    {error && (
      <span className="text-[11px] font-light" style={{ color: '#EF4444', opacity: 0.8 }}>{error}</span>
    )}
  </div>
)



export const AddressForm: React.FC<Props> = ({
  addressID,
  initialData,
  callback,
  skipSubmission,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
  } = useForm<AddressFormValues>({
    defaultValues: initialData,
  })

  const { createAddress, updateAddress } = useAddresses()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State cho GHN address
  const [ghnAddress, setGhnAddress] = useState<GHNAddressValue>({
    province_id: (initialData as any)?.province_id ?? null,
    province_name: (initialData as any)?.province_name ?? '',
    district_id: (initialData as any)?.district_id ?? null,
    district_name: (initialData as any)?.district_name ?? '',
    ward_code: (initialData as any)?.ward_code ?? '',
    ward_name: (initialData as any)?.ward_name ?? '',
  })

  const handleAddressChange = (address: GHNAddressValue) => {
    setGhnAddress(address)
    setValue('addressLine2', address.province_name)
    setValue('city', address.district_name)
    setValue('state', address.ward_name)
    if (address.province_name && address.district_name && address.ward_name) {
      clearErrors(['addressLine2', 'city', 'state'])
    }
  }

  const onSubmit = useCallback(
    async (data: AddressFormValues) => {
      // Validate GHN address
      if (!ghnAddress.province_name || !ghnAddress.district_name || !ghnAddress.ward_name) {
        if (!ghnAddress.province_name) {
          setError('addressLine2', { type: 'manual', message: 'Vui lòng chọn tỉnh/thành phố' })
        }
        if (!ghnAddress.district_name) {
          setError('city', { type: 'manual', message: 'Vui lòng chọn quận/huyện' })
        }
        if (!ghnAddress.ward_name) {
          setError('state', { type: 'manual', message: 'Vui lòng chọn phường/xã' })
        }
        return
      }

      setIsSubmitting(true)
      const newData = deepMergeSimple(initialData || {}, data)

      const addressData = {
        ...newData,
        province_id: ghnAddress.province_id,
        province_name: ghnAddress.province_name,
        district_id: ghnAddress.district_id,
        district_name: ghnAddress.district_name,
        ward_code: ghnAddress.ward_code,
        ward_name: ghnAddress.ward_name,
      }

      if (!skipSubmission) {
        if (addressID) {
          await updateAddress(addressID, addressData)
        } else {
          await createAddress(addressData)
        }
      }

      setIsSubmitting(false)

      if (callback) {
        callback(addressData as Partial<Address>)
      }
    },
    [initialData, skipSubmission, callback, addressID, updateAddress, createAddress, ghnAddress, setError],
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Row 1: Name */}
      <div className="grid grid-cols-2 gap-3">
        <ZenInput
          label="Họ"
          kanji="姓"
          id="firstName"
          required
          autoComplete="given-name"
          error={errors.firstName?.message}
          register={register('firstName', { required: 'Vui lòng nhập họ.' })}
        />
        <ZenInput
          label="Tên"
          kanji="名"
          id="lastName"
          required
          autoComplete="family-name"
          error={errors.lastName?.message}
          register={register('lastName', { required: 'Vui lòng nhập tên.' })}
        />
      </div>

      {/* Row 2: Phone + Company */}
      <div className="grid grid-cols-2 gap-3">
        <ZenInput
          label="Điện thoại"
          kanji="電"
          id="phone"
          type="tel"
          autoComplete="mobile tel"
          placeholder="0xxx xxx xxx"
          error={errors.phone?.message}
          register={register('phone')}
        />
        <ZenInput
          label="Công ty"
          kanji="社"
          id="company"
          autoComplete="organization"
          error={errors.company?.message}
          register={register('company')}
        />
      </div>

      {/* Row 3: Address */}
      <ZenInput
        label="Địa chỉ chi tiết (số nhà, đường)"
        kanji="住"
        id="addressLine1"
        required
        autoComplete="address-line1"
        placeholder="Ví dụ: 123 Đường Trần Phú"
        error={errors.addressLine1?.message}
        register={register('addressLine1', { required: 'Vui lòng nhập địa chỉ chi tiết.' })}
      />

      {/* Row 4: GHN Address Selector */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="zen-kanji text-[10px]" style={{ color: 'var(--matcha)', opacity: 0.35 }}>地</span>
          <span
            className="text-xs font-light text-foreground/50 tracking-wide"
            style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
          >
            Tỉnh / Quận / Phường <span style={{ color: 'var(--matcha)', opacity: 0.5 }}>*</span>
          </span>
        </div>
        <AddressSelector
          onAddressChange={handleAddressChange}
          initialValues={{
            province_id: (initialData as any)?.province_id,
            district_id: (initialData as any)?.district_id,
            ward_code: (initialData as any)?.ward_code,
          }}
        />
        {/* Hidden fields */}
        <input type="hidden" {...register('addressLine2', { required: 'Vui lòng chọn tỉnh/thành phố' })} />
        <input type="hidden" {...register('city', { required: 'Vui lòng chọn quận/huyện' })} />
        <input type="hidden" {...register('state', { required: 'Vui lòng chọn phường/xã' })} />

        {errors.addressLine2 && (
          <span className="text-[11px] font-light mt-1 block" style={{ color: '#EF4444', opacity: 0.8 }}>{errors.addressLine2.message}</span>
        )}
        {errors.city && (
          <span className="text-[11px] font-light mt-1 block" style={{ color: '#EF4444', opacity: 0.8 }}>{errors.city.message}</span>
        )}
        {errors.state && (
          <span className="text-[11px] font-light mt-1 block" style={{ color: '#EF4444', opacity: 0.8 }}>{errors.state.message}</span>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 text-[12px] font-light tracking-widest uppercase transition-all duration-700 cursor-pointer group disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            borderRadius: '2px',
            border: '1px solid rgba(107,122,94,0.3)',
            background: 'linear-gradient(135deg, rgba(107,122,94,0.08) 0%, rgba(196,160,85,0.05) 100%)',
            color: 'var(--foreground)',
            fontFamily: "'Noto Serif JP', serif",
            fontWeight: 300,
          }}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="31.4" strokeDashoffset="10" opacity="0.3" />
              </svg>
              Đang lưu...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {addressID ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ'}
              <svg className="w-3.5 h-3.5 opacity-30 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          )}
        </button>
      </div>
    </form>
  )
}
