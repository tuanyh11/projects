import { codAdapterClient } from '@/payments/adapters/cod'
import { momoAdapterClient } from '@/payments/adapters/momo'
import { vnpayAdapterClient } from '@/payments/adapters/vnpay'
import { AuthProvider } from '@/providers/Auth'
import { CartSelectionProvider } from '@/providers/CartSelection'
import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
import { stripeAdapterClient } from '@payloadcms/plugin-ecommerce/payments/stripe'
import React from 'react'

import { SonnerProvider } from '@/providers/Sonner'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HeaderThemeProvider>
          <SonnerProvider />
          <EcommerceProvider
            enableVariants={true}
            currenciesConfig={{
              defaultCurrency: 'VND',
              supportedCurrencies: [
                {
                  code: 'VND',
                  decimals: 0,
                  label: 'Vietnamese Dong',
                  symbol: '₫',
                },
              ],
            }}
            api={{
              cartsFetchQuery: {
                depth: 2,
                populate: {
                  products: {
                    slug: true,
                    title: true,
                    gallery: true,
                    inventory: true,
                  },
                  variants: {
                    title: true,
                    inventory: true,
                  },
                },
              },
            }}
            paymentMethods={[
              codAdapterClient(),
              vnpayAdapterClient(),
              momoAdapterClient(),
              stripeAdapterClient({
                publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
              }),
            ]}
          >
            <CartSelectionProvider>
              {children}
            </CartSelectionProvider>
          </EcommerceProvider>
        </HeaderThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
