'use client'

import { AddressItem } from '@/components/addresses/AddressItem'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Address } from '@/payload-types'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import { useState } from 'react'

type Props = {
  selectedAddress?: Address
  setAddress: React.Dispatch<React.SetStateAction<Partial<Address> | undefined>>
  heading?: string
  description?: string
  setSubmit?: React.Dispatch<React.SetStateAction<() => void | Promise<void>>>
}

export const CheckoutAddresses: React.FC<Props> = ({
  setAddress,
  heading = 'Địa chỉ',
  description = 'Chọn hoặc thêm địa chỉ giao hàng và thanh toán.',
}) => {
  const { addresses } = useAddresses()

  if (!addresses || addresses.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p
          className="text-xs font-light text-muted-foreground/50"
          style={{ fontFamily: "'Noto Serif JP', serif" }}
        >
          Chưa có địa chỉ. Vui lòng thêm địa chỉ mới.
        </p>
        <CreateAddressModal />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3
          className="text-sm font-light text-foreground/60 mb-1"
          style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
        >
          {heading}
        </h3>
        <p className="text-muted-foreground/40 text-[11px] font-light">{description}</p>
      </div>
      <AddressesModal setAddress={setAddress} />
    </div>
  )
}

const AddressesModal: React.FC<Props> = ({ setAddress }) => {
  const [open, setOpen] = useState(false)
  const handleOpenChange = (state: boolean) => {
    setOpen(state)
  }

  const closeModal = () => {
    setOpen(false)
  }
  const { addresses } = useAddresses()

  if (!addresses || addresses.length === 0) {
    return (
      <p className="text-xs font-light text-muted-foreground/50" style={{ fontFamily: "'Noto Serif JP', serif" }}>
        Chưa có địa chỉ. Vui lòng thêm địa chỉ mới.
      </p>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className="self-start btn-zen transition-all duration-500"
          style={{
            padding: '10px 24px',
            borderRadius: '2px',
            fontSize: '12px',
            fontFamily: "'Noto Serif JP', serif",
            fontWeight: 300,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            background: 'transparent',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            opacity: 0.7,
          }}
        >
          Chọn địa chỉ
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle
            className="text-base font-light"
            style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
          >
            Chọn địa chỉ
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-8">
          <ul className="flex flex-col gap-4">
            {addresses.map((address) => (
              <li key={address.id} className="last:border-none">
                <AddressItem
                  address={address}
                  beforeActions={
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setAddress(address)
                        closeModal()
                      }}
                      className="btn-zen transition-all duration-500"
                      style={{
                        padding: '8px 20px',
                        borderRadius: '2px',
                        fontSize: '11px',
                        fontFamily: "'Noto Serif JP', serif",
                        fontWeight: 300,
                        letterSpacing: '0.08em',
                        cursor: 'pointer',
                        background: 'var(--matcha)',
                        color: 'var(--washi)',
                        border: 'none',
                      }}
                    >
                      Chọn
                    </button>
                  }
                />
              </li>
            ))}
          </ul>

          <CreateAddressModal />
        </div>
      </DialogContent>
    </Dialog>
  )
}
