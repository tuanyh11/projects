'use client'

import { Media } from '@/components/Media'
import { Message } from '@/components/Message'
import { Price } from '@/components/Price'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import { useTheme } from '@/providers/Theme'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { AddressItem } from '@/components/addresses/AddressItem'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses'
import { CheckoutForm } from '@/components/forms/CheckoutForm'
import { CODCheckoutForm } from '@/components/forms/CheckoutFormCOD'
import { MoMoCheckoutForm } from '@/components/forms/CheckoutFormMoMo'
import { VNPayCheckoutForm } from '@/components/forms/CheckoutFormVNPay'
import { FormItem } from '@/components/forms/FormItem'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Checkbox } from '@/components/ui/checkbox'
import { cssVariables } from '@/cssVariables'
import { Address } from '@/payload-types'
import { useCartSelection } from '@/providers/CartSelection'
import { useAddresses, useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { toast } from 'sonner'

const apiKey = `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`
const stripe = loadStripe(apiKey)

function getCartItemId(item: any): string {
  const product = item.product as { id: string }
  const variant = item.variant
  const variantId = variant && typeof variant === 'object' ? variant.id : variant
  return variantId ? `${product.id}_${variantId}` : product.id
}

/* ═══ Zen Section Header ═══ */
function ZenSectionHeader({ kanji, title }: { kanji: string; title: string }) {
  return (
    <div className="flex items-center gap-4 pb-4 mb-2" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="zen-kanji text-base" style={{ color: 'var(--matcha)', opacity: 0.3 }}>
        {kanji}
      </span>
      <h2
        className="text-lg font-light text-foreground/90 m-0"
        style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300, letterSpacing: '0.04em' }}
      >
        {title}
      </h2>
    </div>
  )
}

/* ═══ Zen Button ═══ */
function ZenButton({
  children,
  onClick,
  disabled,
  type = 'button',
  variant = 'primary',
  className = '',
}: {
  children: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
  disabled?: boolean
  type?: 'button' | 'submit'
  variant?: 'primary' | 'outline' | 'ghost'
  className?: string
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: disabled ? 'var(--muted)' : 'var(--matcha)',
      color: disabled ? 'var(--muted-foreground)' : 'var(--washi)',
      border: 'none',
    },
    outline: {
      background: 'transparent',
      color: 'var(--foreground)',
      border: '1px solid var(--border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--foreground)',
      border: 'none',
      opacity: 0.5,
    },
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`btn-zen transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={{
        padding: '12px 28px',
        borderRadius: '2px',
        fontSize: '13px',
        fontFamily: "'Noto Serif JP', serif",
        fontWeight: 300,
        letterSpacing: '0.08em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...styles[variant],
      }}
    >
      {children}
    </button>
  )
}

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { cart } = useCart()
  const { isSelected, selectedCount } = useCartSelection()
  const [error, setError] = useState<null | string>(null)
  const { theme } = useTheme()

  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors, isSubmitSuccessful } } = useForm<{ email: string }>()
  const [email, setEmail] = useState('')
  const [emailEditable, setEmailEditable] = useState(true)

  useEffect(() => {
    if (isSubmitSuccessful) {
      setEmailEditable(false)
    }
  }, [isSubmitSuccessful])

  const [paymentData, setPaymentData] = useState<null | Record<string, unknown>>(null)
  const { initiatePayment } = usePayments()
  const { addresses } = useAddresses()
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>()
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>()
  const [isProcessingPayment, setProcessingPayment] = useState(false)

  const { register: registerCheckout, watch: watchCheckout, setValue: setCheckoutValue } = useForm({
    defaultValues: {
      billingAddressSameAsShipping: true,
      paymentMethod: 'cod' as 'cod' | 'vnpay' | 'momo' | 'stripe'
    }
  })

  const billingAddressSameAsShipping = watchCheckout('billingAddressSameAsShipping')
  const paymentMethod = watchCheckout('paymentMethod')

  const cartIsEmpty = !cart || !cart.items || !cart.items.length

  const canGoToPayment = Boolean(
    (email || user) && billingAddress && (billingAddressSameAsShipping || shippingAddress),
  )

  useEffect(() => {
    if (!shippingAddress) {
      if (addresses && addresses.length > 0) {
        const defaultAddress = addresses[0]
        if (defaultAddress) {
          setBillingAddress(defaultAddress)
        }
      }
    }
  }, [addresses])

  useEffect(() => {
    return () => {
      setShippingAddress(undefined)
      setBillingAddress(undefined)
      setCheckoutValue('billingAddressSameAsShipping', true)
      setEmail('')
      setEmailEditable(true)
    }
  }, [])

  const initiatePaymentIntent = useCallback(
    async (paymentID: string) => {
      try {
        const paymentData = (await initiatePayment(paymentID, {
          additionalData: {
            ...(email ? { customerEmail: email } : {}),
            billingAddress,
            shippingAddress: billingAddressSameAsShipping ? billingAddress : shippingAddress,
          },
        })) as Record<string, unknown>

        if (paymentData) {
          setPaymentData(paymentData)
        }
      } catch (error) {
        let errorData: any = {}
        const msg = error instanceof Error ? error.message : ''

        try {
          if (msg.startsWith('{') || msg.startsWith('[')) {
            errorData = JSON.parse(msg)
          }
        } catch (e) {
          // ignore parse errors
        }

        let errorMessage = 'An error occurred while initiating payment.'

        if (errorData?.cause?.code === 'OutOfStock') {
          errorMessage = 'One or more items in your cart are out of stock.'
        }

        setError(errorMessage)
        toast.error(errorMessage)
      }
    },
    [billingAddress, billingAddressSameAsShipping, shippingAddress],
  )

  if (!stripe) return null

  if (cartIsEmpty && isProcessingPayment) {
    return (
      <div className="py-24 w-full flex flex-col items-center justify-center gap-6">
        <svg width="60" height="60" viewBox="0 0 120 120" fill="none" style={{ opacity: 0.15 }}>
          <path
            d="M60 10 C95,10 110,40 110,60 C110,90 85,110 60,110 C30,110 10,85 10,60 C10,35 30,12 55,10.5"
            stroke="var(--matcha)" strokeWidth="2" strokeLinecap="round" fill="none"
            className="animate-enso"
          />
        </svg>
        <p
          className="text-foreground/50 text-sm font-light"
          style={{ fontFamily: "'Noto Serif JP', serif", letterSpacing: '0.06em' }}
        >
          Đang xử lý thanh toán...
        </p>
        <LoadingSpinner />
      </div>
    )
  }

  if (cartIsEmpty) {
    return (
      <div className="py-24 flex flex-col items-center gap-6 text-center">
        <svg width="60" height="60" viewBox="0 0 120 120" fill="none" style={{ opacity: 0.1 }}>
          <path
            d="M60 10 C95,10 110,40 110,60 C110,90 85,110 60,110 C30,110 10,85 10,60 C10,35 30,12 55,10.5"
            stroke="var(--matcha)" strokeWidth="2" strokeLinecap="round" fill="none"
          />
        </svg>
        <p className="text-foreground/50 text-sm font-light" style={{ fontFamily: "'Noto Serif JP', serif" }}>
          Giỏ hàng trống
        </p>
        <Link
          href="/products"
          className="text-[11px] font-light tracking-[0.15em] uppercase text-foreground/40 hover:text-foreground transition-colors duration-500 border-b border-border/30 pb-1"
          style={{ fontFamily: "'Noto Serif JP', serif" }}
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-stretch justify-stretch my-4 md:flex-row grow gap-10 lg:gap-14">
      {/* ═══ LEFT COLUMN — Form ═══ */}
      <div className="basis-full lg:basis-2/3 flex flex-col gap-10 justify-stretch">

        {/* ─── Section 1: Contact Info ─── */}
        <div className="flex flex-col gap-5">
          <ZenSectionHeader kanji="連" title="Thông tin liên hệ" />

          {!user && (
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{
                background: 'rgba(107, 122, 94, 0.04)',
                border: '1px solid rgba(107, 122, 94, 0.12)',
                borderRadius: '2px',
                padding: '20px 24px',
              }}
            >
              <div>
                <h3
                  className="text-sm font-light text-foreground/70 mb-1"
                  style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
                >
                  Bạn đã có tài khoản?
                </h3>
                <p className="text-muted-foreground/60 text-xs font-light m-0 leading-relaxed">
                  Đăng nhập để thanh toán nhanh hơn và theo dõi đơn hàng dễ dàng.
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <Link
                  href="/login"
                  className="text-[12px] font-light tracking-[0.1em] text-foreground/60 hover:text-foreground transition-colors duration-500 px-5 py-2.5 no-underline"
                  style={{
                    background: 'var(--matcha)',
                    color: 'var(--washi)',
                    borderRadius: '2px',
                    fontFamily: "'Noto Serif JP', serif",
                  }}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/create-account"
                  className="text-[11px] font-light text-foreground/40 hover:text-foreground transition-colors duration-500 border-b border-border/30 pb-0.5"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  Đăng ký
                </Link>
              </div>
            </div>
          )}

          {user ? (
            <div
              className="flex items-center justify-between"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '2px',
                padding: '20px 24px',
              }}
            >
              <div className="flex items-center gap-4">
                {/* Zen user icon */}
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '2px',
                    border: '1px solid var(--border)',
                    background: 'rgba(107, 122, 94, 0.04)',
                  }}
                >
                  <span className="zen-kanji text-sm" style={{ color: 'var(--matcha)', opacity: 0.7 }}>人</span>
                </div>
                <div>
                  <p
                    className="text-sm font-light text-foreground/80"
                    style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
                  >
                    {user.name || 'Thành viên'}
                  </p>
                  <p className="text-xs text-muted-foreground/60 font-light mt-0.5">{user.email}</p>
                </div>
              </div>
              <Link
                className="text-[10px] font-light text-foreground/40 hover:text-foreground/70 transition-colors duration-500 tracking-widest uppercase no-underline"
                href="/logout"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                Đăng xuất
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleEmailSubmit((data: { email: string }) => {
                setEmail(data.email)
              })}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '2px',
                padding: '24px',
              }}
            >
              <p className="mb-4 text-muted-foreground/60 text-xs font-light leading-relaxed">
                Nhập email của bạn để tiếp tục với tư cách khách.
              </p>

              <FormItem className="mb-5">
                <Label
                  htmlFor="email"
                  className="text-[11px] font-light mb-2 block text-foreground/60 tracking-wide"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  Địa chỉ Email
                </Label>
                <Input
                  className="h-11 px-4 text-sm font-light"
                  style={{
                    borderRadius: '2px',
                    border: `1px solid ${emailErrors.email ? 'var(--error)' : 'var(--border)'}`,
                    background: 'var(--washi)',
                    fontFamily: "'Noto Serif JP', serif",
                  }}
                  disabled={!emailEditable}
                  id="email"
                  placeholder="ví dụ: email@domain.com"
                  {...registerEmail('email', {
                    required: 'Vui lòng nhập email',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Email không hợp lệ'
                    }
                  })}
                  type="email"
                />
                {emailErrors.email && (
                  <span className="text-xs mt-1 inline-block font-light" style={{ color: 'var(--error)' }}>
                    {emailErrors.email.message}
                  </span>
                )}
              </FormItem>

              <ZenButton type="submit" disabled={!emailEditable}>
                Tiếp tục thanh toán
              </ZenButton>
            </form>
          )}
        </div>

        {/* ─── Section 2: Address ─── */}
        <div className="flex flex-col gap-5">
          <ZenSectionHeader kanji="地" title="Địa chỉ giao hàng & thanh toán" />

          {billingAddress ? (
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '2px',
                padding: '20px 24px',
              }}
            >
              <AddressItem
                actions={
                  <ZenButton
                    variant="outline"
                    disabled={Boolean(paymentData)}
                    onClick={(e) => {
                      e.preventDefault()
                      setBillingAddress(undefined)
                    }}
                  >
                    Xóa
                  </ZenButton>
                }
                address={billingAddress}
              />
            </div>
          ) : user ? (
            <CheckoutAddresses heading="Billing address" setAddress={setBillingAddress} />
          ) : (
            <CreateAddressModal
              disabled={!email || Boolean(emailEditable)}
              callback={(address) => {
                setBillingAddress(address)
              }}
              skipSubmission={true}
            />
          )}

          <div className="flex gap-3 items-center">
            <Checkbox
              id="shippingTheSameAsBilling"
              checked={billingAddressSameAsShipping}
              disabled={Boolean(paymentData || (!user && (!email || Boolean(emailEditable))))}
              onCheckedChange={(state) => {
                setCheckoutValue('billingAddressSameAsShipping', state as boolean)
              }}
            />
            <Label
              htmlFor="shippingTheSameAsBilling"
              className="text-[12px] font-light text-foreground/60 tracking-wide cursor-pointer"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              Địa chỉ giao hàng giống địa chỉ thanh toán
            </Label>
          </div>

          {!billingAddressSameAsShipping && (
            <>
              {shippingAddress ? (
                <div
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '2px',
                    padding: '20px 24px',
                  }}
                >
                  <AddressItem
                    actions={
                      <ZenButton
                        variant="outline"
                        disabled={Boolean(paymentData)}
                        onClick={(e) => {
                          e.preventDefault()
                          setShippingAddress(undefined)
                        }}
                      >
                        Xóa
                      </ZenButton>
                    }
                    address={shippingAddress}
                  />
                </div>
              ) : user ? (
                <CheckoutAddresses
                  heading="Shipping address"
                  description="Please select a shipping address."
                  setAddress={setShippingAddress}
                />
              ) : (
                <CreateAddressModal
                  callback={(address) => {
                    setShippingAddress(address)
                  }}
                  disabled={!email || Boolean(emailEditable)}
                  skipSubmission={true}
                />
              )}
            </>
          )}

          {/* ─── Section 3: Payment Method ─── */}
          {!paymentData && (
            <div className="flex flex-col gap-5 mt-4">
              <ZenSectionHeader kanji="払" title="Phương thức thanh toán" />

              <div className="flex flex-col gap-3">
                {/* COD Option */}
                <label
                  className="flex items-center gap-4 cursor-pointer transition-all duration-500"
                  style={{
                    padding: '16px 20px',
                    borderRadius: '2px',
                    border: paymentMethod === 'cod'
                      ? '1px solid rgba(107, 122, 94, 0.3)'
                      : '1px solid var(--border)',
                    background: paymentMethod === 'cod'
                      ? 'rgba(107, 122, 94, 0.04)'
                      : 'var(--card)',
                  }}
                >
                  <input
                    type="radio"
                    value="cod"
                    {...registerCheckout('paymentMethod')}
                    className="w-4 h-4 accent-[var(--matcha)]"
                  />
                  <div className="flex flex-col">
                    <span
                      className="text-sm font-light text-foreground/70"
                      style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
                    >
                      Thanh toán khi nhận hàng (COD)
                    </span>
                    <span className="text-[11px] text-muted-foreground/50 mt-1 font-light leading-relaxed">
                      Bạn sẽ thanh toán bằng tiền mặt khi hàng được giao đến.
                    </span>
                  </div>
                </label>

                {/* VNPay Option */}
                <label
                  className="flex items-center gap-4 cursor-pointer transition-all duration-500"
                  style={{
                    padding: '16px 20px',
                    borderRadius: '2px',
                    border: paymentMethod === 'vnpay'
                      ? '1px solid rgba(0, 91, 172, 0.3)'
                      : '1px solid var(--border)',
                    background: paymentMethod === 'vnpay'
                      ? 'rgba(0, 91, 172, 0.04)'
                      : 'var(--card)',
                  }}
                >
                  <input
                    type="radio"
                    value="vnpay"
                    {...registerCheckout('paymentMethod')}
                    className="w-4 h-4"
                    style={{ accentColor: '#005BAC' }}
                  />
                  <div className="flex items-center gap-3">
                    {/* VNPay logo */}
                    <div
                      style={{
                        background: '#005BAC',
                        borderRadius: '3px',
                        padding: '3px 7px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '10px' }}>VN</span>
                      <span style={{ color: '#FFB800', fontWeight: 700, fontSize: '10px' }}>PAY</span>
                    </div>
                    <div className="flex flex-col">
                      <span
                        className="text-sm font-light text-foreground/70"
                        style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
                      >
                        Thanh toán qua VNPay
                      </span>
                      <span className="text-[11px] text-muted-foreground/50 mt-0.5 font-light leading-relaxed">
                        ATM, Internet Banking, QR Code, Ví điện tử.
                      </span>
                    </div>
                  </div>
                </label>

                {/* MoMo Option — Đang phát triển */}
                {/* <div
                  className="flex items-center gap-4 transition-all duration-500 relative"
                  style={{
                    padding: '16px 20px',
                    borderRadius: '2px',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  }}
                >
                  <input
                    type="radio"
                    disabled
                    className="w-4 h-4"
                    style={{ accentColor: '#A21B6F' }}
                  />
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #A21B6F 0%, #D0186A 100%)',
                        borderRadius: '5px',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px', fontFamily: 'Arial, sans-serif' }}>M</span>
                    </div>
                    <div className="flex flex-col">
                      <span
                        className="text-sm font-light text-foreground/70"
                        style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
                      >
                        Thanh toán qua MoMo
                      </span>
                      <span className="text-[11px] text-muted-foreground/50 mt-0.5 font-light leading-relaxed">
                        Ví MoMo, ATM, Thẻ Visa/MC, QR Code.
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '12px',
                      fontSize: '9px',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      background: 'rgba(162, 27, 111, 0.1)',
                      color: '#A21B6F',
                      border: '1px solid rgba(162, 27, 111, 0.2)',
                    }}
                  >
                    ĐANG PHÁT TRIỂN
                  </span>
                </div> */}

                {/* Stripe Option — Đang phát triển */}
                {/* <div
                  className="flex items-center gap-4 transition-all duration-500 relative"
                  style={{
                    padding: '16px 20px',
                    borderRadius: '2px',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  }}
                >
                  <input
                    type="radio"
                    disabled
                    className="w-4 h-4"
                    style={{ accentColor: 'var(--matcha)' }}
                  />
                  <div className="flex flex-col">
                    <span
                      className="text-sm font-light text-foreground/70"
                      style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
                    >
                      Thanh toán trực tuyến (Stripe)
                    </span>
                    <span className="text-[11px] text-muted-foreground/50 mt-1 font-light leading-relaxed">
                      Thanh toán bảo mật qua Thẻ tín dụng/Ghi nợ.
                    </span>
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '12px',
                      fontSize: '9px',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      background: 'rgba(107, 122, 94, 0.1)',
                      color: 'var(--matcha)',
                      border: '1px solid rgba(107, 122, 94, 0.2)',
                    }}
                  >
                    ĐANG PHÁT TRIỂN
                  </span>
                </div> */}
              </div>

              {/* Submit Button */}
              <div className="mt-2">
                <ZenButton
                  disabled={!canGoToPayment}
                  onClick={(e) => {
                    e.preventDefault()
                    void initiatePaymentIntent(paymentMethod)
                  }}
                >
                  Tiến hành thanh toán
                </ZenButton>
              </div>
            </div>
          )}

          {!paymentData?.['clientSecret'] && error && (
            <div className="my-6">
              <Message error={error} />
              <ZenButton
                onClick={(e) => {
                  e.preventDefault()
                  router.refresh()
                }}
                className="mt-4"
              >
                Thử lại
              </ZenButton>
            </div>
          )}

          <Suspense fallback={<React.Fragment />}>
            {/* @ts-ignore */}
            {paymentData && paymentData?.['clientSecret'] && (
              <div className="pb-16 flex flex-col gap-6">
                <ZenSectionHeader kanji="金" title="Thanh toán" />

                {error && <p className="text-sm font-light" style={{ color: 'var(--error)' }}>{`Error: ${error}`}</p>}

                {paymentMethod === 'stripe' ? (
                  <Elements
                    options={{
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          borderRadius: '2px',
                          colorPrimary: '#6B7A5E',
                          gridColumnSpacing: '16px',
                          gridRowSpacing: '16px',
                          colorBackground: theme === 'dark' ? '#0a0a0a' : cssVariables.colors.base0,
                          colorDanger: cssVariables.colors.error500,
                          colorDangerText: cssVariables.colors.error500,
                          colorIcon:
                            theme === 'dark' ? cssVariables.colors.base0 : cssVariables.colors.base1000,
                          colorText: theme === 'dark' ? '#858585' : cssVariables.colors.base1000,
                          colorTextPlaceholder: '#858585',
                          fontFamily: "'Noto Serif JP', serif",
                          fontSizeBase: '14px',
                          fontWeightBold: '400',
                          fontWeightNormal: '300',
                          spacingUnit: '4px',
                        },
                      },
                      clientSecret: paymentData['clientSecret'] as string,
                    }}
                    stripe={stripe}
                  >
                    <div className="flex flex-col gap-8">
                      <CheckoutForm
                        customerEmail={email}
                        billingAddress={billingAddress}
                        setProcessingPayment={setProcessingPayment}
                      />
                      <button
                        className="self-start text-[11px] font-light text-foreground/30 hover:text-foreground/60 transition-colors duration-500 tracking-widest uppercase"
                        onClick={() => setPaymentData(null)}
                        style={{ fontFamily: "'Noto Serif JP', serif", background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Trở lại
                      </button>
                    </div>
                  </Elements>
                ) : paymentMethod === 'vnpay' ? (
                  <div className="flex flex-col gap-8 mt-2">
                    <VNPayCheckoutForm
                      customerEmail={email}
                      paymentIntentID={paymentData['paymentIntentID'] as string}
                      paymentUrl={paymentData['paymentUrl'] as string}
                      shippingAddressAsJSON={paymentData['shippingAddressAsJSON'] as string}
                      setProcessingPayment={setProcessingPayment}
                      setError={setError}
                    />
                    <button
                      className="self-start text-[11px] font-light text-foreground/30 hover:text-foreground/60 transition-colors duration-500 tracking-widest uppercase"
                      onClick={() => setPaymentData(null)}
                      style={{ fontFamily: "'Noto Serif JP', serif", background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Trở lại
                    </button>
                  </div>
                ) : paymentMethod === 'momo' ? (
                  <div className="flex flex-col gap-8 mt-2">
                    <MoMoCheckoutForm
                      customerEmail={email}
                      paymentIntentID={paymentData['paymentIntentID'] as string}
                      paymentUrl={paymentData['paymentUrl'] as string}
                      qrCodeUrl={paymentData['qrCodeUrl'] as string | undefined}
                      shippingAddressAsJSON={paymentData['shippingAddressAsJSON'] as string}
                      setProcessingPayment={setProcessingPayment}
                      setError={setError}
                    />
                    <button
                      className="self-start text-[11px] font-light text-foreground/30 hover:text-foreground/60 transition-colors duration-500 tracking-widest uppercase"
                      onClick={() => setPaymentData(null)}
                      style={{ fontFamily: "'Noto Serif JP', serif", background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Trở lại
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-8 mt-2">
                    <CODCheckoutForm
                      customerEmail={email}
                      paymentIntentID={paymentData['paymentIntentID'] as string}
                      shippingAddressAsJSON={paymentData['shippingAddressAsJSON'] as string}
                      setProcessingPayment={setProcessingPayment}
                      setError={setError}
                    />
                    <button
                      className="self-start text-[11px] font-light text-foreground/30 hover:text-foreground/60 transition-colors duration-500 tracking-widest uppercase"
                      onClick={() => setPaymentData(null)}
                      style={{ fontFamily: "'Noto Serif JP', serif", background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Trở lại
                    </button>
                  </div>
                )}
              </div>
            )}
          </Suspense>
        </div>
      </div>

      {/* ═══ RIGHT COLUMN — Order Summary ═══ */}
      {!cartIsEmpty && (() => {
        const selectedItems = cart?.items?.filter((item) => {
          if (typeof item.product !== 'object' || !item.product) return false
          return isSelected(getCartItemId(item))
        }) || []

        const selectedSubtotal = selectedItems.reduce((sum, item) => {
          if (typeof item.product !== 'object' || !item.product) return sum
          const variant = item.variant
          const isVar = Boolean(variant) && typeof variant === 'object'
          const price = isVar ? variant?.priceInVND : item.product.priceInVND
          return sum + (price || 0) * (item.quantity || 0)
        }, 0)

        return (
          <div className="basis-full lg:basis-1/3 lg:pl-6 relative">
            <div
              className="sticky top-28 flex flex-col gap-6 w-full"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '2px',
                padding: '24px',
              }}
            >
              {/* Order header */}
              <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="zen-kanji text-base" style={{ color: 'var(--matcha)', opacity: 0.7 }}>注</span>
                <h2
                  className="text-base font-light text-foreground/80 m-0"
                  style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300, letterSpacing: '0.04em' }}
                >
                  Đơn hàng ({selectedItems.length} sản phẩm)
                </h2>
              </div>

              {selectedItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground/55 text-xs font-light" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                    Chưa chọn sản phẩm nào.
                  </p>
                  <Link
                    href="/products"
                    className="text-[10px] font-light tracking-[0.15em] uppercase text-foreground/30 hover:text-foreground/60 transition-colors duration-500 border-b border-border/30 pb-0.5 mt-4 inline-block"
                    style={{ fontFamily: "'Noto Serif JP', serif" }}
                  >
                    Quay lại giỏ hàng
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4">
                    {selectedItems.map((item, index) => {
                      if (typeof item.product === 'object' && item.product) {
                        const {
                          product,
                          product: { id, meta, title, gallery },
                          quantity,
                          variant,
                        } = item

                        if (!quantity) return null

                        let image = gallery?.[0]?.image || meta?.image
                        let price = product?.priceInVND

                        const isVariant = Boolean(variant) && typeof variant === 'object'

                        if (isVariant) {
                          price = variant?.priceInVND

                          const imageVariant = product.gallery?.find((item: any) => {
                            if (!item.variantOption) return false
                            const variantOptionID =
                              typeof item.variantOption === 'object'
                                ? item.variantOption.id
                                : item.variantOption

                            const hasMatch = variant?.options?.some((option: any) => {
                              if (typeof option === 'object') return option.id === variantOptionID
                              else return option === variantOptionID
                            })

                            return hasMatch
                          })

                          if (imageVariant && typeof imageVariant.image !== 'string') {
                            image = imageVariant.image
                          }
                        }

                        return (
                          <div
                            className="flex items-start gap-3"
                            key={index}
                            style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(221, 217, 208, 0.4)' }}
                          >
                            {/* Product image */}
                            <div
                              className="relative overflow-hidden shrink-0"
                              style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '2px',
                                border: '1px solid var(--border)',
                              }}
                            >
                              {image && typeof image !== 'string' && (
                                <Media className="" fill imgClassName="object-cover" resource={image} />
                              )}
                            </div>

                            {/* Product info */}
                            <div className="flex grow justify-between items-start gap-2 min-w-0">
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <p
                                  className="text-[13px] font-light text-foreground/80 leading-snug line-clamp-2"
                                  style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 300 }}
                                >
                                  {title}
                                </p>
                                {variant && typeof variant === 'object' && (
                                  <p className="text-[10px] text-muted-foreground/40 font-light tracking-wide">
                                    {variant.options
                                      ?.map((option: any) => {
                                        if (typeof option === 'object') return option.label
                                        return null
                                      })
                                      .join(', ')}
                                  </p>
                                )}
                                <span className="text-[10px] text-muted-foreground/55 font-light mt-0.5">
                                  Số lượng: {quantity}
                                </span>
                              </div>

                              {typeof price === 'number' && (
                                <div className="shrink-0" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                                  <Price className="text-[13px] font-light text-foreground/70" amount={price * (quantity || 1)} />
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>

                  {/* Total */}
                  <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--matcha), var(--kincha), transparent)', opacity: 0.2 }} />

                  <div className="flex justify-between items-center">
                    <span
                      className="text-[11px] font-light text-foreground/40 tracking-[0.15em] uppercase"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      Tổng cộng
                    </span>
                    <div style={{ fontFamily: "'Noto Serif JP', serif" }}>
                      <Price className="text-xl font-light text-foreground/80" amount={selectedSubtotal} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
