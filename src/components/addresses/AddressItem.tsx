'use client'

import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import type { Address } from '@/payload-types'
import React from 'react'

type Props = {
  address: Partial<Omit<Address, 'country'>> & { country?: string }
  actions?: React.ReactNode
  beforeActions?: React.ReactNode
  afterActions?: React.ReactNode
  hideActions?: boolean
}

export const AddressItem: React.FC<Props> = ({
  address,
  actions,
  hideActions = false,
  beforeActions,
  afterActions,
}) => {
  if (!address) {
    return null
  }

  return (
    <div
      className="relative flex flex-col transition-all duration-500"
      style={{
        borderBottom: '1px solid var(--border)',
        borderTop: '1px solid var(--border)',
        padding: '16px 0',
      }}
    >
      {/* Address info */}
      <div className="space-y-2.5">
        <div className="flex items-start gap-3">
          <span className="zen-kanji text-[11px] shrink-0 mt-0.5" style={{ color: 'var(--matcha)', opacity: 0.3, width: '16px', textAlign: 'center' }}>名</span>
          <p
            className="text-sm font-light text-foreground/70"
            style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
          >
            {address.firstName} {address.lastName}
          </p>
        </div>
        {address.phone && (
          <div className="flex items-start gap-3">
            <span className="zen-kanji text-[11px] shrink-0 mt-0.5" style={{ color: 'var(--matcha)', opacity: 0.3, width: '16px', textAlign: 'center' }}>電</span>
            <p className="text-xs font-light text-foreground/50">{address.phone}</p>
          </div>
        )}
        {address.company && (
          <div className="flex items-start gap-3">
            <span className="zen-kanji text-[11px] shrink-0 mt-0.5" style={{ color: 'var(--matcha)', opacity: 0.3, width: '16px', textAlign: 'center' }}>社</span>
            <p className="text-xs font-light text-foreground/50">{address.company}</p>
          </div>
        )}
        <div className="flex items-start gap-3">
          <span className="zen-kanji text-[11px] shrink-0 mt-0.5 opacity-0" style={{ width: '16px' }}>&nbsp;</span>
          <p className="text-xs font-light text-foreground/50 leading-relaxed">
            {address.addressLine1}
            {address.addressLine2 && <>, {address.addressLine2}</>}
            <br />
            {address.city}, {address.state} {address.postalCode}
            {address.country && <><br />{address.country}</>}
          </p>
        </div>
      </div>

      {/* Edit button + collapsible form — full width */}
      {!hideActions && address.id && (
        <div className="w-full mt-3">
          {actions ? (
            actions
          ) : (
            <>
              {beforeActions}
              <CreateAddressModal
                addressID={address.id}
                initialData={address}
                buttonText="Sửa"
                modalTitle="Sửa địa chỉ"
              />
              {afterActions}
            </>
          )}
        </div>
      )}
    </div>
  )
}
