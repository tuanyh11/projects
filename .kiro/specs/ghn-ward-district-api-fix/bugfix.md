# Tài Liệu Yêu Cầu Sửa Lỗi - Tích Hợp API Giao Hàng Nhanh (GHN)

## Giới Thiệu

Hệ thống hiện tại gặp lỗi khi đẩy đơn hàng sang Giao Hàng Nhanh (GHN) trong quá trình checkout. Lỗi xảy ra do API GHN yêu cầu `district_id` (số) và `ward_code` (mã số) nhưng hệ thống đang gửi tên địa chỉ dạng text (`to_district_name`, `to_ward_name`, `to_province_name`).

Theo tài liệu API GHN, endpoint `/shipping-order/create` yêu cầu:
- `to_district_id` (integer): Mã quận/huyện đích
- `to_ward_code` (string): Mã phường/xã đích
- Không chấp nhận tên địa chỉ dạng text

Lỗi này ảnh hưởng đến tất cả đơn hàng khi khách hàng checkout, khiến không thể tạo vận đơn GHN và gây lỗi thanh toán.

## Phân Tích Lỗi

### Hành Vi Hiện Tại (Lỗi)

1.1 KHI khách hàng hoàn tất checkout với địa chỉ giao hàng THÌ hệ thống gửi `to_ward_name`, `to_district_name`, `to_province_name` (dạng text) đến API GHN

1.2 KHI API GHN nhận được request với tên địa chỉ dạng text thay vì mã số THÌ API trả về lỗi "Fail when get place name of to ward code: Lỗi gọi API: tenant_masterdata_get_district_byname - <nil>"

1.3 KHI API GHN trả về lỗi THÌ hệ thống không tạo được mã vận đơn và gây lỗi thanh toán

1.4 KHI người dùng nhập địa chỉ thủ công (addressLine2 = phường, city = quận, state = tỉnh) THÌ hệ thống không có cơ chế chuyển đổi tên địa chỉ sang mã số GHN

### Hành Vi Mong Đợi (Đúng)

2.1 KHI khách hàng nhập địa chỉ giao hàng THÌ hệ thống PHẢI cho phép chọn tỉnh/thành, quận/huyện, phường/xã từ danh sách chuẩn của GHN

2.2 KHI khách hàng chọn địa chỉ từ dropdown THÌ hệ thống PHẢI lưu cả tên và mã số (province_id, district_id, ward_code) vào shippingAddress

2.3 KHI tạo đơn GHN THÌ hệ thống PHẢI gửi `to_district_id` (integer) và `to_ward_code` (string mã số) thay vì tên địa chỉ

2.4 KHI gọi API GHN với đúng district_id và ward_code THÌ hệ thống PHẢI tạo được vận đơn thành công và trả về order_code

2.5 KHI tạo vận đơn thành công THÌ hệ thống PHẢI cập nhật trackingCode và ghnStatus vào đơn hàng

### Hành Vi Không Thay Đổi (Phòng Ngừa Hồi Quy)

3.1 KHI tính phí vận chuyển trong hàm `calculateShippingFee` THÌ hệ thống PHẢI TIẾP TỤC sử dụng `to_district_id` và `to_ward_code` như hiện tại

3.2 KHI đơn hàng đã có trackingCode THÌ hệ thống PHẢI TIẾP TỤC không tạo vận đơn GHN mới

3.3 KHI thiếu cấu hình GHN_TOKEN hoặc GHN_SHOP_ID THÌ hệ thống PHẢI TIẾP TỤC báo lỗi cấu hình

3.4 KHI theo dõi đơn hàng qua `trackGHNOrder` THÌ hệ thống PHẢI TIẾP TỤC hoạt động bình thường với order_code

3.5 KHI hook `syncGHNOrder` được kích hoạt THÌ hệ thống PHẢI TIẾP TỤC kiểm tra điều kiện (!previousDoc?.trackingCode && !doc?.trackingCode && doc?.shippingAddress?.addressLine1)

3.6 KHI tạo đơn GHN thành công THÌ hệ thống PHẢI TIẾP TỤC gửi thông báo Telegram như hiện tại
