# Hướng dẫn Chức năng Cài đặt Ngôn ngữ Giao diện

## Tổng quan

Chức năng cài đặt ngôn ngữ cho phép người dùng tùy chỉnh ngôn ngữ hiển thị của ứng dụng. Hiện tại hỗ trợ 3 ngôn ngữ:
- 🇻🇳 Tiếng Việt (vi-VN)
- 🇺🇸 English (en-US)
- 🇩🇪 Deutsch (de-DE)

## Cấu trúc Dự án

### 1. Database Schema
**File**: `init-scripts/01-schema.sql` và `03-add-user-language-preference.sql`

Đã thêm cột `preferred_language` vào bảng `users`:
```sql
ALTER TABLE users ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'vi-VN';
```

### 2. iOS App

#### LocalizationService
**File**: `ios/LinguaApp/LinguaApp/Services/LocalizationService.swift`

Service quản lý đa ngôn ngữ cho iOS app:
- Lưu trữ ngôn ngữ hiện tại trong UserDefaults
- Load translations từ dictionary
- Đồng bộ với server khi thay đổi ngôn ngữ
- Extension String để dễ dàng sử dụng: `"key".localized()`

#### SettingsView
**File**: `ios/LinguaApp/LinguaApp/Views/SettingsView.swift`

Màn hình cài đặt với các tính năng:
- Hiển thị thông tin profile người dùng
- Chọn ngôn ngữ giao diện
- Lưu preference lên server
- Đăng xuất

#### Cập nhật HomeView
**File**: `ios/LinguaApp/LinguaApp/Views/HomeView.swift`

- Thêm nút Settings vào header
- Sử dụng LocalizationService để hiển thị text đa ngôn ngữ
- Tất cả text được thay thế bằng keys và `.localized()`

#### API Service
**File**: `ios/LinguaApp/LinguaApp/Services/APIService.swift`

Thêm endpoint mới:
```swift
func updateUserLanguage(userId: Int, language: String) async throws
```

#### Models
**File**: `ios/LinguaApp/LinguaApp/Models.swift`

Thêm field `preferredLanguage` vào struct `User`

### 3. Frontend (React/TypeScript)

#### LocalizationContext
**File**: `frontend/src/contexts/LocalizationContext.tsx`

React Context để quản lý đa ngôn ngữ:
- Provider component bọc toàn bộ app
- Hook `useLocalization()` để truy cập translations
- Function `t(key)` để translate
- Lưu preference vào localStorage

#### SettingsPage Component
**File**: `frontend/src/components/SettingsPage.tsx`

Component React cho trang cài đặt:
- Chọn ngôn ngữ với UI đẹp
- Lưu preference
- Hiển thị thông báo thành công
- Các settings khác (Profile, Notifications, About)

#### Styles
**File**: `frontend/src/components/SettingsPage.css`

CSS với gradient đẹp mắt, responsive design

### 4. i18n Files

**Files**: 
- `assets/i18n/vi-VN/main.ftl`
- `assets/i18n/en-US/main.ftl`
- `assets/i18n/de-DE/main.ftl`

Fluent format files chứa tất cả translations cho:
- Home screen
- Settings screen
- Common phrases
- Language names

## Cách Sử dụng

### iOS App

1. **Khởi tạo LocalizationService trong App**:
```swift
import SwiftUI

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

2. **Sử dụng trong View**:
```swift
struct MyView: View {
    @StateObject private var localization = LocalizationService.shared
    
    var body: some View {
        Text("home-greeting".localized())
    }
}
```

3. **Thay đổi ngôn ngữ**:
```swift
Task {
    try await LocalizationService.shared.updateLanguage("en-US")
}
```

### React Frontend

1. **Wrap App với LocalizationProvider**:
```tsx
import { LocalizationProvider } from './contexts/LocalizationContext';

function App() {
  return (
    <LocalizationProvider>
      <YourApp />
    </LocalizationProvider>
  );
}
```

2. **Sử dụng trong Component**:
```tsx
import { useLocalization } from '../contexts/LocalizationContext';

function MyComponent() {
  const { t, currentLanguage, setLanguage } = useLocalization();
  
  return (
    <div>
      <h1>{t('home-greeting')}</h1>
      <button onClick={() => setLanguage('en-US')}>
        Switch to English
      </button>
    </div>
  );
}
```

## Database Migration

Để áp dụng migration cho database hiện tại:

```bash
# PostgreSQL
psql -U your_user -d your_database -f language-app/init-scripts/03-add-user-language-preference.sql

# hoặc nếu dùng Docker
docker exec -i your_postgres_container psql -U your_user -d your_database < language-app/init-scripts/03-add-user-language-preference.sql
```

## API Endpoints

### Cập nhật ngôn ngữ người dùng
```http
PATCH /users?id=eq.{userId}
Content-Type: application/json

{
  "preferred_language": "en-US"
}
```

### Lấy thông tin người dùng (bao gồm ngôn ngữ)
```http
GET /users?id=eq.{userId}
```

Response:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name",
  "preferred_language": "vi-VN",
  "created_at": "2024-01-01T00:00:00Z"
}
```

## Thêm Ngôn ngữ Mới

### 1. Tạo file translation mới
```bash
# Tạo thư mục cho ngôn ngữ mới
mkdir -p assets/i18n/fr-FR

# Tạo file translation
touch assets/i18n/fr-FR/main.ftl
```

### 2. Thêm translations vào LocalizationService (iOS)
```swift
case "fr-FR":
    translations = [
        "home-greeting": "Bonjour 👋",
        "home-subtitle": "Qu'aimeriez-vous apprendre aujourd'hui?",
        // ... thêm các keys khác
    ]
```

### 3. Thêm vào LocalizationContext (React)
```typescript
const translations: Record<string, Translations> = {
  // ... existing languages
  'fr-FR': {
    'home-greeting': 'Bonjour 👋',
    'home-subtitle': "Qu'aimeriez-vous apprendre aujourd'hui?",
    // ... thêm các keys khác
  },
};
```

### 4. Thêm vào danh sách ngôn ngữ
```typescript
// React
const availableLanguages: Language[] = [
  // ... existing languages
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
];

// iOS
let languages = [
  // ... existing languages
  ("fr-FR", "🇫🇷", "lang-french")
]
```

## Testing

### iOS
1. Mở project trong Xcode
2. Build và run trên simulator hoặc device
3. Vào Settings từ Home screen
4. Chọn ngôn ngữ khác nhau
5. Kiểm tra UI cập nhật ngay lập tức

### React
1. Start development server: `npm run dev`
2. Mở browser và navigate đến Settings page
3. Thay đổi ngôn ngữ
4. Kiểm tra localStorage và UI updates

## Lưu ý

1. **Persistence**: 
   - iOS: Lưu trong UserDefaults và sync với server
   - React: Lưu trong localStorage và sync với server

2. **Fallback**: Nếu key không tồn tại, sẽ hiển thị key đó thay vì crash

3. **Performance**: Translations được load một lần khi khởi động app

4. **Server Sync**: Khi user đăng nhập trên device khác, ngôn ngữ sẽ được sync từ server

## Roadmap

- [ ] Thêm nhiều ngôn ngữ hơn (Français, Español, 日本語, 한국어, 中文)
- [ ] Parse Fluent (.ftl) files thay vì hardcode dictionary
- [ ] RTL support cho Arabic, Hebrew
- [ ] Pluralization rules
- [ ] Date/time formatting theo locale
- [ ] Number formatting theo locale
- [ ] Currency formatting

## Liên hệ

Nếu có câu hỏi hoặc cần hỗ trợ, vui lòng tạo issue trên GitHub repository.
