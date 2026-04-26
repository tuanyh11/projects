import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var localization: LocalizationService
    @State private var showLanguagePicker = false
    @State private var selectedLanguage: String
    @State private var isSaving = false
    @State private var showSaveSuccess = false
    @State private var showLogoutAlert = false
    @State private var errorMessage: String?

    init() {
        _selectedLanguage = State(initialValue: LocalizationService.shared.currentLanguage)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Profile Section
                    if let user = AuthService.shared.currentUser {
                        ProfileCard(user: user)
                            .padding(.horizontal)
                    }

                    // Language Settings
                    SettingsSection(title: "settings-language".localized()) {
                        LanguageSettingRow(
                            selectedLanguage: selectedLanguage,
                            onTap: { showLanguagePicker = true }
                        )
                    }

                    // Account Settings
                    SettingsSection(title: "settings-account".localized()) {
                        VStack(spacing: 1) {
                            SettingsRow(
                                icon: "person.circle",
                                title: "settings-profile".localized(),
                                action: { /* Navigate to profile */  }
                            )

                            SettingsRow(
                                icon: "bell.badge",
                                title: "settings-notifications".localized(),
                                action: { /* Navigate to notifications */  }
                            )
                        }
                    }

                    // Appearance Settings
                    SettingsSection(title: "settings-appearance".localized()) {
                        VStack(spacing: 1) {
                            SettingsRow(
                                icon: "paintbrush",
                                title: "settings-theme".localized(),
                                action: { /* Navigate to theme */  }
                            )
                        }
                    }

                    // More Settings
                    SettingsSection(title: "common-more".localized()) {
                        VStack(spacing: 1) {
                            SettingsRow(
                                icon: "lock.shield",
                                title: "settings-privacy".localized(),
                                action: { /* Navigate to privacy */  }
                            )

                            SettingsRow(
                                icon: "questionmark.circle",
                                title: "settings-help".localized(),
                                action: { /* Navigate to help */  }
                            )

                            SettingsRow(
                                icon: "info.circle",
                                title: "settings-about".localized(),
                                action: { /* Navigate to about */  }
                            )
                        }
                    }

                    // Version Info
                    Text("\("settings-version".localized()) 1.0.0")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .padding(.top, 8)

                    // Save Button
                    if selectedLanguage != localization.currentLanguage {
                        SaveButton(
                            isSaving: isSaving,
                            action: saveLanguagePreference
                        )
                        .padding(.horizontal)
                    }

                    // Success Message
                    if showSaveSuccess {
                        SuccessMessage()
                            .padding(.horizontal)
                    }

                    // Error Message
                    if let error = errorMessage {
                        ErrorMessage(message: error)
                            .padding(.horizontal)
                    }

                    // Sign Out Button
                    SignOutButton(action: { showLogoutAlert = true })
                        .padding(.horizontal)
                }
                .padding(.vertical)
            }
            .background(Color.appBg.ignoresSafeArea())
            .navigationTitle("settings-title".localized())
            .navigationBarTitleDisplayMode(.large)
            .sheet(isPresented: $showLanguagePicker) {
                LanguagePickerView(selectedLanguage: $selectedLanguage)
                    .environmentObject(localization)
            }
            .alert("alert-logout-confirm".localized(), isPresented: $showLogoutAlert) {
                Button("common-cancel".localized(), role: .cancel) {}
                Button("settings-logout".localized(), role: .destructive) {
                    AuthService.shared.signOut()
                }
            }
        }
    }

    private func saveLanguagePreference() {
        isSaving = true
        errorMessage = nil

        Task {
            do {
                try await localization.updateLanguage(selectedLanguage)
                await MainActor.run {
                    isSaving = false
                    showSaveSuccess = true
                    // Hide success message after 3 seconds
                    DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                        showSaveSuccess = false
                    }
                }
            } catch {
                print("Failed to save language: \(error)")
                await MainActor.run {
                    isSaving = false
                    errorMessage = "alert-save-error".localized()
                }
            }
        }
    }
}

// MARK: - Profile Card
struct ProfileCard: View {
    let user: User

    var body: some View {
        GlassCard {
            HStack(spacing: 16) {
                // Avatar
                if let avatarUrl = user.avatarUrl, let url = URL(string: avatarUrl) {
                    AsyncImage(url: url) { image in
                        image
                            .resizable()
                            .scaledToFill()
                    } placeholder: {
                        Circle()
                            .fill(Color.appSurface2)
                            .overlay(
                                Text(user.name?.prefix(1).uppercased() ?? "U")
                                    .font(.title2.weight(.semibold))
                            )
                    }
                    .frame(width: 64, height: 64)
                    .clipShape(Circle())
                } else {
                    Circle()
                        .fill(Color.appSurface2)
                        .frame(width: 64, height: 64)
                        .overlay(
                            Text(user.name?.prefix(1).uppercased() ?? "U")
                                .font(.title2.weight(.semibold))
                        )
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(user.name ?? "User")
                        .font(.headline)
                    Text(user.email)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                Spacer()
            }
        }
    }
}

// MARK: - Settings Section
struct SettingsSection<Content: View>: View {
    let title: String
    let content: Content

    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
                .padding(.horizontal)

            content
                .padding(.horizontal)
        }
    }
}

// MARK: - Language Setting Row
struct LanguageSettingRow: View {
    let selectedLanguage: String
    let onTap: () -> Void

    var body: some View {
        GlassCard {
            Button(action: onTap) {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("settings-language".localized())
                                .font(.subheadline.weight(.medium))
                                .foregroundStyle(.primary)

                        }
                        Spacer()
                        HStack(spacing: 6) {
                            Image(systemName: languageIcon(selectedLanguage))
                                .font(.title3)
                                .foregroundStyle(languageColor(selectedLanguage))
                            Text(languageDisplayName(selectedLanguage))
                                .font(.subheadline.weight(.medium))
                                .foregroundStyle(languageColor(selectedLanguage))
                            Image(systemName: "chevron.right")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(.tertiary)
                        }
                    }
                }
            }
        }
    }

    private func languageDisplayName(_ code: String) -> String {
        switch code {
        case "vi-VN": return "lang-vietnamese".localized()
        case "en-US": return "lang-english".localized()
        case "de-DE": return "lang-german".localized()
        default: return code
        }
    }

    private func languageFlag(_ code: String) -> String {
        // Using SF Symbols instead of emoji flags
        switch code {
        case "vi-VN": return "🇻🇳"
        case "en-US": return "🇺🇸"
        case "de-DE": return "🇩🇪"
        default: return "🌐"
        }
    }

    private func languageIcon(_ code: String) -> String {
        // SF Symbol icons for languages
        switch code {
        case "vi-VN": return "v.circle.fill"
        case "en-US": return "e.circle.fill"
        case "de-DE": return "d.circle.fill"
        default: return "globe"
        }
    }

    private func languageColor(_ code: String) -> Color {
        switch code {
        case "vi-VN": return .appPink
        case "en-US": return .appAccent
        case "de-DE": return .appGold
        default: return .appTextMuted
        }
    }
}

// MARK: - Settings Row
struct SettingsRow: View {
    let icon: String
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            GlassCard {
                HStack {
                    Image(systemName: icon)
                        .font(.title3)
                        .foregroundStyle(Color.appAccent)
                        .frame(width: 32)

                    Text(title)
                        .font(.subheadline)
                        .foregroundStyle(.primary)

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.tertiary)
                }
            }
        }
    }
}

// MARK: - Save Button
struct SaveButton: View {
    let isSaving: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                if isSaving {
                    ProgressView()
                        .tint(.white)
                } else {
                    Text("settings-save".localized())
                        .font(.subheadline.weight(.semibold))
                }
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.appAccent)
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        }
        .disabled(isSaving)
    }
}

// MARK: - Success Message
struct SuccessMessage: View {
    var body: some View {
        HStack {
            Image(systemName: "checkmark.circle.fill")
                .foregroundStyle(.green)
            Text("alert-save-success".localized())
                .font(.subheadline)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.green.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .transition(.move(edge: .top).combined(with: .opacity))
    }
}

// MARK: - Error Message
struct ErrorMessage: View {
    let message: String

    var body: some View {
        HStack {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(.red)
            Text(message)
                .font(.subheadline)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.red.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}

// MARK: - Sign Out Button
struct SignOutButton: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                Text("settings-logout".localized())
                    .font(.subheadline.weight(.medium))
            }
            .foregroundStyle(.red)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.appSurface)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        }
    }
}

// MARK: - Language Picker View
struct LanguagePickerView: View {
    @Environment(\.dismiss) var dismiss
    @Binding var selectedLanguage: String
    @EnvironmentObject var localization: LocalizationService

    let languages = [
        ("vi-VN", "v.circle.fill", "lang-vietnamese", Color.appPink),
        ("en-US", "e.circle.fill", "lang-english", Color.appAccent),
        ("de-DE", "d.circle.fill", "lang-german", Color.appYellow),
    ]

    var body: some View {
        NavigationStack {
            List {
                ForEach(languages, id: \.0) { code, icon, nameKey, color in
                    Button(action: {
                        selectedLanguage = code
                        dismiss()
                    }) {
                        HStack(spacing: 16) {
                            ZStack {
                                Circle()
                                    .fill(color.opacity(0.12))
                                    .frame(width: 44, height: 44)
                                Image(systemName: icon)
                                    .font(.title3)
                                    .foregroundStyle(color)
                            }
                            Text(nameKey.localized())
                                .font(.body.weight(.medium))
                                .foregroundStyle(.primary)
                            Spacer()
                            if selectedLanguage == code {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.title3)
                                    .foregroundStyle(color)
                            }
                        }
                        .padding(.vertical, 8)
                    }
                }
            }
            .navigationTitle("settings-language".localized())
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("common-cancel".localized()) {
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    SettingsView()
        .environmentObject(LocalizationService.shared)
}
