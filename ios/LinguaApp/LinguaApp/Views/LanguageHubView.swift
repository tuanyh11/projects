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
                                .background(
                                    selectedLevel == level ? Color.appAccent : Color.appSurface2
                                )
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
                Spacer()
                EmptyStateView(icon: "exclamationmark.triangle", title: "Lỗi", subtitle: error)
                Spacer()
            } else if filteredPassages.isEmpty {
                Spacer()
                EmptyStateView(
                    icon: "book.closed", title: "Trống",
                    subtitle: "Chưa có bài đọc nào cho cấp độ này.")
                Spacer()
            } else {
                ScrollView {
                    LazyVStack(spacing: 16) {
                        ForEach(filteredPassages) { passage in
                            NavigationLink(
                                destination: ReadingQuizView(
                                    passage: passage, languageCode: languageCode)
                            ) {
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
        .onDisappear {
            AudioService.shared.stop()
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

struct ReadingQuizView: View {
    let passage: ReadingPassage
    let languageCode: String

    @Environment(\.dismiss) var dismiss
    @State private var questions: [ReadingQuestion] = []
    @State private var currentQuestionIndex = 0
    @State private var selectedOptionIndex: Int?
    @State private var score = 0
    @State private var isFinished = false
    @State private var isLoading = true
    @State private var showTranslation = false
    @State private var feedbackType: FeedbackType?
    
    // Global Translation State for this view
    @State private var activeTranslation: String?
    @State private var activePronunciation: String?
    @State private var activeWord: String?
    @State private var isGlobalTranslating = false
    @State private var globalSelectionRange: ClosedRange<Int>?
    @State private var globalSelectionId: String? // To identify which text view owns the selection
    
    // Draggable Sheet State
    @State private var sheetOffset: CGFloat = 0
    @State private var lastSheetOffset: CGFloat = 0
    private let collapsedHeight: CGFloat = 120
    private let expandedHeight: CGFloat = UIScreen.main.bounds.height * 0.7
    
    // Speech State
    @StateObject private var speechService = SpeechService.shared
    @State private var showingSpeechResult = false
    @State private var lastScore: Int?
    @State private var spokenText: String = ""

    enum FeedbackType {
        case correct, incorrect
    }

    var body: some View {
        ZStack {
            Color.appBg.ignoresSafeArea()

            if isLoading {
                ProgressView()
                    .padding()
            } else if isFinished {
                finishView
            } else {
                ZStack(alignment: .bottom) {
                    // 1. Full Screen Scrollable Passage
                    ScrollView {
                        VStack(alignment: .leading, spacing: 20) {
                            Text(passage.title)
                                .font(.title.weight(.bold))
                                .padding(.top, 60) // Space for back button

                            if showTranslation {
                                Text(passage.translation ?? "")
                                    .font(.body)
                                    .lineSpacing(8)
                                    .foregroundStyle(.secondary)
                            } else {
                                InteractiveTextView(
                                    id: "passage",
                                    text: passage.content, 
                                    languageCode: languageCode,
                                    activeWord: $activeWord,
                                    activeTranslation: $activeTranslation,
                                    activePronunciation: $activePronunciation,
                                    isTranslating: $isGlobalTranslating,
                                    selectionRange: $globalSelectionRange,
                                    selectionId: $globalSelectionId
                                )
                            }

                            Button(action: { showTranslation.toggle() }) {
                                Label(
                                    showTranslation ? "Hiện nguyên bản" : "Xem bản dịch",
                                    systemImage: "character.book.closed"
                                )
                                .font(.subheadline.weight(.medium))
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(Color.appAccent.opacity(0.1))
                                .foregroundStyle(Color.appAccent)
                                .clipShape(Capsule())
                            }
                            .padding(.top, 10)
                            
                            Spacer(minLength: 250) // More space for bottom sheet
                        }
                        .padding(24)
                    }
                    
                    // 2. Custom Back Button
                    VStack {
                        HStack {
                            Button(action: { dismiss() }) {
                                Image(systemName: "xmark.circle.fill")
                                    .font(.title)
                                    .foregroundStyle(.secondary)
                                    .background(Circle().fill(Color.appSurface))
                            }
                            .padding(.leading, 20)
                            .padding(.top, 10)
                            Spacer()
                        }
                        Spacer()
                    }

                    // 3. Draggable Quiz Sheet
                    GeometryReader { geo in
                        let fullHeight = geo.size.height
                        VStack(spacing: 0) {
                            // Handle bar
                            Capsule()
                                .fill(Color.secondary.opacity(0.3))
                                .frame(width: 40, height: 5)
                                .padding(.top, 12)
                                .padding(.bottom, 8)
                            
                            if let question = currentQuestion() {
                                ScrollView {
                                    VStack(alignment: .leading, spacing: 20) {
                                        // Header
                                        HStack {
                                            Text("CÂU \(currentQuestionIndex + 1)/\(questions.count)")
                                                .font(.caption.weight(.bold))
                                                .foregroundStyle(Color.appAccent)
                                            Spacer()
                                            // Speaking Practice Button removed from Quiz - it is now its own feature
                                            Spacer()
                                            ProgressView(value: Double(currentQuestionIndex + 1), total: Double(questions.count))
                                                .frame(width: 60)
                                        }
                                        
                                        // Question
                                        InteractiveTextView(
                                            id: "question",
                                            text: question.question, 
                                            languageCode: languageCode,
                                            activeWord: $activeWord,
                                            activeTranslation: $activeTranslation,
                                            activePronunciation: $activePronunciation,
                                            isTranslating: $isGlobalTranslating,
                                            selectionRange: $globalSelectionRange,
                                            selectionId: $globalSelectionId
                                        )
                                        .font(.headline)
                                        
                                        // Options
                                        VStack(spacing: 12) {
                                            ForEach(0..<question.options.count, id: \.self) { index in
                                                OptionButton(
                                                    id: "option-\(index)",
                                                    text: question.options[index],
                                                    languageCode: languageCode,
                                                    activeWord: $activeWord,
                                                    activeTranslation: $activeTranslation,
                                                    activePronunciation: $activePronunciation,
                                                    isTranslating: $isGlobalTranslating,
                                                    selectionRange: $globalSelectionRange,
                                                    selectionId: $globalSelectionId,
                                                    isSelected: selectedOptionIndex == index,
                                                    isCorrect: feedbackType == .correct
                                                        && index == question.correctOptionIndex,
                                                    isIncorrect: feedbackType == .incorrect
                                                        && selectedOptionIndex == index,
                                                    action: {
                                                        if selectedOptionIndex == nil {
                                                            handleAnswer(index: index)
                                                        }
                                                    }
                                                )
                                            }
                                        }
                                    }
                                    .padding(.horizontal, 24)
                                    .padding(.bottom, 40)
                                }
                            }
                        }
                        .frame(width: geo.size.width, height: expandedHeight)
                        .background(
                            RoundedRectangle(cornerRadius: 30, style: .continuous)
                                .fill(Color.appSurface)
                                .shadow(color: Color.black.opacity(0.1), radius: 20, x: 0, y: -10)
                        )
                        .offset(y: fullHeight - collapsedHeight + sheetOffset)
                        .gesture(
                            DragGesture()
                                .onChanged { value in
                                    let newOffset = value.translation.height
                                    if newOffset + lastSheetOffset < -(expandedHeight - collapsedHeight) {
                                        sheetOffset = -(expandedHeight - collapsedHeight)
                                    } else {
                                        sheetOffset = newOffset + lastSheetOffset
                                    }
                                }
                                .onEnded { value in
                                    withAnimation(.spring(response: 0.4, dampingFraction: 0.75)) {
                                        if sheetOffset < -(expandedHeight - collapsedHeight) / 2 {
                                            sheetOffset = -(expandedHeight - collapsedHeight)
                                        } else {
                                            sheetOffset = 0
                                        }
                                        lastSheetOffset = sheetOffset
                                    }
                                }
                        )
                        .allowsHitTesting(true)
                        .onTapGesture { } // Stop tap propagation through sheet
                    }
                    .allowsHitTesting(false)
                    .ignoresSafeArea(edges: .bottom)
                }
            }

            // Global Speech Result Overlay
            if showingSpeechResult {
                VStack(spacing: 20) {
                    Text("Kết quả phát âm")
                        .font(.headline)
                    
                    VStack(spacing: 8) {
                        Text("\(lastScore ?? 0)%")
                            .font(.system(size: 48, weight: .black))
                            .foregroundStyle(lastScore ?? 0 > 70 ? .green : .orange)
                        
                        Text(lastScore ?? 0 > 70 ? "Tuyệt vời!" : "Cố gắng lên!")
                            .font(.subheadline.weight(.bold))
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Bạn đã nói:")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Text(spokenText)
                            .font(.body.italic())
                    }
                    .padding()
                    .background(Color.appBg)
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                    Button("Tiếp tục") {
                        showingSpeechResult = false
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color.appAccent)
                }
                .padding(30)
                .background(Color.appSurface)
                .clipShape(RoundedRectangle(cornerRadius: 24))
                .shadow(radius: 20)
                .padding(40)
                .transition(.scale.combined(with: .opacity))
                .zIndex(1000)
            }

            // Global Translation Popup
            if let translation = activeTranslation {
                VStack(spacing: 4) {
                    Text(activeWord ?? "")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(.secondary)
                    
                    if let pron = activePronunciation {
                        Text("/\(pron)/")
                            .font(.system(size: 10, weight: .medium, design: .monospaced))
                            .foregroundStyle(.secondary)
                    }
                    
                    Text(translation)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Color.appAccent)
                        .multilineTextAlignment(.center)
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 12)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.appSurface)
                        .shadow(color: Color.black.opacity(0.2), radius: 20, x: 0, y: 10)
                )
                .transition(.move(edge: .top).combined(with: .opacity))
                .onTapGesture {
                    activeTranslation = nil
                }
                .padding(.top, 100)
                .zIndex(999)
            } else if isGlobalTranslating {
                ProgressView()
                    .padding(12)
                    .background(Circle().fill(Color.appSurface).shadow(radius: 5))
                    .padding(.top, 120)
                    .zIndex(998)
            }
        }
        .toolbar(.hidden, for: .navigationBar)
        .toolbar(.hidden, for: .tabBar)
        .task {
            await loadQuestions()
        }
        .onDisappear {
            AudioService.shared.stop()
        }
    }

    private func currentQuestion() -> ReadingQuestion? {
        guard currentQuestionIndex < questions.count else { return nil }
        return questions[currentQuestionIndex]
    }

    private func loadQuestions() async {
        do {
            questions = try await APIService.shared.fetchReadingQuestions(passageId: passage.id)
            isLoading = false
        } catch {
            isLoading = false
        }
    }

    private func handleAnswer(index: Int) {
        selectedOptionIndex = index
        let correctIndex = questions[currentQuestionIndex].correctOptionIndex

        if index == correctIndex {
            score += 1
            feedbackType = .correct
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        } else {
            feedbackType = .incorrect
            UINotificationFeedbackGenerator().notificationOccurred(.error)
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            if currentQuestionIndex + 1 < questions.count {
                currentQuestionIndex += 1
                selectedOptionIndex = nil
                feedbackType = nil
            } else {
                isFinished = true
            }
        }
    }

    private var finishView: some View {
        VStack(spacing: 30) {
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 80, weight: .light))
                .foregroundStyle(LinearGradient.accentGradient)
                .shadow(color: Color.appAccent.opacity(0.3), radius: 10, x: 0, y: 5)

            VStack(spacing: 8) {
                Text("Chúc mừng!")
                    .font(.title.weight(.bold))
                Text("Bạn đã hoàn thành bài đọc hiểu.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            HStack(spacing: 20) {
                StatBox(value: "\(score)", label: "Số câu đúng", color: .appAccent)
                StatBox(
                    value: "\(Int(Double(score) / Double(max(1, questions.count)) * 100))%",
                    label: "Tỷ lệ", color: .appBlue)
            }
            .padding(.horizontal)

            Spacer()

            Button(action: { dismiss() }) {
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
}

struct OptionButton: View {
    let id: String
    let text: String
    let languageCode: String
    @Binding var activeWord: String?
    @Binding var activeTranslation: String?
    @Binding var activePronunciation: String?
    @Binding var isTranslating: Bool
    @Binding var selectionRange: ClosedRange<Int>?
    @Binding var selectionId: String?
    let isSelected: Bool
    let isCorrect: Bool
    let isIncorrect: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                InteractiveTextView(
                    id: id,
                    text: text, 
                    languageCode: languageCode,
                    activeWord: $activeWord,
                    activeTranslation: $activeTranslation,
                    activePronunciation: $activePronunciation,
                    isTranslating: $isTranslating,
                    selectionRange: $selectionRange,
                    selectionId: $selectionId
                )
                .font(.body.weight(.medium))
                Spacer()
                if isCorrect {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                } else if isIncorrect {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(.red)
                }
            }
            .padding()
            .background(backgroundColor)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(borderColor, lineWidth: 2)
            )
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .foregroundStyle(textColor)
        }
    }

    private var backgroundColor: Color {
        if isCorrect { return Color.green.opacity(0.1) }
        if isIncorrect { return Color.red.opacity(0.1) }
        if isSelected { return Color.appAccent.opacity(0.1) }
        return Color.appSurface
    }

    private var borderColor: Color {
        if isCorrect { return .green }
        if isIncorrect { return .red }
        if isSelected { return .appAccent }
        return Color.appBorder
    }

    private var textColor: Color {
        if isCorrect { return .green }
        if isIncorrect { return .red }
        return .primary
    }
}
struct InteractiveTextView: View {
    let id: String
    let text: String
    let languageCode: String
    
    @Binding var activeWord: String?
    @Binding var activeTranslation: String?
    @Binding var activePronunciation: String?
    @Binding var isTranslating: Bool
    @Binding var selectionRange: ClosedRange<Int>?
    @Binding var selectionId: String?

    @State private var dragStartIdx: Int?
    @State private var wordFrames: [Int: CGRect] = [:]

    var words: [String] {
        if languageCode.hasPrefix("zh") {
            return text.map { String($0) }
        }
        return text.components(separatedBy: .whitespacesAndNewlines).filter { !$0.isEmpty }
    }

    var body: some View {
        FlowLayout(spacing: 6) {
            ForEach(Array(words.enumerated()), id: \.offset) { index, word in
                Text(word)
                    .font(.body)
                    .padding(.horizontal, 4)
                    .padding(.vertical, 2)
                    .background(isWordSelected(index) ? Color.appAccent.opacity(0.2) : Color.clear)
                    .clipShape(RoundedRectangle(cornerRadius: 4))
                    .background(GeometryReader { geo in
                        Color.clear.onAppear {
                            wordFrames[index] = geo.frame(in: .named("textContainer"))
                        }
                        .onChange(of: geo.frame(in: .named("textContainer"))) { newFrame in
                            wordFrames[index] = newFrame
                        }
                    })
                    .onTapGesture {
                        selectionId = id
                        selectionRange = nil
                        handleWordTap(word, index: index)
                    }
            }
        }
        .gesture(
            DragGesture(minimumDistance: 10)
                .onChanged { value in
                    if dragStartIdx == nil {
                        activeTranslation = nil // Also clear old translation
                        selectionId = id
                        selectionRange = nil 
                        if let startIdx = findWordIndex(at: value.startLocation) {
                            dragStartIdx = startIdx
                            UIImpactFeedbackGenerator(style: .light).impactOccurred()
                        }
                    }
                    if let start = dragStartIdx, let end = findWordIndex(at: value.location) {
                        selectionRange = min(start, end)...max(start, end)
                    }
                }
                .onEnded { _ in
                    finalizeSelection()
                }
        )
        .coordinateSpace(name: "textContainer")
        .overlay(alignment: .top) {
            // Overlay removed as it is now global in ReadingQuizView
            EmptyView()
        }
    }

    private func isWordSelected(_ index: Int) -> Bool {
        if selectionId == id, let range = selectionRange {
            return range.contains(index)
        }
        return false
    }

    private func startSelection(at index: Int) {
        selectionRange = index...index
        dragStartIdx = index
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }

    private func findWordIndex(at location: CGPoint) -> Int? {
        for (index, frame) in wordFrames {
            if frame.contains(location) {
                return index
            }
        }
        return nil
    }

    private func finalizeSelection() {
        guard let range = selectionRange else { return }
        if range.count > 1 {
            let selectedText = range.map { words[$0] }.joined(separator: languageCode.hasPrefix("zh") ? "" : " ")
            handleWordTap(selectedText, index: range.lowerBound)
        }
        dragStartIdx = nil
    }

    private func handleWordTap(_ word: String, index: Int? = nil) {
        // Clear previous state immediately
        activeTranslation = nil
        activePronunciation = nil
        
        let cleanWord = word.trimmingCharacters(in: .punctuationCharacters)
        activeWord = word
        
        if let idx = index, selectionRange == nil {
            selectionRange = idx...idx
        }
        
        // Speak
        AudioService.shared.speak(cleanWord, language: languageCode)
        
        // Translate
        isTranslating = true
        Task {
            do {
                let result = try await TranslationService.shared.translate(cleanWord, from: languageCode)
                await MainActor.run {
                    self.activeTranslation = result.translation
                    self.activePronunciation = result.pronunciation
                    self.isTranslating = false
                    
                    // Auto hide after 5 seconds
                    DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
                        if self.activeWord == word {
                            self.activeTranslation = nil
                            self.activePronunciation = nil
                            self.activeWord = nil
                            self.selectionRange = nil
                        }
                    }
                }
            } catch {
                await MainActor.run {
                    self.isTranslating = false
                }
            }
        }
    }
}

final class TranslationService: Sendable {
    static let shared = TranslationService()

    func translate(_ text: String, from languageCode: String) async throws -> (translation: String, pronunciation: String?) {
        let targetLang = "vi"
        let encodedText = text.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        let urlString = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=\(languageCode)&tl=\(targetLang)&dt=t&dt=rm&q=\(encodedText)"
        
        guard let url = URL(string: urlString) else { throw URLError(.badURL) }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        let json = try JSONSerialization.jsonObject(with: data) as? [Any]
        
        var translation = ""
        var pronunciation: String?
        
        if let first = json?.first as? [Any] {
            for segment in first {
                if let s = segment as? [Any], let t = s.first as? String {
                    translation += t
                }
            }
            
            // Pronunciation is often at the end of the first array or second array
            if let last = first.last as? [Any], last.count >= 4, let p = last[3] as? String {
                pronunciation = p
            }
        }
        
        return (translation, pronunciation)
    }
}

@MainActor
class SpeechService: ObservableObject {
    static let shared = SpeechService()
    
    private let speechRecognizerEn = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    private let speechRecognizerZh = SFSpeechRecognizer(locale: Locale(identifier: "zh-CN"))
    
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    
    @Published var isRecording = false
    @Published var transcribedText = ""
    @Published var lastError: String?
    
    func requestPermissions() {
        SFSpeechRecognizer.requestAuthorization { _ in }
        AVAudioSession.sharedInstance().requestRecordPermission { _ in }
    }
    
    func startRecording(languageCode: String, completion: @escaping (String) -> Void) {
        // Stop any ongoing speech playback first
        AudioService.shared.stop()
        
        transcribedText = ""
        lastError = nil
        recognitionTask?.cancel()
        recognitionTask = nil
        
        let audioSession = AVAudioSession.sharedInstance()
        do {
            // Use playAndRecord to avoid switching categories too often, which can cause lag
            try audioSession.setCategory(.playAndRecord, mode: .measurement, options: [.defaultToSpeaker, .allowBluetooth])
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            lastError = "Audio session error"
            return
        }
        
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest = recognitionRequest else { return }
        recognitionRequest.shouldReportPartialResults = true
        
        // Force on-device recognition if available for speed
        if #available(iOS 13, *) {
            recognitionRequest.requiresOnDeviceRecognition = false // Set to false to ensure it works in simulator
        }
        
        let recognizer = languageCode.hasPrefix("zh") ? speechRecognizerZh : speechRecognizerEn
        
        // Check if recognizer is available
        guard let recognizer = recognizer, recognizer.isAvailable else {
            lastError = "Recognizer not available"
            return
        }
        
        recognitionTask = recognizer.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            if let result = result {
                self?.transcribedText = result.bestTranscription.formattedString
                // Update completion on every partial result for better UX
                completion(result.bestTranscription.formattedString)
            }
            if error != nil {
                self?.stopRecording()
            }
        }
        
        let recordingFormat = audioEngine.inputNode.outputFormat(forBus: 0)
        audioEngine.inputNode.removeTap(onBus: 0)
        audioEngine.inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            recognitionRequest.append(buffer)
        }
        
        if !audioEngine.isRunning {
            audioEngine.prepare()
            do {
                try audioEngine.start()
            } catch {
                lastError = "Audio engine start failed"
                return
            }
        }
        isRecording = true
    }
    
    func stopRecording() {
        // Update UI state immediately for responsiveness
        isRecording = false
        
        if audioEngine.isRunning {
            audioEngine.stop()
            audioEngine.inputNode.removeTap(onBus: 0)
        }
        
        recognitionRequest?.endAudio()
        
        // Clean up task after a short delay to allow final results
        let task = recognitionTask
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            task?.finish()
            self.recognitionTask = nil
            self.recognitionRequest = nil
        }
        
        let audioSession = AVAudioSession.sharedInstance()
        try? audioSession.setCategory(.playback, mode: .default, options: .duckOthers)
        try? audioSession.setActive(true)
    }
    
    func calculateScore(original: String, spoken: String) -> Int {
        func clean(_ s: String) -> [String] {
            s.lowercased()
                .components(separatedBy: CharacterSet.alphanumerics.inverted)
                .filter { !$0.isEmpty }
        }
        
        let orig = clean(original)
        let spok = clean(spoken)
        
        if orig.isEmpty { return 0 }
        if spok.isEmpty { return 0 }
        
        // Fuzzy matching: Count how many original words are found in spoken text in ANY order
        // (More forgiving for learners)
        var matches = 0
        var tempSpoken = spok
        
        for word in orig {
            if let index = tempSpoken.firstIndex(of: word) {
                matches += 1
                tempSpoken.remove(at: index)
            }
        }
        
        let baseScore = Double(matches) / Double(orig.count)
        
        // Penalize for too many extra words (noise/babbling)
        let penalty = max(0, Double(spok.count - orig.count) / Double(orig.count)) * 0.2
        
        let finalScore = max(0, (baseScore - penalty) * 100)
        return Int(finalScore)
    }
}

struct FeatureCard: View {
    let title: String
    let subtitle: String
    let icon: String
    let color: Color

    var body: some View {
        GlassCard {
            HStack(spacing: 16) {
                ZStack {
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(color.gradient)
                        .frame(width: 56, height: 56)
                    
                    Image(systemName: icon)
                        .font(.title2)
                        .foregroundStyle(.white)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .foregroundStyle(.primary)
                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.tertiary)
            }
            .padding(.vertical, 4)
        }
    }
}

struct SpeakingListView: View {
    let languageId: Int
    let languageCode: String
    @State private var passages: [ReadingPassage] = []
    @State private var isLoading = true

    var body: some View {
        ZStack {
            Color.appBg.ignoresSafeArea()
            
            if isLoading {
                ProgressView()
            } else {
                ScrollView {
                    VStack(spacing: 16) {
                        ForEach(passages) { passage in
                            NavigationLink(destination: SpeakingPracticeView(passage: passage, languageCode: languageCode)) {
                                FeatureCard(
                                    title: passage.title,
                                    subtitle: "\(passage.content.components(separatedBy: ".").count) câu",
                                    icon: "waveform",
                                    color: Color.purple
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding()
                }
            }
        }
        .navigationTitle("Chọn bài luyện nói")
        .task {
            await loadPassages()
        }
    }

    private func loadPassages() async {
        do {
            passages = try await APIService.shared.fetchReadingPassages(languageId: languageId)
            isLoading = false
        } catch {
            isLoading = false
        }
    }
}

struct SpeakingPracticeView: View {
    let passage: ReadingPassage
    let languageCode: String
    
    @State private var sentences: [String] = []
    @State private var currentIndex = 0
    @StateObject private var speechService = SpeechService.shared
    @State private var score: Int?
    @State private var spokenText: String = ""
    @Environment(\.dismiss) var dismiss

    private var progressPercent: Int {
        guard !sentences.isEmpty else { return 0 }
        return Int(Double(currentIndex + 1) / Double(sentences.count) * 100)
    }

    var body: some View {
        ZStack {
            Color.appBg.ignoresSafeArea()
            
            VStack(spacing: 30) {
                headerView
                Spacer()
                sentenceCardView
                resultView
                Spacer()
                actionView
            }
        }
        .toolbar(.hidden, for: .navigationBar)
        .onAppear {
            // Split by English and Chinese punctuation
            let separators = CharacterSet(charactersIn: ".!?。！？")
            sentences = passage.content
                .components(separatedBy: separators)
                .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
                .filter { !$0.isEmpty }
            
            // If no sentences found, use the whole content
            if sentences.isEmpty && !passage.content.isEmpty {
                sentences = [passage.content]
            }
        }
        .onDisappear {
            AudioService.shared.stop()
            speechService.stopRecording()
        }
    }

    private var headerView: some View {
        HStack {
            Button(action: { dismiss() }) {
                Image(systemName: "xmark")
                    .font(.title2)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Text("Câu \(currentIndex + 1)/\(sentences.count)")
                .font(.headline)
            Spacer()
            Text("\(progressPercent)%")
                .font(.caption.weight(.bold))
                .foregroundStyle(Color.purple)
        }
        .padding(.horizontal)
    }

    private var sentenceCardView: some View {
        VStack(spacing: 20) {
            Text(sentences.indices.contains(currentIndex) ? sentences[currentIndex] : "")
                .font(.title2.weight(.medium))
                .multilineTextAlignment(.center)
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color.appSurface)
                .clipShape(RoundedRectangle(cornerRadius: 20))
                .shadow(color: Color.black.opacity(0.05), radius: 10)
            
            Button(action: {
                AudioService.shared.speak(sentences[currentIndex], language: languageCode)
            }) {
                Label("Nghe mẫu", systemImage: "speaker.wave.2.fill")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Color.purple)
            }
        }
        .padding(.horizontal, 24)
    }

    private var resultView: some View {
        Group {
            if let score = score {
                VStack(spacing: 10) {
                    Text("\(score)%")
                        .font(.system(size: 60, weight: .black))
                        .foregroundStyle(score > 70 ? .green : .orange)
                    
                    Text(spokenText)
                        .font(.subheadline.italic())
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .transition(.scale.combined(with: .opacity))
            }
        }
    }

    private var actionView: some View {
        VStack(spacing: 20) {
            Button(action: {
                if speechService.isRecording {
                    speechService.stopRecording()
                } else {
                    speechService.startRecording(languageCode: languageCode) { result in
                        spokenText = result
                        score = speechService.calculateScore(original: sentences[currentIndex], spoken: result)
                    }
                }
            }) {
                ZStack {
                    Circle()
                        .fill(speechService.isRecording ? Color.red : Color.purple)
                        .frame(width: 80, height: 80)
                        .shadow(color: (speechService.isRecording ? Color.red : Color.purple).opacity(0.3), radius: 15)
                    
                    Image(systemName: speechService.isRecording ? "stop.fill" : "mic.fill")
                        .font(.system(size: 30))
                        .foregroundStyle(.white)
                }
            }
            .scaleEffect(speechService.isRecording ? 1.1 : 1.0)
            .animation(.easeInOut(duration: 0.5).repeatForever(autoreverses: true), value: speechService.isRecording)
            
            if score != nil && !speechService.isRecording {
                Button(action: {
                    withAnimation {
                        if currentIndex < sentences.count - 1 {
                            currentIndex += 1
                            score = nil
                            spokenText = ""
                        } else {
                            dismiss()
                        }
                    }
                }) {
                    HStack {
                        Text(currentIndex < sentences.count - 1 ? "Câu tiếp theo" : "Hoàn thành")
                        Image(systemName: "chevron.right")
                    }
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.purple)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .padding(.horizontal, 40)
            }
        }
        .padding(.bottom, 50)
    }
}
