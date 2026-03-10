# Country Field Fix Summary

## Problem
The address collection required the `country` field even though it was removed from the form UI. This caused the error "Field sau không hợp lệ: Quốc gia" (Invalid field: Country) when creating addresses through the frontend.

## Root Cause
The `@payloadcms/plugin-ecommerce` plugin's `createAddressesCollection` function automatically transforms any field with `name === 'country'` into a required select field with predefined country options. This transformation happens after the `addressFields` callback, making it impossible to override the field by modifying it in `addressFields`.

## Solution
Used the `addressesCollectionOverride` configuration option to override the country field after the plugin's transformation:

### Changes Made

1. **src/plugins/index.ts** - Added `addressesCollectionOverride`:
   ```typescript
   addresses: {
     addressesCollectionOverride: ({ defaultCollection }) => {
       // Override the country field to make it optional
       const modifiedFields = defaultCollection.fields?.map((field) => {
         if ('name' in field && field.name === 'country') {
           return {
             ...field,
             required: false,
             defaultValue: 'VN',
           } as typeof field
         }
         return field
       })

       return {
         ...defaultCollection,
         fields: modifiedFields,
       }
     },
     // ... rest of addressFields configuration
   }
   ```

2. **src/components/forms/CheckoutForm/index.tsx** - Updated Stripe billing details:
   - Changed `country: billingAddress?.country` to `country: 'VN'` (hardcoded default)
   - Removed `billingAddress?.country` from the useCallback dependency array

3. **src/endpoints/seed/index.ts** - Removed country field from seed data:
   - Removed `country: 'US'` from `baseAddressUSData`
   - Removed `country: 'GB'` from `baseAddressUKData`

4. **src/app/(app)/(account)/orders/[id]/page.tsx** - Removed unnecessary ts-expect-error:
   - Removed `{/* @ts-expect-error - some kind of type hell */}` comment since types are now correct

5. **Generated Types** - Regenerated payload-types.ts:
   - Country field is now completely optional (removed from the Address interface)
   - PostalCode field remains optional

## Testing
- Integration test `tests/int/address-form-integration.int.spec.ts` passes
- TypeScript compilation passes with no errors
- Addresses can now be created without providing a country field
- Country defaults to 'VN' (Vietnam) when not provided

## Impact
- Frontend address forms no longer fail validation when country is not provided
- Existing addresses with country values are unaffected
- New addresses will default to 'VN' if country is not specified
- Stripe payments will use 'VN' as the default country for billing addresses
