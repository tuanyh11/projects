# Manual Test: Checkout Flow with GHN Address Selector

## Objective
Verify that the AddressSelector component is properly integrated into the checkout flow and enforces GHN address selection.

## Prerequisites
- Application is running (`npm run dev`)
- At least one product exists in the database
- GHN API endpoints are accessible

## Test Steps

### Test 1: Guest Checkout with Address Selection

1. **Add Product to Cart**
   - Navigate to `/shop`
   - Add a product to cart
   - Go to `/checkout`

2. **Enter Email (Guest Checkout)**
   - Enter a valid email address
   - Click "Tiếp tục thanh toán" (Continue to checkout)

3. **Test Address Selector UI**
   - Click "Thêm địa chỉ mới" (Add new address) button
   - Verify the modal opens with AddressForm
   - **Expected**: See 3 dropdown fields for:
     - Tỉnh/Thành phố (Province/City)
     - Quận/Huyện (District) - should be disabled initially
     - Phường/Xã (Ward) - should be disabled initially

4. **Test Cascading Dropdown Behavior**
   - Select a province (e.g., "Hồ Chí Minh")
   - **Expected**: District dropdown becomes enabled and loads districts
   - Select a district (e.g., "Quận 10")
   - **Expected**: Ward dropdown becomes enabled and loads wards
   - Select a ward (e.g., "Phường 14")
   - **Expected**: All 3 levels are selected

5. **Test Validation - Missing Address**
   - Fill in firstName, lastName, phone, addressLine1
   - Do NOT select province/district/ward
   - Click "Submit"
   - **Expected**: Validation errors appear:
     - "Vui lòng chọn tỉnh/thành phố"
     - "Vui lòng chọn quận/huyện"
     - "Vui lòng chọn phường/xã"

6. **Test Successful Address Selection**
   - Select all 3 address levels
   - Fill in all required fields
   - Click "Submit"
   - **Expected**: Address is saved and modal closes
   - **Expected**: Address appears in checkout page with selected values

7. **Test Checkout Completion**
   - Select payment method (COD or Stripe)
   - Click "Tiến hành thanh toán" (Proceed to payment)
   - Complete payment
   - **Expected**: Order is created successfully
   - **Expected**: GHN shipping order is created (check order details in admin)

### Test 2: Logged-in User Checkout

1. **Login**
   - Login with existing user account
   - Add product to cart
   - Go to `/checkout`

2. **Add New Address**
   - Click "Thêm địa chỉ mới"
   - Follow steps 3-6 from Test 1
   - **Expected**: Address is saved to user's account

3. **Select Existing Address**
   - If user has saved addresses, they should appear
   - Select an existing address
   - **Expected**: Address is pre-filled in checkout

### Test 3: Address Reset Behavior

1. **Test Province Change**
   - Select Province A
   - Select District A1
   - Select Ward A1a
   - Change Province to Province B
   - **Expected**: District and Ward selections are reset
   - **Expected**: District dropdown shows districts for Province B

2. **Test District Change**
   - Select Province A
   - Select District A1
   - Select Ward A1a
   - Change District to District A2
   - **Expected**: Ward selection is reset
   - **Expected**: Ward dropdown shows wards for District A2

## Expected Results

### Bug Condition Fixed
- ✅ Users CANNOT enter free-text addresses for province/district/ward
- ✅ Users MUST select from GHN dropdown options
- ✅ Form validation enforces all 3 levels must be selected

### Preservation Requirements
- ✅ Other address fields (firstName, lastName, phone, addressLine1) work as before
- ✅ Payment methods (COD, Stripe) work as before
- ✅ Order creation works as before
- ✅ Logged-in users can save addresses to their account

### Data Validation
After completing checkout, verify in admin panel:
- Order has `shippingAddress` with:
  - `province_id` (number)
  - `province_name` (string)
  - `district_id` (number)
  - `district_name` (string)
  - `ward_code` (string)
  - `ward_name` (string)
  - `addressLine2` = province_name
  - `city` = district_name
  - `state` = ward_name

## Known Issues / Notes

- The AddressSelector component uses inline styles. Consider migrating to Tailwind CSS classes for consistency.
- Loading states are basic. Consider adding skeleton loaders for better UX.
- Error handling could be improved with toast notifications.

## Test Status

- [ ] Test 1: Guest Checkout - Not tested
- [ ] Test 2: Logged-in User Checkout - Not tested
- [ ] Test 3: Address Reset Behavior - Not tested

## Tester Notes

_Add any observations or issues found during manual testing here._
