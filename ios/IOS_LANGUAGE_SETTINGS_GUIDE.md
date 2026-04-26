# Hướng dẫn Cài đặt Ngôn ngữ iOS App

## 📱 Tổng quan

Chức năng cài đặt ngôn ngữ đã được tích hợp hoàn chỉnh vào iOS app với các tính năng:

- ✅ Tab Settings riêng biệt trong TabBar
- ✅ Chọn ngôn ngữ giao diện (Tiếng Việt, English, Deutsch)
- ✅ Lưu preference vào UserDefaults và đồng bộ với server
- ✅ UI cập nhật real-time khi thay đổi ngôn ngữ
- ✅ Profile card hiển thị thông tin người dùng
- ✅ Các settings sections được tổ chức rõ ràng
- ✅ Alert xác nhận khi đăng xuất
- ✅ Success/Error messages

## 🏗️ Kiến trúc

### 1. LocalizationService (Singleton)

**File**: `Services/LocalizationService.swift`

```swift
class LocalizationService: ObservableObject {
    static let shared = LocalizationService()
    @Published var currentLanguage: String
    
    func translate(_ key: String) -> String
    func updateLanguage(_ language: String) async throws
}
```

**Chức năng**:
- Quản lý ngôn ngữ hiện tại
- Load translations từ dictionary
- Đồng bộ với server qua APIService
- Lưu vào UserDefaults
- Notify views khi ngôn ngữ thay đổi

### 2. String Extension

```swift
extension String {
    func localized() -> String {
        return LocalizationService.shared.translate(self)
    }
}
```

**Sử dụng**:
```swift
Text("home-greeting".localized())
// Output: "Xin chào 👋" (nếu ngôn ngữ là vi-VN)
```

### 3. App Structure

**File**: `LinguaApp.swift`

```swift
@main
struct LinguaApp: App {
    @StateObject private var localization = LocalizationService.shared
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(localization)
        }
    }
}
```

**TabView** với 3 tabs:
1. 🏠 Home - Trang chủ
2. 🌐 Languages - Danh sách ngôn ngữ học
3. ⚙️ Settings - Cài đặt

### 4. SettingsView

**File**: `Views/SettingsView.swift`

**Components**:

#### ProfileCard
- Hiển thị avatar, tên, email
- Avatar từ URL hoặc initial letter

#### SettingsSection
- Reusable section với title
- Chứa các settings rows

#### LanguageSettingRow
- Hiển thị ngôn ngữ hiện tại với flag
- Tap để mở LanguagePickerView

#### SettingsRow
- Generic row với icon, title, chevron
- Dùng cho Profile, Notifications, Theme, etc.

#### SaveButton
- Hiện khi có thay đổi ngôn ngữ
- Loading state khi đang lưu

#### SuccessMessage / ErrorMessage
- Hiển thị kết quả sau khi lưu
- Auto dismiss sau 3 giây

#### SignOutButton
- Nút đăng xuất màu đỏ
- Alert xác nhận trước khi đăng xuất

#### LanguagePickerView
- Sheet modal để chọn ngôn ngữ
- List với checkmark cho ngôn ngữ đã chọn
- Cancel button

## 🎨 UI/UX Features

### 1. Real-time Updates
Khi thay đổi ngôn ngữ, tất cả text trong app cập nhật ngay lập tức nhờ:
- `@Published` property trong LocalizationService
- `@EnvironmentObject` trong views
- `objectWillChange.send()` khi thay đổi

### 2. Smooth Animations
- Sheet modal cho language picker
- Fade in/out cho success message
- Button hover effects

### 3. Consistent Design
- Sử dụng GlassCard từ AppTheme
- Color scheme thống nhất
- SF Symbols icons
- Monochrome + accent color

### 4. Error Handling
- Try-catch cho API calls
- Error messages hiển thị rõ ràng
- Fallback khi translation key không tồn tại

## 📝 Translation Keys

### Tab Bar
- `tab-home`: Trang chủ / Home / Startseite
- `tab-languages`: Ngôn ngữ / Languages / Sprachen
- `tab-settings`: Cài đặt / Settings / Einstellungen

### Home Screen
- `home-greeting`: Xin chào 👋
- `home-subtitle`: Hôm nay bạn muốn học gì?
- `home-stats-lessons`: Bài Từ vựng
- `home-stats-stories`: Truyện
- `home-stats-accuracy`: Chính xác
- `home-suggestions`: Gợi ý học tập
- `home-explore-title`: Khám phá Ngôn Ngữ
- `home-explore-desc`: Vào mục Ngôn ngữ...
- `home-daily-challenge`: Thử thách hôm nay
- `home-challenge-title`: Viết một đoạn văn ngắn
- `home-challenge-desc`: Mô tả kỳ nghỉ mơ ước của bạn

### Settings Screen
- `settings-title`: Cài đặt
- `settings-language`: Ngôn ngữ giao diện
- `settings-language-desc`: Chọn ngôn ngữ hiển thị...
- `settings-account`: Tài khoản
- `settings-profile`: Hồ sơ
- `settings-notifications`: Thông báo
- `settings-about`: Giới thiệu
- `settings-logout`: Đăng xuất
- `settings-save`: Lưu thay đổi
- `settings-appearance`: Giao diện
- `settings-theme`: Chủ đề
- `settings-privacy`: Quyền riêng tư
- `settings-help`: Trợ giúp
- `settings-version`: Phiên bản

### Language Names
- `lang-vietnamese`: Tiếng Việt
- `lang-english`: English
- `lang-german`: Deutsch

### Common
- `common-cancel`: Hủy / Cancel / Abbrechen
- `common-save`: Lưu / Save / Speichern
- `common-loading`: Đang tải... / Loading... / Wird geladen...
- `common-error`: Lỗi / Error / Fehler
- `common-success`: Thành công / Success / Erfolg
- `common-done`: Xong / Done / Fertig
- `common-close`: Đóng / Close / Schließen
- `common-more`: Thêm / More / Mehr

### Alerts
- `alert-save-success`: Đã lưu thành công
- `alert-save-error`: Không thể lưu thay đổi
- `alert-language-changed`: Ngôn ngữ đã được thay đổi
- `alert-logout-confirm`: Bạn có chắc muốn đăng xuất?

## 🔧 Cách sử dụng

### 1. Trong View

```swift
struct MyView: View {
    @EnvironmentObject var localization: LocalizationService
    
    var body: some View {
        VStack {
            Text("home-greeting".localized())
            Text("home-subtitle".localized())
        }
    }
}
```

### 2. Thay đổi ngôn ngữ

```swift
Task {
    do {
        try await LocalizationService.shared.updateLanguage("en-US")
        // UI sẽ tự động cập nhật
    } catch {
        print("Error: \(error)")
    }
}
```

### 3. Lấy ngôn ngữ hiện tại

```swift
let currentLang = LocalizationService.shared.currentLanguage
// "vi-VN", "en-US", hoặc "de-DE"
```

## 🧪 Testing

### Manual Testing

1. **Khởi động app**
   - Mở app trong Simulator hoặc device
   - Đăng nhập

2. **Vào Settings tab**
   - Tap vào tab Settings (icon ⚙️)
   - Kiểm tra profile card hiển thị đúng

3. **Thay đổi ngôn ngữ**
   - Tap vào "Ngôn ngữ giao diện"
   - Chọn ngôn ngữ khác (English hoặc Deutsch)
   - Dismiss sheet
   - Kiểm tra nút "Save Changes" xuất hiện

4. **Lưu thay đổi**
   - Tap "Save Changes"
   - Kiểm tra loading indicator
   - Kiểm tra success message
   - Kiểm tra tất cả text trong app đã đổi ngôn ngữ

5. **Kiểm tra persistence**
   - Force quit app
   - Mở lại app
   - Kiểm tra ngôn ngữ vẫn được giữ

6. **Kiểm tra các tabs khác**
   - Chuyển sang Home tab
   - Chuyển sang Languages tab
   - Kiểm tra text đã được dịch

7. **Test đăng xuất**
   - Tap "Đăng xuất"
   - Kiểm tra alert xác nhận
   - Tap "Đăng xuất" trong alert
   - Kiểm tra quay về LoginView

### Unit Testing

```swift
import XCTest
@testable import LinguaApp

class LocalizationServiceTests: XCTestCase {
    var service: LocalizationService!
    
    override func setUp() {
        super.setUp()
        service = LocalizationService.shared
    }
    
    func testDefaultLanguage() {
        XCTAssertEqual(service.currentLanguage, "vi-VN")
    }
    
    func testTranslation() {
        service.currentLanguage = "en-US"
        XCTAssertEqual("home-greeting".localized(), "Hello 👋")
        
        service.currentLanguage = "de-DE"
        XCTAssertEqual("home-greeting".localized(), "Hallo 👋")
    }
    
    func testFallback() {
        let result = "non-existent-key".localized()
        XCTAssertEqual(result, "non-existent-key")
    }
}
```

## 🚀 Build & Run

### Requirements
- Xcode 15.0+
- iOS 17.0+
- Swift 5.9+

### Steps

1. **Mở project**
   ```bash
   cd language-app/ios/LinguaApp
   open LinguaApp.xcodeproj
   ```

2. **Select target**
   - Chọn LinguaApp scheme
   - Chọn simulator hoặc device

3. **Build**
   - Cmd + B để build
   - Kiểm tra không có errors

4. **Run**
   - Cmd + R để run
   - App sẽ mở trong simulator/device

## 🐛 Troubleshooting

### Issue: Text không cập nhật khi đổi ngôn ngữ

**Solution**: Đảm bảo view có `@EnvironmentObject var localization: LocalizationService`

```swift
struct MyView: View {
    @EnvironmentObject var localization: LocalizationService
    // ...
}
```

### Issue: App crash khi lưu ngôn ngữ

**Solution**: Kiểm tra:
1. User đã đăng nhập chưa
2. API endpoint đúng chưa
3. Network connection

### Issue: Ngôn ngữ không persist sau khi restart

**Solution**: Kiểm tra UserDefaults:
```swift
UserDefaults.standard.string(forKey: "app_language")
```

### Issue: Translation key hiển thị thay vì text

**Solution**: 
1. Kiểm tra key có trong dictionary không
2. Kiểm tra spelling của key
3. Thêm key vào tất cả 3 ngôn ngữ

## 📦 Thêm ngôn ngữ mới

### 1. Thêm vào LocalizationService

```swift
case "fr-FR":
    translations = [
        "tab-home": "Accueil",
        "tab-languages": "Langues",
        "tab-settings": "Paramètres",
        "home-greeting": "Bonjour 👋",
        // ... thêm tất cả keys
    ]
```

### 2. Thêm vào LanguagePickerView

```swift
let languages = [
    ("vi-VN", "🇻🇳", "lang-vietnamese"),
    ("en-US", "🇺🇸", "lang-english"),
    ("de-DE", "🇩🇪", "lang-german"),
    ("fr-FR", "🇫🇷", "lang-french")  // Thêm dòng này
]
```

### 3. Thêm language name

```swift
// Trong tất cả 3 ngôn ngữ hiện tại
"lang-french": "Français"
```

### 4. Cập nhật LanguageSettingRow

```swift
private func languageDisplayName(_ code: String) -> String {
    switch code {
    case "vi-VN": return "lang-vietnamese".localized()
    case "en-US": return "lang-english".localized()
    case "de-DE": return "lang-german".localized()
    case "fr-FR": return "lang-french".localized()  // Thêm
    default: return code
    }
}

private func languageFlag(_ code: String) -> String {
    switch code {
    case "vi-VN": return "🇻🇳"
    case "en-US": return "🇺🇸"
    case "de-DE": return "🇩🇪"
    case "fr-FR": return "🇫🇷"  // Thêm
    default: return "🌐"
    }
}
```

## 🎯 Best Practices

1. **Luôn dùng translation keys**
   - ❌ `Text("Xin chào")`
   - ✅ `Text("home-greeting".localized())`

2. **Naming convention cho keys**
   - Format: `section-component-description`
   - Example: `home-stats-lessons`, `settings-language-desc`

3. **Fallback behavior**
   - Nếu key không tồn tại, hiển thị key đó
   - Không crash app

4. **Performance**
   - Translations load một lần khi init
   - Không parse file mỗi lần translate

5. **Testing**
   - Test tất cả ngôn ngữ
   - Test edge cases (empty strings, special characters)
   - Test persistence

## 📚 Resources

- [Apple Human Interface Guidelines - Localization](https://developer.apple.com/design/human-interface-guidelines/localization)
- [SwiftUI Localization](https://developer.apple.com/documentation/swiftui/localization)
- [Fluent Format](https://projectfluent.org/)

## 🔮 Future Enhancements

- [ ] Parse .ftl files thay vì hardcode dictionary
- [ ] Thêm nhiều ngôn ngữ (Français, Español, 日本語, 한국어, 中文)
- [ ] RTL support (Arabic, Hebrew)
- [ ] Pluralization rules
- [ ] Date/time formatting theo locale
- [ ] Number formatting theo locale
- [ ] Currency formatting
- [ ] Voice-over support
- [ ] Dynamic Type support
- [ ] Accessibility improvements

## 💡 Tips

1. **Reload app sau khi đổi ngôn ngữ**: Không cần! UI tự động cập nhật
2. **Test trên device thật**: Một số features khác nhau giữa simulator và device
3. **Sử dụng Xcode Previews**: Thêm `.environmentObject(LocalizationService.shared)` vào preview
4. **Debug translations**: Print `LocalizationService.shared.translations` để xem tất cả keys

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra console logs
2. Kiểm tra network requests
3. Kiểm tra UserDefaults
4. Tạo issue trên GitHub với:
   - Xcode version
   - iOS version
   - Steps to reproduce
   - Screenshots/videos

---

**Chúc bạn code vui vẻ! 🎉**
