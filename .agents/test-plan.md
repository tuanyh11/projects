# 🧪 Kịch bản Test E2E — Hồng Thái E-commerce

## Test Suite 1: Trang chủ (Homepage)
- [ ] 1.1 Trang chủ load thành công
- [ ] 1.2 Hero section hiển thị đúng
- [ ] 1.3 Section sản phẩm nổi bật hiện đủ sản phẩm
- [ ] 1.4 Giá sản phẩm hiển thị đúng (VND, có ₫)
- [ ] 1.5 Quick-add button hoạt động (thêm giỏ, không chuyển trang)

## Test Suite 2: Navigation
- [ ] 2.1 Menu "Đặc sản" → /products
- [ ] 2.2 Menu "Blog" → /blog
- [ ] 2.3 Menu "Homestay" → scroll đến section
- [ ] 2.4 Logo → trang chủ

## Test Suite 3: Trang sản phẩm (/products)
- [ ] 3.1 Listing hiển thị đủ sản phẩm với giá VND
- [ ] 3.2 Quick-add (+) trên product card hoạt động
- [ ] 3.3 Click vào product card → trang chi tiết
- [ ] 3.4 Bộ lọc danh mục hoạt động
- [ ] 3.5 Tìm kiếm sản phẩm hoạt động

## Test Suite 4: Trang chi tiết sản phẩm
- [ ] 4.1 Thông tin sản phẩm đầy đủ (tên, giá, mô tả, ảnh)
- [ ] 4.2 Giá hiển thị đúng VND
- [ ] 4.3 Nút "Thêm vào giỏ" hoạt động
- [ ] 4.4 Số lượng giỏ hàng (badge) tăng sau khi thêm

## Test Suite 5: Giỏ hàng (Cart)
- [ ] 5.1 Mở giỏ hàng — hiện sản phẩm đã thêm
- [ ] 5.2 Checkbox chọn/bỏ chọn từng sản phẩm
- [ ] 5.3 "Chọn tất cả" toggle hoạt động
- [ ] 5.4 Tổng phụ thay đổi theo sản phẩm đã chọn
- [ ] 5.5 Tăng/giảm số lượng sản phẩm
- [ ] 5.6 Xóa sản phẩm khỏi giỏ
- [ ] 5.7 Nút "Thanh toán" disabled khi không chọn sản phẩm

## Test Suite 6: Authentication
- [ ] 6.1 Quick-add khi chưa đăng nhập → redirect login
- [ ] 6.2 Đăng nhập thành công
- [ ] 6.3 Đăng xuất thành công

## Test Suite 7: Checkout
- [ ] 7.1 Trang checkout hiện đúng sản phẩm đã chọn
- [ ] 7.2 Tổng cộng chính xác (chỉ tính sản phẩm đã chọn)
- [ ] 7.3 Thông tin user hiển thị (nếu đã đăng nhập)
- [ ] 7.4 Phương thức thanh toán COD / Stripe

## Test Suite 8: Responsive & UI
- [ ] 8.1 Trang chủ responsive (mobile viewport)
- [ ] 8.2 Footer hiển thị đúng
