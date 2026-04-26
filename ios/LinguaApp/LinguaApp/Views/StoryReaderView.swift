import SwiftUI

struct StoryReaderView: View {
    let story: Story
    let languageCode: String
    
    @State private var storyLines: [StoryLine] = []
    @State private var isLoading = true
    @State private var errorMessage: String?
    
    var body: some View {
        ZStack {
            Color.appBg.ignoresSafeArea()
            
            if isLoading {
                ProgressView("Đang tải truyện...")
                    .tint(.appAccent)
                    .foregroundStyle(Color.appTextMuted)
            } else if let error = errorMessage {
                EmptyStateView(
                    icon: "exclamationmark.triangle",
                    title: "Lỗi Tải Truyện",
                    subtitle: error
                )
            } else if storyLines.isEmpty {
                EmptyStateView(
                    icon: "text.book.closed",
                    title: "Truyện Trống",
                    subtitle: "Truyện này chưa có nội dung."
                )
            } else {
                ScrollView {
                    LazyVStack(spacing: 24) {
                        // Header
                        VStack(spacing: 8) {
                            Text(story.title)
                                .font(.title3.weight(.semibold))
                                .foregroundStyle(.primary)
                                .multilineTextAlignment(.center)
                            
                            if let titleVi = story.titleVi {
                                Text(titleVi)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                                    .multilineTextAlignment(.center)
                            }
                        }
                        .padding(.vertical, 16)
                        
                        // Story Lines
                        ForEach(Array(storyLines.enumerated()), id: \.element.id) { index, line in
                            NavigationLink(destination: StoryTypingView(story: story, storyLines: storyLines, initialLineIndex: index, languageCode: languageCode)) {
                                StoryLineView(line: line, languageCode: languageCode)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding()
                }
            }
        }
        .navigationTitle("Đọc Truyện")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadStoryLines()
        }
    }
    
    private func loadStoryLines() async {
        do {
            storyLines = try await APIService.shared.fetchStoryLines(storyId: story.id)
            isLoading = false
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }
}

struct StoryLineView: View {
    let line: StoryLine
    let languageCode: String

    @State private var tappedWord: WordPair? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Word-by-word tappable row (dùng wordsJson nếu có, fallback sang text)
            if let words = line.wordsJson, !words.isEmpty {
                WordFlowView(words: words, languageCode: languageCode, tappedWord: $tappedWord)
            } else if let textEn = line.textEn {
                Text(textEn)
                    .font(.body)
                    .foregroundStyle(.primary)
                    .lineSpacing(4)
            }

            // Tooltip khi bấm vào từ
            if let word = tappedWord {
                HStack(spacing: 8) {
                    Image(systemName: "speaker.wave.2.fill")
                        .font(.caption)
                        .foregroundStyle(Color.appAccent)
                    Text("\(word.en)  →  \(word.vi)")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(.primary)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.appAccent.opacity(0.1), in: RoundedRectangle(cornerRadius: 8))
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.appAccent.opacity(0.3), lineWidth: 1))
                .transition(.scale(scale: 0.9).combined(with: .opacity))
            }

            // Vietnamese Translation (mờ bên dưới)
            if let textVi = line.textVi {
                Text(textVi)
                    .font(.caption)
                    .foregroundStyle(Color.appTextMuted)
                    .padding(.top, 2)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(Color.appSurface, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
        .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 2)
        .animation(.spring(response: 0.3), value: tappedWord?.en)
    }
}

// MARK: - Flow Layout cho các từ
struct WordFlowView: View {
    let words: [WordPair]
    let languageCode: String
    @Binding var tappedWord: WordPair?

    // Nút phát toàn câu
    private var fullSentence: String {
        words.map { $0.en }.joined(separator: " ")
    }

    var body: some View {
        HStack(alignment: .top) {
            // Các từ wrapping
            FlowLayout(spacing: 6) {
                ForEach(words, id: \.en) { word in
                    WordChip(
                        word: word,
                        isSelected: tappedWord?.en == word.en,
                        onTap: {
                            withAnimation {
                                if tappedWord?.en == word.en {
                                    tappedWord = nil
                                } else {
                                    tappedWord = word
                                    AudioService.shared.speak(word.en, language: languageCode)
                                }
                            }
                        }
                    )
                }
            }

            Spacer(minLength: 8)

            // Nút phát toàn câu
            Button(action: {
                tappedWord = nil
                AudioService.shared.speak(fullSentence, language: languageCode)
            }) {
                Image(systemName: "speaker.wave.2")
                    .foregroundStyle(Color.appAccent)
                    .padding(8)
                    .background(Color.appSurface2, in: Circle())
            }
        }
    }
}

// MARK: - Chip từng từ
struct WordChip: View {
    let word: WordPair
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            Text(word.en)
                .font(.body.weight(isSelected ? .medium : .regular))
                .foregroundStyle(.primary)
                .padding(.horizontal, 6)
                .padding(.vertical, 3)
                .background(
                    RoundedRectangle(cornerRadius: 6, style: .continuous)
                        .fill(isSelected ? Color.appSurface2 : Color.clear)
                )
        }
        .buttonStyle(.plain)
        .animation(.easeInOut(duration: 0.15), value: isSelected)
    }
}

// MARK: - Custom Flow Layout (word wrap)
struct FlowLayout: Layout {
    var spacing: CGFloat = 4

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let rows = computeRows(proposal: proposal, subviews: subviews)
        let height = rows.map { $0.map { $0.size.height }.max() ?? 0 }.reduce(0) { $0 + $1 + spacing } - spacing
        return CGSize(width: proposal.width ?? 0, height: max(height, 0))
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let rows = computeRows(proposal: proposal, subviews: subviews)
        var y = bounds.minY
        for row in rows {
            var x = bounds.minX
            let rowHeight = row.map { $0.size.height }.max() ?? 0
            for item in row {
                item.view.place(at: CGPoint(x: x, y: y), proposal: .unspecified)
                x += item.size.width + spacing
            }
            y += rowHeight + spacing
        }
    }

    private struct RowItem {
        let view: LayoutSubview
        let size: CGSize
    }

    private func computeRows(proposal: ProposedViewSize, subviews: Subviews) -> [[RowItem]] {
        let maxWidth = proposal.width ?? .infinity
        var rows: [[RowItem]] = [[]]
        var currentRowWidth: CGFloat = 0

        for view in subviews {
            let size = view.sizeThatFits(.unspecified)
            if currentRowWidth + size.width > maxWidth && !rows[rows.count - 1].isEmpty {
                rows.append([])
                currentRowWidth = 0
            }
            rows[rows.count - 1].append(RowItem(view: view, size: size))
            currentRowWidth += size.width + spacing
        }
        return rows
    }
}

// FlowLayout is unique to this file for now
