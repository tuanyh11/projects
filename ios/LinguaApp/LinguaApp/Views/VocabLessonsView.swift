import SwiftUI

struct VocabLessonsView: View {
    let languageId: Int
    let languageCode: String
    
    @State private var lessons: [Lesson] = []
    @State private var isLoading = true
    @State private var errorMessage: String?
    
    @State private var searchText = ""
    @State private var selectedCategory: String? = nil
    
    var categories: [String] {
        let allCategories = lessons.compactMap { $0.category }
        return Array(Set(allCategories)).sorted()
    }
    
    var filteredLessons: [Lesson] {
        lessons.filter { lesson in
            let matchesSearch = searchText.isEmpty || 
                               lesson.title.lowercased().contains(searchText.lowercased()) ||
                               (lesson.content?.lowercased().contains(searchText.lowercased()) ?? false)
            let matchesCategory = selectedCategory == nil || lesson.category == selectedCategory
            return matchesSearch && matchesCategory
        }
    }

    var body: some View {
        ZStack {
            Color.appBg.ignoresSafeArea()

            VStack(spacing: 0) {
                // Search Bar
                HStack {
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundStyle(.secondary)
                        TextField("Tìm hành trang...", text: $searchText)
                            .font(.subheadline)
                    }
                    .padding(10)
                    .background(Color.appSurface, in: RoundedRectangle(cornerRadius: 12))
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.appBorder, lineWidth: 1))
                }
                .padding(.horizontal)
                .padding(.top, 10)
                
                // Topic Filter
                if !categories.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            CategoryChip(title: "Tất cả", isSelected: selectedCategory == nil) {
                                selectedCategory = nil
                            }
                            
                            ForEach(categories, id: \.self) { category in
                                CategoryChip(title: category, isSelected: selectedCategory == category) {
                                    selectedCategory = category
                                }
                            }
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 12)
                    }
                }

                if isLoading {
                    ScrollView {
                        VStack(spacing: 12) {
                            ForEach(0..<5, id: \.self) { _ in
                                ShimmerView()
                                    .frame(height: 100)
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
                } else if filteredLessons.isEmpty {
                    EmptyStateView(
                        icon: "briefcase",
                        title: "Không tìm thấy",
                        subtitle: "Không có bài từ vựng nào phù hợp với tìm kiếm."
                    )
                } else {
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(filteredLessons) { lesson in
                                NavigationLink(destination: VocabTypingView(lesson: lesson, languageCode: languageCode)) {
                                    LessonCard(lesson: lesson)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding()
                    }
                }
            }
        }
        .navigationTitle("Hành Trang Từ Vựng")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadLessons()
        }
    }

    private func loadLessons() async {
        do {
            lessons = try await APIService.shared.fetchLessons(languageId: languageId)
            isLoading = false
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }
}

struct LessonCard: View {
    let lesson: Lesson

    var body: some View {
        GlassCard {
            HStack(spacing: 14) {
                // Playful travel icon for vocab
                ZStack {
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .fill(LinearGradient.oceanGradient)
                        .frame(width: 56, height: 56)
                    Image(systemName: "briefcase.fill")
                        .font(.title3)
                        .foregroundStyle(.white)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(lesson.title)
                            .font(.system(.subheadline, design: .rounded).weight(.bold))
                            .foregroundStyle(.primary)
                            .lineLimit(1)
                        
                        Spacer()
                        
                        if let cat = lesson.category {
                            Text(cat)
                                .font(.system(size: 10, weight: .black))
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.appSurface2)
                                .foregroundStyle(Color.appBlue)
                                .clipShape(RoundedRectangle(cornerRadius: 4))
                        }
                    }
                    
                    if let content = lesson.content {
                        Text(content)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(2)
                    }
                    
                    HStack(spacing: 8) {
                        DifficultyBadge(difficulty: lesson.level ?? "Beginner")
                        
                        HStack(spacing: 3) {
                            Image(systemName: "character.book.closed")
                                .font(.system(size: 8))
                            Text("Bản tin từ vựng")
                        }
                        .font(.system(size: 10, weight: .medium))
                        .foregroundStyle(.tertiary)
                    }
                    .padding(.top, 4)
                }
            }
        }
    }
}
