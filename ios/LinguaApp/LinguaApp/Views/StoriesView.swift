import SwiftUI

struct StoriesView: View {
    let languageId: Int
    let languageName: String
    let languageCode: String

    @State private var stories: [Story] = []
    @State private var isLoading = true
    @State private var errorMessage: String?

    @State private var searchText = ""
    @State private var selectedCategory: String? = nil

    var categories: [String] {
        let allCategories = stories.compactMap { $0.category }
        return Array(Set(allCategories)).sorted()
    }

    var filteredStories: [Story] {
        stories.filter { story in
            let matchesSearch =
                searchText.isEmpty || story.title.lowercased().contains(searchText.lowercased())
                || (story.titleVi?.lowercased().contains(searchText.lowercased()) ?? false)
            let matchesCategory = selectedCategory == nil || story.category == selectedCategory
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
                        TextField("Tìm kiếm ký sự...", text: $searchText)
                            .font(.subheadline)
                    }
                    .padding(10)
                    .background(Color.appSurface, in: RoundedRectangle(cornerRadius: 12))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12).stroke(Color.appBorder, lineWidth: 1))
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
                                CategoryChip(
                                    title: category, isSelected: selectedCategory == category
                                ) {
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
                } else if filteredStories.isEmpty {
                    EmptyStateView(
                        icon: "map",
                        title: "Không tìm thấy",
                        subtitle: "Không có câu chuyện nào phù hợp với tìm kiếm."
                    )
                } else {
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(filteredStories) { story in
                                NavigationLink(
                                    destination: StoryReaderView(
                                        story: story, languageCode: languageCode)
                                ) {
                                    StoryCard(story: story)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding()
                    }
                }
            }
        }
        .navigationTitle("Ký Sự Hành Trình")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadStories()
        }
    }

    private func loadStories() async {
        do {
            stories = try await APIService.shared.fetchStories(languageId: languageId)
            isLoading = false
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }
}

struct CategoryChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 13, weight: .bold))
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? Color.appAccent : Color.appSurface)
                .foregroundStyle(isSelected ? .white : .secondary)
                .clipShape(Capsule())
                .overlay(
                    Capsule().stroke(isSelected ? Color.clear : Color.appBorder, lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
    }
}

struct StoryCard: View {
    let story: Story

    var body: some View {
        GlassCard {
            HStack(spacing: 14) {
                // Playful travel icon based on category
                ZStack {
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .fill(storyGradient)
                        .frame(width: 56, height: 56)
                    Image(systemName: categoryIcon)
                        .font(.title3)
                        .foregroundStyle(.white)
                }

                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(story.title)
                            .font(.system(.subheadline, design: .rounded).weight(.bold))
                            .foregroundStyle(.primary)
                            .lineLimit(1)

                        Spacer()

                        if let cat = story.category {
                            Text(cat)
                                .font(.system(size: 10, weight: .black))
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.appSurface2)
                                .foregroundStyle(Color.appAccent)
                                .clipShape(RoundedRectangle(cornerRadius: 4))
                        }
                    }

                    if let titleVi = story.titleVi {
                        Text(titleVi)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }

                    HStack(spacing: 8) {
                        DifficultyBadge(difficulty: story.difficulty ?? "Beginner")

                        if let lines = story.totalLines {
                            HStack(spacing: 3) {
                                Image(systemName: "text.justify.left")
                                    .font(.system(size: 8))
                                Text("\(lines) trạm dừng")
                            }
                            .font(.system(size: 10, weight: .medium))
                            .foregroundStyle(.tertiary)
                        }
                    }
                    .padding(.top, 4)
                }
            }
        }
    }

    private var categoryIcon: String {
        switch story.category?.lowercased() {
        case "travel", "du lịch": return "airplane"
        case "food", "ẩm thực": return "fork.knife"
        case "culture", "văn hóa": return "building.columns.fill"
        case "nature", "thiên nhiên": return "leaf.fill"
        default: return "map.fill"
        }
    }

    private var storyGradient: LinearGradient {
        switch story.difficulty?.lowercased() {
        case "beginner": return .tealGradient
        case "intermediate": return .sunsetGradient
        case "advanced": return .pinkGradient
        default: return .sunsetGradient
        }
    }
}
