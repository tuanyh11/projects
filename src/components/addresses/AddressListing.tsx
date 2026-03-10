'use client'

import { AddressItem } from '@/components/addresses/AddressItem'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import { MapPin } from 'lucide-react'
import React from 'react'

export const AddressListing: React.FC = () => {
  const { addresses } = useAddresses()

  if (!addresses || addresses.length === 0) {
    return (
      <div className="text-center py-10 bg-gradient-to-b from-[#FAFBF8] to-white rounded-2xl border border-dashed border-border/60 flex flex-col items-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 ring-4 ring-muted/20 text-muted-foreground/30">
          <MapPin className="w-8 h-8" />
        </div>
        <p className="text-foreground font-bold text-lg mb-1">Chưa có địa chỉ nào</p>
        <p className="text-muted-foreground text-sm">Vui lòng thêm địa chỉ để thuận tiện hơn khi mua hàng.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1">
      {addresses.map((address) => (
        <AddressItem key={address.id} address={address} />
      ))}
    </div>
  )
}
