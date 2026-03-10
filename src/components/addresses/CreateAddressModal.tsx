'use client'
import { AddressForm } from '@/components/forms/AddressForm'
import { Address } from '@/payload-types'
import { ChevronDown, Plus, X } from 'lucide-react'
import { DefaultDocumentIDType } from 'payload'
import React, { useEffect, useRef, useState } from 'react'

type Props = {
  addressID?: DefaultDocumentIDType
  initialData?: Partial<Omit<Address, 'country'>> & { country?: string }
  buttonText?: string
  modalTitle?: string
  callback?: (address: Partial<Address>) => void
  skipSubmission?: boolean
  disabled?: boolean
}

export const CreateAddressModal: React.FC<Props> = ({
  addressID,
  initialData,
  buttonText = 'Thêm địa chỉ mới',
  modalTitle = 'Thêm địa chỉ giao hàng',
  callback,
  skipSubmission,
  disabled,
}) => {
  const [open, setOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    if (open && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [open])

  const closePanel = () => {
    setOpen(false)
  }

  const handleCallback = (data: Partial<Address>) => {
    closePanel()
    if (callback) {
      callback(data)
    }
  }

  const isEdit = buttonText === 'Sửa'

  return (
    <div className="w-full">
      {/* ═══ Trigger Button ═══ */}
      {isEdit ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-1.5 text-xs font-light tracking-wide transition-all duration-500 cursor-pointer group"
          style={{
            color: 'var(--matcha)',
            opacity: disabled ? 0.4 : 0.7,
            fontFamily: "'Noto Serif JP', serif",
            fontWeight: 300,
          }}
        >
          <span className="group-hover:opacity-100 transition-opacity duration-500">Sửa</span>
          <ChevronDown
            className="w-3 h-3 transition-transform duration-500"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-center gap-3 transition-all duration-700 cursor-pointer group"
          style={{
            padding: '14px 24px',
            borderRadius: '2px',
            border: open ? '1px solid rgba(107,122,94,0.3)' : '1px dashed var(--border)',
            background: open ? 'rgba(107,122,94,0.04)' : 'transparent',
            color: 'var(--foreground)',
            opacity: disabled ? 0.4 : 1,
          }}
        >
          {open ? (
            <X className="w-4 h-4 text-foreground/40" />
          ) : (
            <Plus className="w-4 h-4 text-foreground/40 group-hover:text-foreground/60 transition-colors duration-500" />
          )}
          <span
            className="text-sm font-light tracking-wide text-foreground/60 group-hover:text-foreground/80 transition-colors duration-500"
            style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
          >
            {open ? 'Đóng' : buttonText}
          </span>
        </button>
      )}

      {/* ═══ Collapsible Form Panel ═══ */}
      <div
        style={{
          maxHeight: open ? `${contentHeight + 40}px` : '0px',
          opacity: open ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease',
        }}
      >
        <div ref={contentRef} className="pt-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <span
              className="zen-kanji text-base"
              style={{ color: 'var(--matcha)', opacity: 0.35 }}
            >
              {isEdit ? '編' : '新'}
            </span>
            <h3
              className="text-base tracking-tight text-foreground/80"
              style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
            >
              {modalTitle}
            </h3>
          </div>

          {/* Separator */}
          <div
            className="mb-5"
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, var(--border) 0%, transparent 100%)',
            }}
          />

          {/* Description */}
          <p
            className="text-xs font-light text-muted-foreground/60 mb-5 leading-relaxed"
            style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
          >
            Địa chỉ này sẽ được lưu vào tài khoản để bạn thanh toán nhanh hơn.
          </p>

          {/* Form */}
          <AddressForm
            addressID={addressID}
            initialData={initialData}
            callback={handleCallback}
            skipSubmission={skipSubmission}
          />
        </div>
      </div>
    </div>
  )
}
