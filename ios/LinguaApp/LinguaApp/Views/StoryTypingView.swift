import SwiftUI

struct StoryTypingView: View {
    @Environment(\.dismiss) var dismiss
    let story: Story
    let storyLines: [StoryLine]
    let initialLineIndex: Int
    let languageCode: String

    @State private var currentIndex: Int
    @State private var typedText = ""
    @State private var isFinished = false

    init(
        story: Story, storyLines: [StoryLine], initialLineIndex: Int = 0,
        languageCode: String = "en"
    ) {
        self.story = story
        self.storyLines = storyLines
        self.initialLineIndex = initialLineIndex
        self.languageCode = languageCode
        self._currentIndex = State(initialValue: initialLineIndex)
    }

    @State private var startTime: Date?
    @State private var totalCharactersTyped = 0
    @State private var totalErrors = 0

    @FocusState private var isFocused: Bool
    @State private var tappedWord: WordPair? = nil

    var currentLine: StoryLine? {
        guard currentIndex < storyLines.count else { return nil }
        return storyLines[currentIndex]
    }

    var targetText: String {
        currentLine?.textEn?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    }

    var wpm: Int {
        guard let start = startTime, totalCharactersTyped > 0 else { return 0 }
        let elapsedMinutes = Date().timeIntervalSince(start) / 60.0
        guard elapsedMinutes > 0 else { return 0 }
        let words = Double(totalCharactersTyped) / 5.0
        return Int(words / elapsedMinutes)
    }

    var accuracy: Int {
        let totalAttempts = totalCharactersTyped + totalErrors
        guard totalAttempts > 0 else { return 100 }
        return Int((Double(totalCharactersTyped) / Double(totalAttempts)) * 100)
    }

    var body: some View {
        ZStack {
            Color.appBg.ignoresSafeArea()

            if isFinished {
                finishView
            } else if let line = currentLine {
                typingInterface(line: line)
            }
        }
        .navigationTitle("\(story.title)")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            isFocused = true
        }
    }

    private func typingInterface(line: StoryLine) -> some View {
        VStack(spacing: 0) {
            // Stats Header
            HStack {
                StatView(title: "WPM", value: "\(wpm)", color: .primary)
                Spacer()
                StatView(title: "Accuracy", value: "\(accuracy)%", color: .primary)
                Spacer()
                StatView(
                    title: "Progress", value: "\(currentIndex + 1)/\(storyLines.count)",
                    color: .primary)
            }
            .padding(.horizontal)
            .padding(.top, 20)

            Spacer()

            // Tooltip khi bấm từ
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
                .overlay(
                    RoundedRectangle(cornerRadius: 8).stroke(
                        Color.appAccent.opacity(0.3), lineWidth: 1)
                )
                .transition(.scale(scale: 0.9).combined(with: .opacity))
                .padding(.bottom, 30)
            }

            // Typing Area
            ZStack(alignment: .topLeading) {
                // Invisible TextField
                TextField("", text: $typedText, axis: .vertical)
                    .focused($isFocused)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.never)
                    .multilineTextAlignment(.center)
                    .opacity(0)
                    .frame(height: 1)

                // Interactive ghost text
                InteractiveGhostTextView(
                    line: line,
                    typedText: typedText,
                    selectedWord: tappedWord,
                    languageCode: languageCode,
                    onTapWord: { word in
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
                .onTapGesture {
                    isFocused = true
                }
            }
            .padding(.horizontal, 24)

            Spacer()

            // Nút phát toàn câu
            Button(action: {
                tappedWord = nil
                if let en = line.textEn {
                    AudioService.shared.speak(en, language: languageCode)
                }
            }) {
                HStack(spacing: 6) {
                    Image(systemName: "speaker.wave.2.fill")
                    Text("Phát toàn câu")
                        .font(.caption.weight(.medium))
                }
                .foregroundStyle(.primary)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(Color.appSurface2, in: Capsule())
            }
            .padding(.bottom, 40)
        }
        .onChange(of: typedText) { oldValue, newValue in
            handleInput(oldValue: oldValue, newValue: newValue)
        }
        .onChange(of: currentIndex) { _, _ in
            tappedWord = nil
            speakCurrentLine()
        }
        .onAppear {
            speakCurrentLine()
        }
        .onDisappear {
            AudioService.shared.stop()
        }
        .animation(.spring(response: 0.3), value: tappedWord?.en)
    }

    private func speakCurrentLine() {
        if !isFinished, let en = currentLine?.textEn {
            AudioService.shared.speak(en, language: languageCode)
        }
    }

    private var finishView: some View {
        VStack(spacing: 20) {
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 72, weight: .light))
                .foregroundStyle(LinearGradient.accentGradient)
                .shadow(color: Color.appAccent.opacity(0.3), radius: 10, x: 0, y: 5)

            Text("Hoàn thành!")
                .font(.title.weight(.semibold))

            Text("Bạn đã gõ xong câu chuyện này.")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            HStack(spacing: 16) {
                StatBox(value: "\(wpm)", label: "WPM", color: .appAccent)
                StatBox(value: "\(accuracy)%", label: "Accuracy", color: .appAccent)
            }
            .padding(.horizontal, 40)
            .padding(.top, 12)

            Spacer()
            
            Button(action: {
                dismiss()
            }) {
                Text("Tiếp tục hành trình")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.appAccent)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 40)
        }
        .padding(.top, 60)
    }

    private func handleInput(oldValue: String, newValue: String) {
        if startTime == nil {
            startTime = Date()
        }

        let target = targetText

        // Lenient comparison: ignore trailing spaces/punctuation if the user missed them
        if !target.hasPrefix(newValue) {
            // Check if user just typed an extra space or something that's not actually an error but a mismatch with target
            // But for a typing app, precision is usually key.
            // The real issue is if the ghost text is MISSING characters from target.
            if newValue.count > oldValue.count {
                totalErrors += 1
                let generator = UINotificationFeedbackGenerator()
                generator.notificationOccurred(.error)
            }
            typedText = oldValue
            return
        }

        if newValue.count > oldValue.count {
            totalCharactersTyped += 1
        }

        if newValue == target {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                if currentIndex + 1 < storyLines.count {
                    currentIndex += 1
                    typedText = ""
                } else {
                    saveFinalProgress()
                    isFinished = true
                    isFocused = false
                }
            }
        }
    }
    
    private func saveFinalProgress() {
        guard let userId = AuthService.shared.currentUser?.id else { return }
        
        Task {
            do {
                try await APIService.shared.saveProgress(
                    userId: userId,
                    storyId: story.id,
                    lessonId: nil,
                    wpm: wpm,
                    accuracy: accuracy
                )
                print("✅ Story progress saved!")
            } catch {
                print("❌ Failed to save story progress: \(error)")
            }
        }
    }
}

// MARK: - Ghost Text Components
struct GhostItem: Identifiable {
    let id: Int
    let text: String
    let range: (Int, Int)
    let wordPair: WordPair?  // If null, it's just punctuation/spaces
}

struct InteractiveGhostTextView: View {
    let line: StoryLine
    let typedText: String
    let selectedWord: WordPair?
    let languageCode: String
    let onTapWord: (WordPair) -> Void

    var body: some View {
        let fullTarget = (line.textEn ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let words = line.wordsJson ?? []
        let items = prepareItems(fullTarget: fullTarget, words: words)
        let typedCount = typedText.count

        TypingFlowLayout(spacing: 0) {  // Spacing 0 vì mình đã có space trong items
            ForEach(items) { item in
                let result = calculateItemState(item: item, typedCount: typedCount)

                if let word = item.wordPair {
                    Button(action: { onTapWord(word) }) {
                        InteractiveWordView(
                            text: item.text,
                            typedPart: result.typedPart,
                            isNext: result.isNext,
                            isTapped: selectedWord?.en == word.en
                        )
                    }
                    .buttonStyle(.plain)
                } else {
                    // Punctuation or space
                    InteractiveWordView(
                        text: item.text,
                        typedPart: result.typedPart,
                        isNext: result.isNext,
                        isTapped: false
                    )
                }
            }
        }
    }

    private struct ItemState {
        let typedPart: String
        let isNext: Bool
    }

    private func calculateItemState(item: GhostItem, typedCount: Int) -> ItemState {
        let start = item.range.0
        let end = item.range.1

        if typedCount <= start {
            return ItemState(typedPart: "", isNext: (typedCount == start))
        } else if typedCount >= end {
            return ItemState(typedPart: item.text, isNext: false)
        } else {
            let lengthInItem = typedCount - start
            return ItemState(typedPart: String(item.text.prefix(lengthInItem)), isNext: true)
        }
    }

    private func prepareItems(fullTarget: String, words: [WordPair]) -> [GhostItem] {
        var items: [GhostItem] = []
        var currentPos = 0
        var idCounter = 0

        // Sắp xếp words theo vị trí xuất hiện trong fullTarget để tránh lỗi range
        var sortedWords: [(word: WordPair, range: Range<String.Index>)] = []
        var searchPos = fullTarget.startIndex
        for w in words {
            if let range = fullTarget.range(of: w.en, range: searchPos..<fullTarget.endIndex) {
                sortedWords.append((w, range))
                searchPos = range.upperBound
            }
        }

        var lastEnd = fullTarget.startIndex
        for (word, range) in sortedWords {
            // Phần đệm trước từ (khoảng trắng, dấu câu)
            if range.lowerBound > lastEnd {
                let filler = String(fullTarget[lastEnd..<range.lowerBound])
                let start = fullTarget.distance(from: fullTarget.startIndex, to: lastEnd)
                let end = fullTarget.distance(from: fullTarget.startIndex, to: range.lowerBound)
                items.append(
                    GhostItem(id: idCounter, text: filler, range: (start, end), wordPair: nil))
                idCounter += 1
            }

            // Chính từ đó
            let start = fullTarget.distance(from: fullTarget.startIndex, to: range.lowerBound)
            let end = fullTarget.distance(from: fullTarget.startIndex, to: range.upperBound)
            items.append(
                GhostItem(id: idCounter, text: word.en, range: (start, end), wordPair: word))
            idCounter += 1
            lastEnd = range.upperBound
        }

        // Phần còn lại sau từ cuối
        if lastEnd < fullTarget.endIndex {
            let remaining = String(fullTarget[lastEnd..<fullTarget.endIndex])
            let start = fullTarget.distance(from: fullTarget.startIndex, to: lastEnd)
            let end = fullTarget.distance(from: fullTarget.startIndex, to: fullTarget.endIndex)
            items.append(
                GhostItem(id: idCounter, text: remaining, range: (start, end), wordPair: nil))
        }

        return items
    }
}

struct InteractiveWordView: View {
    let text: String
    let typedPart: String
    let isNext: Bool
    let isTapped: Bool

    var body: some View {
        var richText = Text("")
        let targetChars = Array(text)
        let typedChars = Array(typedPart)

        for (i, char) in targetChars.enumerated() {
            if i < typedChars.count {
                richText =
                    richText
                    + Text(String(char))
                    .font(.system(size: 28, weight: .bold, design: .monospaced))
                    .foregroundStyle(.primary)
            } else if i == typedChars.count && isNext {
                richText =
                    richText
                    + Text(String(char))
                    .font(.system(size: 28, weight: .regular, design: .monospaced))
                    .foregroundColor(Color.appAccent)
                    .underline()
            } else {
                richText =
                    richText
                    + Text(String(char))
                    .font(.system(size: 28, weight: .regular, design: .monospaced))
                    .foregroundColor(Color.appTextMuted.opacity(0.3))
            }
        }

        return
            richText
            .background(isTapped ? Color.appAccent.opacity(0.1) : Color.clear)
            .cornerRadius(4)
    }
}

// MARK: - Custom Flow Layout (word wrap)
struct TypingFlowLayout: Layout {
    var spacing: CGFloat = 0

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let rows = computeRows(proposal: proposal, subviews: subviews)
        let height =
            rows.map { $0.map { $0.size.height }.max() ?? 0 }.reduce(0) { $0 + $1 + spacing }
            - spacing
        return CGSize(width: proposal.width ?? 0, height: max(height, 0))
    }

    func placeSubviews(
        in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()
    ) {
        let rows = computeRows(proposal: proposal, subviews: subviews)
        let maxWidth = bounds.width
        var y = bounds.minY

        for row in rows {
            // Tính tổng độ rộng của hàng để căn giữa
            let rowWidth = row.reduce(0) { $0 + $1.size.width + spacing } - spacing
            let offset = (maxWidth - rowWidth) / 2

            var x = bounds.minX + offset
            let rowHeight = row.map { $0.size.height }.max() ?? 0
            for item in row {
                item.view.place(at: CGPoint(x: x, y: y), proposal: .unspecified)
                x += item.size.width + spacing
            }
            y += rowHeight + spacing
        }
    }

    @available(macOS 13.0, *)
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
