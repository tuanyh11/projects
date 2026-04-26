import SwiftUI
import Speech
import AVFoundation

struct LanguageHubView: View {
    let languageId: Int
    let languageName: String
    let languageCode: String

    @State private var showingComingSoon = false

    var body: some View {
        ZStack {
            Color.appBg.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 20) {
                    // Features
                    VStack(spacing: 12) {
                        // Story Feature
                        NavigationLink(
                            destination: StoriesView(
                                languageId: languageId, languageName: languageName,
                                languageCode: languageCode)
                        ) {
                            FeatureRow(
                                icon: "book",
                                title: "Luyện Đọc & Gõ",
                                description: "Đọc hiểu và luyện gõ qua các mẩu truyện ngắn."
                            )
                        }
                        .buttonStyle(.plain)

                        // Vocabulary Feature
                        NavigationLink(
                            destination: VocabLessonsView(
                                languageId: languageId, languageCode: languageCode)
                        ) {
                            FeatureRow(
                                icon: "character.book.closed",
                                title: "Từ Vựng & Ngữ Pháp",
                                description: "Học từ vựng qua thẻ ghi nhớ và ôn tập ngữ pháp.",
                                isLocked: false
                            )
                        }
                        .buttonStyle(.plain)

                        // Reading Comprehension Feature
                        NavigationLink(
                            destination: ReadingPassagesView(
                                languageId: languageId, languageCode: languageCode)
                        ) {
                            FeatureRow(
                                icon: "doc.text.magnifyingglass",
                                title: "Đọc Hiểu & Trắc Nghiệm",
                                description:
                                    "Luyện đọc văn bản và làm bài trắc nghiệm theo trình độ.",
                                isLocked: false
                            )
                        }
                        .buttonStyle(.plain)
                        // Speaking Feature (Coming Soon)
                        Button(action: { showingComingSoon = true }) {
                            FeatureRow(
                                icon: "mic.bubble",
                                title: "Luyện Phát Âm",
                                description: "Chấm điểm giọng đọc cùng AI (Đang phát triển)",
                                isLocked: true
                            )
                        }
                    }
                    .padding(.horizontal)
                    .padding(.top, 8)
                }
            }
        }
        .navigationTitle(languageName)
        .navigationBarTitleDisplayMode(.large)
        .alert("Sắp ra mắt", isPresented: $showingComingSoon) {
            Button("Đóng", role: .cancel) {}
        } message: {
            Text("Tính năng này đang được phát triển.")
        }
    }
}

struct FeatureRow: View {
    let icon: String
    let title: String
    let description: String
    var isLocked: Bool = false

    var body: some View {
        GlassCard {
            HStack(spacing: 14) {
                // Icon with gradient background
                ZStack {
                    if isLocked {
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .fill(Color.appSurface2)
                            .frame(width: 48, height: 48)
                    } else {
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .fill(featureGradient)
                            .frame(width: 48, height: 48)
                    }
                    Image(systemName: isLocked ? "\(icon).slash" : "\(icon).fill")
                        .font(.title3)
                        .foregroundStyle(isLocked ? Color.secondary : Color.white)
                }

                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Text(title)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(isLocked ? .secondary : .primary)
                        if isLocked {
                            HStack(spacing: 3) {
                                Image(systemName: "lock.fill")
                                    .font(.system(size: 8))
                                Text("SẮP RA MẮT")
                                    .font(.system(size: 9, weight: .bold))
                                    .tracking(0.5)
                            }
                            .foregroundStyle(.secondary)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 3)
                            .background(Color.appSurface2, in: Capsule())
                        }
                    }
                    Text(description)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
                Spacer(minLength: 0)

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.quaternary)
            }
        }
    }

    private var featureGradient: LinearGradient {
        // Different gradient for each feature
        switch icon {
        case "book": return .tealGradient
        case "character.book.closed": return .goldGradient
        case "doc.text.magnifyingglass": return .accentGradient
        default: return .accentGradient
        }
    }
}

// Custom View extension for letter spacing
extension View {
    func letterSpacing(_ tracking: CGFloat) -> some View {
        if #available(iOS 16.0, *) {
            return self.tracking(tracking)
        } else {
            return self
        }
    }
}

#Preview {
    NavigationStack {
        LanguageHubView(languageId: 1, languageName: "English", languageCode: "en")
    }
}
