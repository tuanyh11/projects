import Foundation
import SwiftUI

class LocalizationService: ObservableObject {
    static let shared = LocalizationService()

    @Published var currentLanguage: String {
        didSet {
            UserDefaults.standard.set(currentLanguage, forKey: "app_language")
            loadTranslations()
            // Notify all views to update
            objectWillChange.send()
        }
    }

    private var translations: [String: String] = [:]

    private init() {
        self.currentLanguage = UserDefaults.standard.string(forKey: "app_language") ?? "vi-VN"
        loadTranslations()
    }

    private func loadTranslations() {
        // Load translations from Fluent files
        // For now, we'll use a simple dictionary approach
        // In production, you'd parse .ftl files properly

        switch currentLanguage {
        case "vi-VN":
            translations = [
                // Tab Bar
                "tab-home": "Trang chủ",
                "tab-languages": "Ngôn ngữ",
                "tab-settings": "Cài đặt",

                // Home Screen
                "home-greeting": "Xin chào 👋",
                "home-subtitle": "Hôm nay bạn muốn học gì?",
                "home-stats-lessons": "Bài Từ vựng",
                "home-stats-stories": "Truyện",
                "home-stats-accuracy": "Chính xác",
                "home-suggestions": "Gợi ý học tập",
                "home-explore-title": "Khám phá Ngôn Ngữ",
                "home-explore-desc":
                    "Vào mục Ngôn ngữ để chọn ngôn ngữ và luyện gõ, học từ vựng mỗi ngày.",
                "home-daily-challenge": "Thử thách hôm nay",
                "home-challenge-title": "Viết một đoạn văn ngắn",
                "home-challenge-desc": "Mô tả kỳ nghỉ mơ ước của bạn.",

                // Settings Screen
                "settings-title": "Cài đặt",
                "settings-language": "Ngôn ngữ",
                "settings-language-desc": "Chọn ngôn ngữ hiển thị cho ứng dụng",
                "settings-account": "Tài khoản",
                "settings-profile": "Hồ sơ",
                "settings-notifications": "Thông báo",
                "settings-about": "Giới thiệu",
                "settings-logout": "Đăng xuất",
                "settings-save": "Lưu thay đổi",
                "settings-appearance": "Giao diện",
                "settings-theme": "Chủ đề",
                "settings-privacy": "Quyền riêng tư",
                "settings-help": "Trợ giúp",
                "settings-version": "Phiên bản",

                // Languages
                "lang-vietnamese": "Tiếng Việt",
                "lang-english": "English",
                "lang-german": "Deutsch",
                "lang-french": "Français",
                "lang-spanish": "Español",
                "lang-japanese": "日本語",
                "lang-korean": "한국어",
                "lang-chinese": "中文",

                // Common
                "common-cancel": "Hủy",
                "common-save": "Lưu",
                "common-edit": "Sửa",
                "common-delete": "Xóa",
                "common-confirm": "Xác nhận",
                "common-loading": "Đang tải...",
                "common-error": "Lỗi",
                "common-success": "Thành công",
                "common-done": "Xong",
                "common-close": "Đóng",
                "common-more": "Thêm",

                // Alerts
                "alert-save-success": "Đã lưu thành công",
                "alert-save-error": "Không thể lưu thay đổi",
                "alert-language-changed": "Ngôn ngữ đã được thay đổi",
                "alert-logout-confirm": "Bạn có chắc muốn đăng xuất?",
            ]
        case "en-US":
            translations = [
                // Tab Bar
                "tab-home": "Home",
                "tab-languages": "Languages",
                "tab-settings": "Settings",

                // Home Screen
                "home-greeting": "Hello 👋",
                "home-subtitle": "What would you like to learn today?",
                "home-stats-lessons": "Vocabulary Lessons",
                "home-stats-stories": "Stories",
                "home-stats-accuracy": "Accuracy",
                "home-suggestions": "Learning Suggestions",
                "home-explore-title": "Explore Languages",
                "home-explore-desc":
                    "Go to Languages section to choose a language and practice typing, learn vocabulary daily.",
                "home-daily-challenge": "Today's Challenge",
                "home-challenge-title": "Write a short paragraph",
                "home-challenge-desc": "Describe your dream vacation.",

                // Settings Screen
                "settings-title": "Settings",
                "settings-language": "Interface Language",
                "settings-language-desc": "Choose your preferred language for the app interface",
                "settings-account": "Account",
                "settings-profile": "Profile",
                "settings-notifications": "Notifications",
                "settings-about": "About",
                "settings-logout": "Sign Out",
                "settings-save": "Save Changes",
                "settings-appearance": "Appearance",
                "settings-theme": "Theme",
                "settings-privacy": "Privacy",
                "settings-help": "Help",
                "settings-version": "Version",

                // Languages
                "lang-vietnamese": "Tiếng Việt",
                "lang-english": "English",
                "lang-german": "Deutsch",
                "lang-french": "Français",
                "lang-spanish": "Español",
                "lang-japanese": "日本語",
                "lang-korean": "한국어",
                "lang-chinese": "中文",

                // Common
                "common-cancel": "Cancel",
                "common-save": "Save",
                "common-edit": "Edit",
                "common-delete": "Delete",
                "common-confirm": "Confirm",
                "common-loading": "Loading...",
                "common-error": "Error",
                "common-success": "Success",
                "common-done": "Done",
                "common-close": "Close",
                "common-more": "More",

                // Alerts
                "alert-save-success": "Saved successfully",
                "alert-save-error": "Failed to save changes",
                "alert-language-changed": "Language has been changed",
                "alert-logout-confirm": "Are you sure you want to sign out?",
            ]
        case "de-DE":
            translations = [
                // Tab Bar
                "tab-home": "Startseite",
                "tab-languages": "Sprachen",
                "tab-settings": "Einstellungen",

                // Home Screen
                "home-greeting": "Hallo 👋",
                "home-subtitle": "Was möchten Sie heute lernen?",
                "home-stats-lessons": "Vokabellektionen",
                "home-stats-stories": "Geschichten",
                "home-stats-accuracy": "Genauigkeit",
                "home-suggestions": "Lernvorschläge",
                "home-explore-title": "Sprachen erkunden",
                "home-explore-desc":
                    "Gehen Sie zum Bereich Sprachen, um eine Sprache auszuwählen und täglich Tippen zu üben und Vokabeln zu lernen.",
                "home-daily-challenge": "Heutige Herausforderung",
                "home-challenge-title": "Schreiben Sie einen kurzen Absatz",
                "home-challenge-desc": "Beschreiben Sie Ihren Traumurlaub.",

                // Settings Screen
                "settings-title": "Einstellungen",
                "settings-language": "Oberflächensprache",
                "settings-language-desc":
                    "Wählen Sie Ihre bevorzugte Sprache für die App-Oberfläche",
                "settings-account": "Konto",
                "settings-profile": "Profil",
                "settings-notifications": "Benachrichtigungen",
                "settings-about": "Über",
                "settings-logout": "Abmelden",
                "settings-save": "Änderungen speichern",
                "settings-appearance": "Aussehen",
                "settings-theme": "Thema",
                "settings-privacy": "Datenschutz",
                "settings-help": "Hilfe",
                "settings-version": "Version",

                // Languages
                "lang-vietnamese": "Tiếng Việt",
                "lang-english": "English",
                "lang-german": "Deutsch",
                "lang-french": "Français",
                "lang-spanish": "Español",
                "lang-japanese": "日本語",
                "lang-korean": "한국어",
                "lang-chinese": "中文",

                // Common
                "common-cancel": "Abbrechen",
                "common-save": "Speichern",
                "common-edit": "Bearbeiten",
                "common-delete": "Löschen",
                "common-confirm": "Bestätigen",
                "common-loading": "Wird geladen...",
                "common-error": "Fehler",
                "common-success": "Erfolg",
                "common-done": "Fertig",
                "common-close": "Schließen",
                "common-more": "Mehr",

                // Alerts
                "alert-save-success": "Erfolgreich gespeichert",
                "alert-save-error": "Änderungen konnten nicht gespeichert werden",
                "alert-language-changed": "Sprache wurde geändert",
                "alert-logout-confirm": "Möchten Sie sich wirklich abmelden?",
            ]
        default:
            translations = [:]
        }
    }

    func translate(_ key: String) -> String {
        return translations[key] ?? key
    }

    func updateLanguage(_ language: String) async throws {
        // Update locally
        await MainActor.run {
            self.currentLanguage = language
        }
    }
}

// Helper extension for easy access
extension String {
    func localized() -> String {
        return LocalizationService.shared.translate(self)
    }
}
