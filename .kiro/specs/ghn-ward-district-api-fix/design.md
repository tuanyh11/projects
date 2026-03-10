# Thiết Kế Sửa Lỗi - Tích Hợp API Địa Chỉ GHN

## Tổng Quan

Lỗi hiện tại xảy ra do hệ thống gửi tên địa chỉ dạng text (`to_ward_name`, `to_district_name`, `to_province_name`) đến API GHN, trong khi API yêu cầu mã số (`to_district_id` integer và `to_ward_code` string). 

Giải pháp là thay thế các trường nhập text tự do bằng dropdown chọn từ danh sách chuẩn của GHN, lưu cả tên hiển thị và mã số vào database, sau đó sử dụng mã số khi tạo vận đơn GHN.

Chiến lược sửa lỗi:
1. Thêm các trường mới vào `shippingAddress` để lưu mã số GHN (province_id, district_id, ward_code)
2. Tạo API endpoints để lấy danh sách tỉnh/quận/phường từ GHN
3. Tạo custom field components với dropdown cascading (chọn tỉnh → hiện quận → hiện phường)
4. Sửa hàm `createGHNOrder` để sử dụng mã số thay vì tên text
5. Đảm bảo tất cả chức năng hiện tại (tính phí ship, tracking, notifications) hoạt động bình thường

## Thuật Ngữ

- **Bug_Condition (C)**: Điều kiện kích hoạt lỗi - khi hệ thống gửi tên địa chỉ dạng text thay vì mã số đến API GHN
- **Property (P)**: Hành vi mong đợi - API GHN nhận được `to_district_id` (integer) và `to_ward_code` (string) và tạo vận đơn thành công
- **Preservation**: Các chức năng hiện tại phải hoạt động bình thường (tính phí ship, tracking, telegram notifications)
- **createGHNOrder**: Hàm trong `src/utilities/ghn.ts` tạo vận đơn GHN qua API `/shipping-order/create`
- **shippingAddress**: Object chứa thông tin địa chỉ giao hàng trong Orders collection
- **GHN Master Data API**: API của GHN cung cấp danh sách tỉnh/quận/phường chuẩn
- **Cascading Dropdown**: UI pattern chọn địa chỉ theo thứ tự tỉnh → quận → phường, mỗi cấp phụ thuộc vào cấp trước

## Chi Tiết Lỗi

### Điều Kiện Lỗi (Fault Condition)

Lỗi xảy ra khi khách hàng checkout và hệ thống cố gắng tạo vận đơn GHN. Hàm `createGHNOrder` gửi tên địa chỉ dạng text từ các trường `addressLine2` (phường), `city` (quận), `state` (tỉnh) nhưng API GHN không chấp nhận định dạng này.

**Đặc Tả Hình Thức:**
```
FUNCTION isBugCondition(orderData)
  INPUT: orderData of type Order
  OUTPUT: boolean
  
  RETURN orderData.shippingAddress EXISTS
         AND (orderData.shippingAddress.addressLine2 IS TEXT 
              OR orderData.shippingAddress.city IS TEXT
              OR orderData.shippingAddress.state IS TEXT)
         AND (orderData.shippingAddress.district_id IS NULL
              OR orderData.shippingAddress.ward_code IS NULL)
         AND createGHNOrder_called(orderData)
END FUNCTION
```

### Ví Dụ

- **Ví dụ 1**: Khách hàng nhập "Phường 14" vào addressLine2, "Quận 10" vào city, "Hồ Chí Minh" vào state → API GHN trả về lỗi "Fail when get place name of to ward code"
- **Ví dụ 2**: Khách hàng nhập "Phường Bến Nghé" vào addressLine2, "Quận 1" vào city → API GHN không tìm được mã ward_code tương ứng
- **Ví dụ 3**: Khách hàng nhập sai chính tả "Quan 10" thay vì "Quận 10" → API GHN hoàn toàn không nhận diện được
- **Edge case**: Khách hàng chọn đúng tỉnh/quận/phường từ dropdown → Hệ thống gửi district_id=1442 và ward_code="21211" → API GHN tạo vận đơn thành công

## Hành Vi Mong Đợi

### Yêu Cầu Bảo Toàn (Preservation Requirements)

**Hành Vi Không Thay Đổi:**
- Hàm `calculateShippingFee` phải tiếp tục hoạt động với `to_district_id` và `to_ward_code`
- Hook `syncGHNOrder` phải tiếp tục kiểm tra điều kiện `(!previousDoc?.trackingCode && !doc?.trackingCode && doc?.shippingAddress?.addressLine1)`
- Hàm `trackGHNOrder` phải tiếp tục theo dõi đơn hàng bằng `order_code`
- Thông báo Telegram khi có đơn hàng mới phải tiếp tục hoạt động
- Các trường hiện tại trong shippingAddress (firstName, lastName, phone, addressLine1, country) phải giữ nguyên

**Phạm Vi:**
Tất cả các input KHÔNG liên quan đến việc chọn địa chỉ tỉnh/quận/phường phải hoàn toàn không bị ảnh hưởng. Bao gồm:
- Nhập tên, số điện thoại, địa chỉ chi tiết (số nhà, đường)
- Chọn phương thức thanh toán
- Xem lịch sử đơn hàng
- Tracking đơn hàng đã tạo

## Nguyên Nhân Gốc Rễ (Hypothesized Root Cause)

Dựa trên phân tích bug, các nguyên nhân có thể là:

1. **Thiếu Trường Lưu Mã Số**: Schema `shippingAddress` không có các trường `province_id`, `district_id`, `ward_code` để lưu mã số GHN
   - Hiện tại chỉ có `addressLine2` (text), `city` (text), `state` (text)
   - Không có cơ chế mapping từ tên text sang mã số

2. **UI Nhập Tự Do**: Frontend cho phép người dùng nhập text tự do thay vì chọn từ danh sách chuẩn
   - Không có dropdown với dữ liệu từ GHN Master Data API
   - Người dùng có thể nhập sai chính tả hoặc tên không chuẩn

3. **Hàm createGHNOrder Sử Dụng Sai Tham Số**: Hàm gửi `to_ward_name`, `to_district_name`, `to_province_name` thay vì `to_district_id` và `to_ward_code`
   - Dòng 55-57 trong `src/utilities/ghn.ts` sử dụng sai field names
   - API GHN không chấp nhận các tham số này

4. **Thiếu API Endpoints**: Không có endpoints để frontend lấy danh sách tỉnh/quận/phường từ GHN
   - Cần endpoints để gọi GHN Master Data API
   - Cần caching để tránh gọi API GHN quá nhiều lần

## Thuộc Tính Đúng Đắn (Correctness Properties)

Property 1: Fault Condition - Tạo Vận Đơn GHN Thành Công

_Với mọi_ đơn hàng có địa chỉ giao hàng được chọn từ dropdown GHN (có district_id và ward_code hợp lệ), hàm createGHNOrder đã sửa PHẢI gửi `to_district_id` (integer) và `to_ward_code` (string) đến API GHN, và API PHẢI trả về mã vận đơn (order_code) thành công với code 200.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

Property 2: Preservation - Chức Năng Hiện Tại Không Đổi

_Với mọi_ thao tác KHÔNG liên quan đến việc chọn địa chỉ tỉnh/quận/phường (như tính phí ship, tracking đơn hàng, gửi thông báo Telegram), code đã sửa PHẢI tạo ra kết quả giống hệt code gốc, bảo toàn tất cả chức năng hiện tại.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

## Triển Khai Sửa Lỗi

### Các Thay Đổi Cần Thiết

Giả sử phân tích nguyên nhân gốc rễ của chúng ta là đúng:

#### 1. Mở Rộng Schema shippingAddress

**File**: `src/plugins/index.ts`

**Thay Đổi**: Thêm custom address fields vào ecommerce plugin config

**Chi Tiết**:
```typescript
// Trong ecommercePlugin config, thêm addressFields
orders: {
  ordersCollectionOverride: ({ defaultCollection }) => {
    return {
      ...defaultCollection,
      // Thêm custom address fields
      addressFields: [
        ...defaultAddressFields(), // Giữ các field mặc định
        {
          name: 'province_id',
          type: 'number',
          label: 'Mã Tỉnh/Thành (GHN)',
          admin: { readOnly: true, position: 'sidebar' },
        },
        {
          name: 'province_name',
          type: 'text',
          label: 'Tỉnh/Thành',
          admin: { readOnly: true },
        },
        {
          name: 'district_id',
          type: 'number',
          label: 'Mã Quận/Huyện (GHN)',
          admin: { readOnly: true, position: 'sidebar' },
        },
        {
          name: 'district_name',
          type: 'text',
          label: 'Quận/Huyện',
          admin: { readOnly: true },
        },
        {
          name: 'ward_code',
          type: 'text',
          label: 'Mã Phường/Xã (GHN)',
          admin: { readOnly: true, position: 'sidebar' },
        },
        {
          name: 'ward_name',
          type: 'text',
          label: 'Phường/Xã',
          admin: { readOnly: true },
        },
      ],
    }
  }
}
```

**Lý do**: Cần lưu cả tên hiển thị (để hiển thị cho user) và mã số (để gửi API GHN). Các trường cũ (addressLine2, city, state) sẽ deprecated nhưng giữ lại để tương thích ngược.

#### 2. Tạo GHN Master Data API Endpoints

**File**: `src/endpoints/ghn-address.ts` (file mới)

**Chức năng**: Tạo 3 endpoints để lấy danh sách tỉnh/quận/phường từ GHN

**Chi Tiết**:
```typescript
// GET /api/ghn/provinces - Lấy danh sách tỉnh
// GET /api/ghn/districts?province_id=202 - Lấy danh sách quận theo tỉnh
// GET /api/ghn/wards?district_id=1442 - Lấy danh sách phường theo quận
```

**Implementation**:
- Gọi GHN Master Data API: `https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province`
- Gọi GHN Master Data API: `https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district`
- Gọi GHN Master Data API: `https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward`
- Sử dụng GHN_TOKEN từ environment variables
- Cache kết quả trong memory hoặc Redis (optional) để giảm API calls

#### 3. Tạo Custom Field Components

**File**: `src/components/AddressSelector.tsx` (file mới)

**Chức năng**: Client component với 3 dropdown cascading cho tỉnh/quận/phường

**Chi Tiết**:
- Dropdown 1: Chọn tỉnh/thành → Lưu province_id và province_name
- Dropdown 2: Chọn quận/huyện (disabled cho đến khi chọn tỉnh) → Lưu district_id và district_name
- Dropdown 3: Chọn phường/xã (disabled cho đến khi chọn quận) → Lưu ward_code và ward_name
- Sử dụng React hooks (useState, useEffect) để quản lý state
- Gọi API endpoints đã tạo ở bước 2
- Tự động cập nhật các hidden fields (province_id, district_id, ward_code, province_name, district_name, ward_name)

**UI/UX**:
- Loading state khi fetch data
- Error handling nếu API GHN fail
- Clear selection khi thay đổi cấp trên (chọn tỉnh mới → reset quận và phường)

#### 4. Tích Hợp Custom Component vào Checkout Flow

**File**: Cần xác định file checkout frontend (có thể là `src/app/(frontend)/checkout/page.tsx` hoặc tương tự)

**Thay Đổi**: Replace text inputs cho addressLine2, city, state bằng AddressSelector component

**Chi Tiết**:
- Import AddressSelector component
- Pass form state handlers để cập nhật shippingAddress
- Đảm bảo validation: Bắt buộc chọn đủ 3 cấp (tỉnh, quận, phường)
- Giữ lại các trường khác (firstName, lastName, phone, addressLine1) như cũ

#### 5. Sửa Hàm createGHNOrder

**File**: `src/utilities/ghn.ts`

**Function**: `createGHNOrder`

**Thay Đổi Cụ Thể**:
```typescript
// Thay thế dòng 55-57:
// OLD (SAI):
to_ward_name: orderData.shippingAddress?.addressLine2 || 'Phường 14',
to_district_name: orderData.shippingAddress?.city || 'Quận 10',
to_province_name: orderData.shippingAddress?.state || 'Hồ Chí Minh',

// NEW (ĐÚNG):
to_district_id: orderData.shippingAddress?.district_id,
to_ward_code: orderData.shippingAddress?.ward_code,
// Không cần to_province_name, API GHN chỉ cần district_id và ward_code
```

**Validation**: Thêm kiểm tra trước khi gọi API
```typescript
if (!orderData.shippingAddress?.district_id || !orderData.shippingAddress?.ward_code) {
  throw new Error('Thiếu thông tin địa chỉ GHN (district_id hoặc ward_code)')
}
```

#### 6. Cập Nhật Type Definitions

**File**: Chạy lệnh `pnpm generate:types` sau khi thay đổi schema

**Lý do**: Đảm bảo TypeScript types được cập nhật với các trường mới (province_id, district_id, ward_code, etc.)

## Chiến Lược Kiểm Thử

### Phương Pháp Xác Thực

Chiến lược kiểm thử theo hai giai đoạn: đầu tiên, tạo các test case để phát hiện lỗi trên code CHƯA SỬA, sau đó xác minh code đã sửa hoạt động đúng và không làm hỏng chức năng hiện tại.

### Kiểm Tra Khám Phá Điều Kiện Lỗi (Exploratory Fault Condition Checking)

**Mục Tiêu**: Tạo counterexamples chứng minh lỗi TRƯỚC KHI sửa code. Xác nhận hoặc bác bỏ phân tích nguyên nhân gốc rễ. Nếu bác bỏ, cần phân tích lại.

**Kế Hoạch Test**: Viết tests mô phỏng việc tạo đơn hàng với địa chỉ text, gọi `createGHNOrder` trên code CHƯA SỬA, và quan sát lỗi từ API GHN.

**Test Cases**:
1. **Test Địa Chỉ Text Thông Thường**: Tạo order với `addressLine2="Phường 14"`, `city="Quận 10"`, `state="Hồ Chí Minh"` → Gọi createGHNOrder → Expect lỗi "Fail when get place name" (sẽ fail trên code chưa sửa)
2. **Test Địa Chỉ Sai Chính Tả**: Tạo order với `city="Quan 10"` (thiếu dấu) → Expect lỗi từ API GHN (sẽ fail trên code chưa sửa)
3. **Test Thiếu Mã Số**: Tạo order với `district_id=null`, `ward_code=null` → Expect lỗi hoặc API call với tham số sai (sẽ fail trên code chưa sửa)
4. **Test Địa Chỉ Hợp Lệ Với Mã Số**: Tạo order với `district_id=1442`, `ward_code="21211"` → Expect thành công (có thể pass nếu code đã có logic xử lý, nhưng hiện tại không có)

**Counterexamples Mong Đợi**:
- API GHN trả về lỗi 400 hoặc 500 với message chứa "Fail when get place name"
- Nguyên nhân có thể: Hàm createGHNOrder gửi sai tham số (to_ward_name thay vì to_ward_code)

### Kiểm Tra Sửa Lỗi (Fix Checking)

**Mục Tiêu**: Xác minh rằng với mọi input có điều kiện lỗi (có district_id và ward_code hợp lệ), hàm đã sửa tạo vận đơn GHN thành công.

**Pseudocode:**
```
FOR ALL orderData WHERE isBugCondition(orderData) DO
  // Giả sử orderData đã có district_id và ward_code từ dropdown
  result := createGHNOrder_fixed(orderData)
  ASSERT result.code === 200
  ASSERT result.data.order_code EXISTS
  ASSERT result.data.order_code IS STRING
END FOR
```

**Kế Hoạch Test**: Viết property-based tests hoặc unit tests với nhiều địa chỉ GHN hợp lệ khác nhau.

**Test Cases**:
1. **Test Địa Chỉ Hồ Chí Minh**: `district_id=1442` (Quận 10), `ward_code="21211"` (Phường 14) → Expect order_code trả về
2. **Test Địa Chỉ Hà Nội**: `district_id=1482` (Quận Ba Đình), `ward_code="10101"` → Expect order_code trả về
3. **Test Địa Chỉ Đà Nẵng**: `district_id=1490`, `ward_code="20101"` → Expect order_code trả về
4. **Test Nhiều Đơn Hàng**: Tạo 10 đơn hàng với địa chỉ khác nhau → Tất cả phải thành công

### Kiểm Tra Bảo Toàn (Preservation Checking)

**Mục Tiêu**: Xác minh rằng với mọi input KHÔNG có điều kiện lỗi (các chức năng khác), code đã sửa tạo ra kết quả giống hệt code gốc.

**Pseudocode:**
```
FOR ALL operation WHERE NOT relatedToAddressSelection(operation) DO
  ASSERT behavior_original(operation) = behavior_fixed(operation)
END FOR
```

**Phương Pháp Test**: Property-based testing được khuyến nghị vì:
- Tự động tạo nhiều test cases trên toàn bộ input domain
- Phát hiện edge cases mà unit tests thủ công có thể bỏ sót
- Đảm bảo mạnh mẽ rằng hành vi không thay đổi cho tất cả input không liên quan

**Kế Hoạch Test**: Quan sát hành vi trên code CHƯA SỬA trước cho các chức năng không liên quan, sau đó viết property-based tests để capture hành vi đó.

**Test Cases**:
1. **Preservation - Tính Phí Ship**: Gọi `calculateShippingFee` với `to_district_id` và `to_ward_code` → Kết quả phải giống code cũ
2. **Preservation - Tracking Đơn Hàng**: Gọi `trackGHNOrder` với `order_code` → Kết quả phải giống code cũ
3. **Preservation - Hook syncGHNOrder**: Kiểm tra điều kiện `(!previousDoc?.trackingCode && !doc?.trackingCode && doc?.shippingAddress?.addressLine1)` → Logic phải giống code cũ
4. **Preservation - Telegram Notification**: Tạo đơn hàng mới → Thông báo Telegram phải được gửi như cũ
5. **Preservation - Các Trường Khác**: Cập nhật firstName, lastName, phone, addressLine1 → Không bị ảnh hưởng bởi thay đổi

### Unit Tests

- Test GHN API endpoints trả về đúng format (provinces, districts, wards)
- Test AddressSelector component render đúng và handle user interactions
- Test createGHNOrder với các địa chỉ hợp lệ và không hợp lệ
- Test validation: Bắt buộc phải có district_id và ward_code trước khi tạo vận đơn
- Test edge cases: API GHN timeout, trả về lỗi, dữ liệu rỗng

### Property-Based Tests

- Generate random orders với địa chỉ GHN hợp lệ → Verify tất cả tạo vận đơn thành công
- Generate random operations không liên quan đến address selection → Verify hành vi giống code cũ
- Test cascading dropdown logic: Chọn tỉnh → Quận phải match với tỉnh đó, chọn quận → Phường phải match với quận đó

### Integration Tests

- Test full checkout flow: Chọn sản phẩm → Checkout → Chọn địa chỉ từ dropdown → Thanh toán → Verify vận đơn GHN được tạo
- Test admin panel: Xem đơn hàng → Verify hiển thị đúng địa chỉ (cả tên và mã số)
- Test tracking flow: Tạo đơn → Tracking → Verify status cập nhật từ GHN
- Test error scenarios: API GHN down → Verify error handling graceful (không crash app)
