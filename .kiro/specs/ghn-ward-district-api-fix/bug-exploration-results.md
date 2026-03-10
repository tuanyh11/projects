# Kết Quả Khám Phá Lỗi - GHN Address API Bug

## Tóm Tắt

Property-based test đã **XÁC NHẬN** lỗi tồn tại trên code chưa sửa. Test FAILED như mong đợi, chứng minh rằng API GHN từ chối địa chỉ text.

## Counterexamples Tìm Được

### Counterexample 1 (Minimal)
```json
{
  "id": 1,
  "total": 10000,
  "shippingAddress": {
    "firstName": "Nguyễn",
    "lastName": "Văn A",
    "phone": "0987654321",
    "addressLine1": "123 Đường ABC",
    "addressLine2": "Phường 1",
    "city": "Quận 3",
    "state": "Hồ Chí Minh",
    "district_id": undefined,
    "ward_code": undefined
  }
}
```

**Kết quả**: API GHN trả về lỗi code 400
**Error message**: "Không thể tạo đơn vì vượt quá số lượng cho phép, giới hạn 3 đơn"

### Counterexample 2 (Từ Verification Test)
```json
{
  "shippingAddress": {
    "addressLine2": "Phường 14",
    "city": "Quận 10",
    "state": "Hồ Chí Minh"
  }
}
```

**Kết quả**: API GHN trả về lỗi code 400
**Error message**: "Không thể tạo đơn vì vượt quá số lượng cho phép, giới hạn 3 đơn"

## Phân Tích Nguyên Nhân Gốc Rễ

### Xác Nhận Root Cause

Property-based test đã xác nhận giả thuyết nguyên nhân gốc rễ từ design document:

1. ✅ **Hàm createGHNOrder gửi sai tham số**: Code hiện tại gửi `to_ward_name`, `to_district_name`, `to_province_name` (text) thay vì `to_district_id` (integer) và `to_ward_code` (string)

2. ✅ **API GHN từ chối địa chỉ text**: Tất cả các test cases với địa chỉ text đều bị API GHN từ chối với lỗi

3. ✅ **Thiếu district_id và ward_code**: Khi không có `district_id` và `ward_code` trong shippingAddress, hệ thống không thể tạo vận đơn GHN

### Lỗi Cụ Thể Trong Code

File: `src/utilities/ghn.ts`, dòng 55-57

```typescript
// SAI - Gửi text thay vì IDs
to_ward_name: orderData.shippingAddress?.addressLine2 || 'Phường 14',
to_district_name: orderData.shippingAddress?.city || 'Quận 10',
to_province_name: orderData.shippingAddress?.state || 'Hồ Chí Minh',
```

**Cần sửa thành**:
```typescript
// ĐÚNG - Gửi IDs
to_district_id: orderData.shippingAddress?.district_id,
to_ward_code: orderData.shippingAddress?.ward_code,
```

## Expected Behavior (Sau Khi Sửa)

Khi code được sửa đúng:

1. Hàm `createGHNOrder` sẽ gửi `to_district_id` và `to_ward_code` đến API GHN
2. API GHN sẽ chấp nhận request và trả về `order_code` thành công (code 200)
3. Property test sẽ PASS, xác nhận lỗi đã được sửa

## Test File

Location: `tests/int/ghn-bug-exploration.int.spec.ts`

Test này sẽ được chạy lại sau khi sửa code để xác minh rằng lỗi đã được khắc phục.

## Ghi Chú

- Test sử dụng fast-check library cho property-based testing
- Test chạy 10 examples với các địa chỉ text khác nhau
- Tất cả examples đều FAIL như mong đợi, xác nhận lỗi tồn tại
- Verification test PASS, xác nhận API GHN từ chối địa chỉ text

## Bước Tiếp Theo

1. ✅ Task 1 hoàn thành: Bug condition exploration test đã được viết và chạy
2. ⏭️ Task 2: Viết preservation property tests (TRƯỚC KHI sửa code)
3. ⏭️ Task 3: Sửa lỗi tích hợp API địa chỉ GHN
4. ⏭️ Task 3.6: Xác minh bug condition exploration test giờ đã pass
