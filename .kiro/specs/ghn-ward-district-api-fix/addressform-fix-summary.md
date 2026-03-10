# AddressForm Fix Summary - Save GHN Address IDs to Database

## Problem

The AddressForm component was only saving the address names (province_name, district_name, ward_name) but not the IDs and codes (province_id, district_id, ward_code) that are required by the GHN API. This caused the error "Thiếu thông tin địa chỉ GHN (district_id hoặc ward_code)" during checkout.

## Root Cause

In the `onSubmit` function at line 119 of `src/components/forms/AddressForm/index.tsx`, the code only merged `data` (form values) with `initialData`, but didn't include the `ghnAddress` state which contains the IDs and codes.

```typescript
// BEFORE (INCORRECT)
const newData = deepMergeSimple(initialData || {}, data)

if (!skipSubmission) {
  if (addressID) {
    await updateAddress(addressID, newData)  // Missing GHN IDs!
  } else {
    await createAddress(newData)  // Missing GHN IDs!
  }
}
```

## Solution

Modified the `onSubmit` function to include all 6 GHN address fields when creating/updating addresses:

```typescript
// AFTER (CORRECT)
const newData = deepMergeSimple(initialData || {}, data)

// Add GHN address IDs and codes
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
    await updateAddress(addressID, addressData)  // Now includes GHN IDs!
  } else {
    await createAddress(addressData)  // Now includes GHN IDs!
  }
}

if (callback) {
  callback(addressData)  // Also pass GHN IDs to callback
}
```

## Additional Improvements

1. **Initialize ghnAddress from initialData**: When editing an existing address, the component now properly initializes the `ghnAddress` state from `initialData`:

```typescript
const [ghnAddress, setGhnAddress] = useState({
  province_id: (initialData as any)?.province_id || null,
  province_name: (initialData as any)?.province_name || '',
  district_id: (initialData as any)?.district_id || null,
  district_name: (initialData as any)?.district_name || '',
  ward_code: (initialData as any)?.ward_code || '',
  ward_name: (initialData as any)?.ward_name || '',
})
```

2. **Pass initial values to AddressSelector**: The AddressSelector component now receives the initial values from `initialData`:

```typescript
<AddressSelector
  onAddressChange={handleAddressChange}
  initialValues={{
    province_id: (initialData as any)?.province_id,
    district_id: (initialData as any)?.district_id,
    ward_code: (initialData as any)?.ward_code,
  }}
/>
```

## Files Modified

- `src/components/forms/AddressForm/index.tsx` - Fixed onSubmit function to include GHN IDs
- `tests/int/address-form-integration.int.spec.ts` - Added test to verify GHN IDs are saved

## Test Results

All tests pass:
- ✅ AddressForm Integration tests (4 tests)
- ✅ AddressSelector tests (5 tests)
- ✅ GHN Bug Exploration tests (2 tests)
- ✅ GHN Preservation tests (6 tests)
- ✅ GHN Address Endpoints tests (6 tests)
- ✅ API Integration tests (1 test)

**Total: 24 tests passed**

## Impact

This fix ensures that:
1. When users select an address from the GHN dropdown, all 6 fields are saved to the database
2. The `createGHNOrder` function receives the required `district_id` and `ward_code`
3. GHN API accepts the order creation request without errors
4. Checkout flow completes successfully

## Validation

The fix has been validated by:
1. Unit tests verifying the addressData object includes all GHN fields
2. Integration tests confirming the form submission works correctly
3. Preservation tests ensuring existing functionality is not broken
4. TypeScript compilation with no errors
