import SwiftUI

struct LanguagesView: View {
    @State private var languages: [Language] = []
    @State private var isLoading = true
    @State private var errorMessage: String?

    let columns = [
        GridItem(.flexible(), spacing: 16),
        GridItem(.flexible(), spacing: 16)
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBg.ignoresSafeArea()

                if isLoading {
                    ScrollView {
                        LazyVGrid(columns: columns, spacing: 16) {
                            ForEach(0..<6, id: \.self) { _ in
                                ShimmerView()
                                    .frame(height: 140)
                            }
                        }
                        .padding()
                    }
                } else if let error = errorMessage {
                    EmptyStateView(
                        icon: "exclamationmark.triangle",
                        title: "Lỗi Tải Dữ Liệu",
                        subtitle: error
                    )
                } else if languages.isEmpty {
                    EmptyStateView(
                        icon: "globe",
                        title: "Chưa Có Ngôn Ngữ",
                        subtitle: "Hiện chưa có ngôn ngữ nào."
                    )
                } else {
                    ScrollView {
                        LazyVGrid(columns: columns, spacing: 16) {
                            ForEach(languages) { language in
                                NavigationLink(destination: LanguageHubView(languageId: language.id, languageName: language.name, languageCode: language.code)) {
                                    LanguageCard(language: language)
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Ngôn Ngữ")
            .navigationBarTitleDisplayMode(.large)
            .task {
                await loadLanguages()
            }
        }
    }

    private func loadLanguages() async {
        do {
            languages = try await APIService.shared.fetchLanguages()
            isLoading = false
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }
}

struct LanguageCard: View {
    let language: Language

    var body: some View {
        GlassCard {
            VStack(alignment: .center, spacing: 12) {
                // Modern icon instead of emoji flag
                ZStack {
                    Circle()
                        .fill(languageGradient)
                        .frame(width: 56, height: 56)
                    
                    Image(systemName: languageIcon)
                        .font(.system(size: 24, weight: .semibold))
                        .foregroundStyle(.white)
                }
                
                VStack(spacing: 4) {
                    Text(language.name)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.primary)
                        .multilineTextAlignment(.center)
                    
                    if let lessons = language.totalLessons {
                        Text("\(lessons) bài học")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .frame(maxWidth: .infinity)
        }
    }
    
    private var languageIcon: String {
        // Map language to appropriate SF Symbol
        switch language.code.lowercased() {
        case "en", "en-us": return "textformat.abc"
        case "vi", "vi-vn": return "character.textbox"
        case "de", "de-de": return "textformat"
        case "ja", "ja-jp": return "character.ja"
        case "zh", "zh-cn": return "character.zh"
        case "ko", "ko-kr": return "character.ko"
        case "es", "es-es": return "textformat.abc.dottedunderline"
        case "fr", "fr-fr": return "textformat.alt"
        default: return "globe"
        }
    }
    
    private var languageGradient: LinearGradient {
        // Assign different gradients based on language
        let hash = abs(language.name.hashValue)
        let gradients: [LinearGradient] = [
            .accentGradient,
            .tealGradient,
            .goldGradient,
            .pinkGradient
        ]
        return gradients[hash % gradients.count]
    }
}

#Preview {
    LanguagesView()
}
