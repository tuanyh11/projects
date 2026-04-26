import SwiftUI

struct ReadingPassagesView: View {
    let languageId: Int
    let languageCode: String
    
    @State private var passages: [ReadingPassage] = []
    @State private var isLoading = true
    @State private var errorMessage: String?
    @State private var selectedLevel: String = "All"
    
    let levels = ["All", "Beginner", "Intermediate", "Advanced"]
    
    var filteredPassages: [ReadingPassage] {
        if selectedLevel == "All" {
            return passages
        }
        return passages.filter { $0.difficulty == selectedLevel }
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Level Filter
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(levels, id: \.self) { level in
                        Button(action: { selectedLevel = level }) {
                            Text(level)
                                .font(.subheadline.weight(.medium))
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(selectedLevel == level ? Color.appAccent : Color.appSurface2)
                                .foregroundStyle(selectedLevel == level ? .white : .primary)
                                .clipShape(Capsule())
                        }
                    }
                }
                .padding()
            }
            
            if isLoading {
                Spacer()
                ProgressView()
                Spacer()
            } else if let error = errorMessage {
                EmptyStateView(icon: "exclamationmark.triangle", title: "Lỗi", subtitle: error)
            } else if filteredPassages.isEmpty {
                EmptyStateView(icon: "book.closed", title: "Trống", subtitle: "Chưa có bài đọc nào cho cấp độ này.")
            } else {
                ScrollView {
                    LazyVStack(spacing: 16) {
                        ForEach(filteredPassages) { passage in
                            NavigationLink(destination: ReadingQuizView(passage: passage, languageCode: languageCode)) {
                                PassageCard(passage: passage)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding()
                }
            }
        }
        .navigationTitle("Đọc Hiểu")
        .background(Color.appBg)
        .task {
            await loadPassages()
        }
        .refreshable {
            await loadPassages()
        }
    }
    
    private func loadPassages() async {
        do {
            passages = try await APIService.shared.fetchReadingPassages(languageId: languageId)
            isLoading = false
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }
}

struct PassageCard: View {
    let passage: ReadingPassage
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                DifficultyBadge(difficulty: passage.difficulty ?? "Beginner")
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.tertiary)
            }
            
            Text(passage.title)
                .font(.headline)
                .foregroundStyle(.primary)
            
            Text(passage.content)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineLimit(2)
        }
        .padding(20)
        .background(Color.appSurface)
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .shadow(color: Color.black.opacity(0.04), radius: 10, x: 0, y: 4)
    }
}
