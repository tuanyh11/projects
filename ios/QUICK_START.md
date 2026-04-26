# 🚀 Quick Start - iOS Language Settings

## Tóm tắt nhanh

Chức năng cài đặt ngôn ngữ đã được tích hợp hoàn chỉnh vào iOS app. Người dùng có thể:

✅ Chọn ngôn ngữ giao diện (Tiếng Việt, English, Deutsch)  
✅ Lưu preference và đồng bộ với server  
✅ UI cập nhật real-time  
✅ Persistence qua UserDefaults  

## 📁 Files đã tạo/cập nhật

### Mới tạo
1. ✅ `Services/LocalizationService.swift` - Service quản lý đa ngôn ngữ
2. ✅ `Views/SettingsView.swift` - Màn hình Settings hoàn chỉnh

### Đã cập nhật
1. ✅ `LinguaApp.swift` - Thêm LocalizationService và Settings tab
2. ✅ `Views/HomeView.swift` - Sử dụng localization
3. ✅ `Services/APIService.swift` - Thêm endpoint updateUserLanguage
4. ✅ `Models.swift` - Thêm preferredLanguage vào User

## 🎯 Cách sử dụng

### 1. Mở app
```bash
cd language-app/ios/LinguaApp
open LinguaApp.xcodeproj
```

### 2. Build & Run
- Cmd + R
- App sẽ mở với 3 tabs: Home, Languages, Settings

### 3. Test chức năng
1. Tap vào tab **Settings** (⚙️)
2. Tap vào **"Ngôn ngữ giao diện"**
3. Chọn ngôn ngữ khác (English hoặc Deutsch)
4. Tap **"Lưu thay đổi"**
5. Kiểm tra tất cả text đã đổi ngôn ngữ
6. Restart app để test persistence

## 🔑 Translation Keys

Sử dụng trong code:
```swift
Text("home-greeting".localized())  // "Xin chào 👋"
Text("settings-title".localized()) // "Cài đặt"
```

## 📱 Screenshots Flow

```
TabBar
├── Home (🏠)
│   └── Text đã được localized
├── Languages (🌐)
│   └── Danh sách ngôn ngữ học
└── Settings (⚙️)
    ├── Profile Card
    ├── Ngôn ngữ giao diện
    │   └── Tap → LanguagePickerView
    │       ├── 🇻🇳 Tiếng Việt
    │       ├── 🇺🇸 English
    │       └── 🇩🇪 Deutsch
    ├── Tài khoản
    ├── Giao diện
    ├── Thêm
    └── Đăng xuất
```

## 🧪 Test Checklist

- [ ] Mở app lần đầu → Ngôn ngữ mặc định là Tiếng Việt
- [ ] Đổi sang English → UI cập nhật ngay
- [ ] Đổi sang Deutsch → UI cập nhật ngay
- [ ] Restart app → Ngôn ngữ được giữ
- [ ] Chuyển tabs → Text đã được dịch
- [ ] Đăng xuất → Alert hiển thị đúng ngôn ngữ
- [ ] Success message hiển thị sau khi lưu
- [ ] Loading indicator khi đang lưu

## 🐛 Common Issues

### Text không cập nhật?
→ Thêm `@EnvironmentObject var localization: LocalizationService`

### App crash khi lưu?
→ Kiểm tra user đã đăng nhập và network connection

### Ngôn ngữ không persist?
→ Kiểm tra UserDefaults: `UserDefaults.standard.string(forKey: "app_language")`

## 📚 Documentation

Chi tiết đầy đủ xem tại:
- `IOS_LANGUAGE_SETTINGS_GUIDE.md` - Hướng dẫn chi tiết
- `../LANGUAGE_SETTINGS_GUIDE.md` - Hướng dẫn tổng quan

## 🎨 Customization

### Thêm ngôn ngữ mới

1. Thêm translations vào `LocalizationService.swift`:
```swift
case "fr-FR":
    translations = [
        "home-greeting": "Bonjour 👋",
        // ... all keys
    ]
```

2. Thêm vào `LanguagePickerView`:
```swift
("fr-FR", "🇫🇷", "lang-french")
```

### Thêm translation key mới

1. Thêm vào tất cả 3 ngôn ngữ trong `LocalizationService.swift`
2. Sử dụng: `"your-new-key".localized()`

## 💡 Pro Tips

1. **Preview với localization**:
```swift
#Preview {
    SettingsView()
        .environmentObject(LocalizationService.shared)
}
```

2. **Debug translations**:
```swift
print(LocalizationService.shared.translations)
```

3. **Test tất cả ngôn ngữ nhanh**:
```swift
LocalizationService.shared.currentLanguage = "en-US"
LocalizationService.shared.currentLanguage = "de-DE"
LocalizationService.shared.currentLanguage = "vi-VN"
```

## ✅ Done!

Chức năng đã sẵn sàng sử dụng. Enjoy! 🎉

---

**Need help?** Check `IOS_LANGUAGE_SETTINGS_GUIDE.md` for detailed documentation.
