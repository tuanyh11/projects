import SwiftUI

struct VocabTypingView: View {
    @Environment(\.dismiss) var dismiss
    let lesson: Lesson
    let languageCode: String

    @State private var vocabularies: [Vocabulary] = []
    @State private var currentIndex: Int = 0
    @State private var typedText = ""
    @State private var isFinished = false
    @State private var isLoading = true
    @State private var errorMessage: String?

    // Stats
    @State private var startTime: Date?
    @State private var totalCharactersTyped = 0
    @State private var totalErrors = 0

    @FocusState private var isFocused: Bool

    var currentVocab: Vocabulary? {
        guard currentIndex < vocabularies.count else { return nil }
        return vocabularies[currentIndex]
    }

    var targetText: String {
        currentVocab?.word.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    }

    var accuracy: Int {
        let totalAttempts = totalCharactersTyped + totalErrors
        guard totalAttempts > 0 else { return 100 }
        return Int((Double(totalCharactersTyped) / Double(totalAttempts)) * 100)
    }

    var body: some View {
        ZStack {
            Color.appBg.ignoresSafeArea()

            if isLoading {
                ProgressView("Đang tải từ vựng...")
                    .tint(.appAccent)
                    .foregroundStyle(.secondary)
            } else if let error = errorMessage {
                EmptyStateView(
                    icon: "exclamationmark.triangle",
                    title: "Lỗi Tải Dữ Liệu",
                    subtitle: error
                )
            } else if isFinished {
                finishView
            } else if let vocab = currentVocab {
                typingInterface(vocab: vocab)
            } else {
                EmptyStateView(
                    icon: "book.closed",
                    title: "Không có dữ liệu",
                    subtitle: "Không tìm thấy từ vựng nào."
                )
            }
        }
        .onDisappear {
            AudioService.shared.stop()
        }
        .navigationTitle(lesson.title)
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadVocabularies()
        }
        .onAppear {
            isFocused = true
            if !isLoading && !vocabularies.isEmpty {
                speakCurrentWord()
            }
        }
    }

    private func loadVocabularies() async {
        do {
            vocabularies = try await APIService.shared.fetchVocabularies(lessonId: lesson.id)
            isLoading = false
            if !vocabularies.isEmpty {
                speakCurrentWord()
                isFocused = true
            }
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }

    private func typingInterface(vocab: Vocabulary) -> some View {
        VStack(spacing: 32) {
            // Stats Header
            HStack {
                Spacer()
                StatView(title: "Accuracy", value: "\(accuracy)%", color: .primary)
                Spacer()
                StatView(
                    title: "Progress", value: "\(currentIndex + 1)/\(vocabularies.count)",
                    color: .primary)
                Spacer()
            }
            .padding(.top, 20)

            Spacer()

            // Flashcard
            VStack(spacing: 16) {
                if let translation = vocab.translation {
                    Text(translation)
                        .font(.title2.weight(.medium))
                        .foregroundStyle(.primary)
                }

                if let pos = vocab.partOfSpeech {
                    Text(pos)
                        .font(.caption.weight(.semibold))
                        .textCase(.uppercase)
                        .tracking(1)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(Color.appSurface2, in: Capsule())
                        .foregroundStyle(.secondary)
                }

                if let pron = vocab.pronunciation {
                    Text(pron)
                        .font(.subheadline)
                        .foregroundStyle(.tertiary)
                }

                Button(action: {
                    speakCurrentWord()
                }) {
                    Image(systemName: "speaker.wave.2")
                        .font(.title3)
                        .foregroundStyle(.primary)
                        .padding(12)
                        .background(Color.appSurface, in: Circle())
                        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
                }
                .padding(.top, 8)

                if let example = vocab.example {
                    Text("Ví dụ: \(example)")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.top, 16)
                        .padding(.horizontal, 32)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 32)
            .background(
                Color.appSurface, in: RoundedRectangle(cornerRadius: 16, style: .continuous)
            )
            .shadow(color: Color.black.opacity(0.04), radius: 10, x: 0, y: 4)
            .padding(.horizontal, 24)

            Spacer()

            // Typing Area
            ZStack(alignment: .top) {
                // Invisible TextField to capture input
                TextField("", text: $typedText, axis: .vertical)
                    .focused($isFocused)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.never)
                    .opacity(0)
                    .frame(height: 1)

                // Display the text character by character
                RichTextView(target: targetText, typed: typedText)
                    .onTapGesture {
                        isFocused = true
                    }
            }
            .padding(.horizontal, 24)

            Spacer()

            Text("Gõ lại từ vựng. Nhấn màn hình nếu mất tiêu điểm.")
                .font(.caption)
                .foregroundStyle(.tertiary)
                .padding(.bottom, 24)
        }
        .onChange(of: typedText) { oldValue, newValue in
            handleInput(oldValue: oldValue, newValue: newValue)
        }
        .onChange(of: currentIndex) { _, _ in
            speakCurrentWord()
        }
    }

    private func speakCurrentWord() {
        if !isFinished, let word = currentVocab?.word {
            AudioService.shared.speak(word, language: languageCode)
        }
    }

    private var finishView: some View {
        VStack(spacing: 20) {
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 72, weight: .light))
                .foregroundStyle(LinearGradient.accentGradient)
                .shadow(color: Color.appAccent.opacity(0.3), radius: 10, x: 0, y: 5)

            Text("Hoàn thành bài học!")
                .font(.title.weight(.semibold))

            Text("Bạn đã ôn tập xong các từ vựng.")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            HStack(spacing: 16) {
                StatBox(value: "\(vocabularies.count)", label: "Từ Vựng", color: .appAccent)
                StatBox(value: "\(accuracy)%", label: "Độ Chính Xác", color: .appAccent)
            }
            .padding(.horizontal, 40)
            .padding(.top, 12)

            Spacer()

            Button(action: {
                dismiss()
            }) {
                Text("Tiếp tục")
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

        if !targetText.hasPrefix(newValue) {
            if newValue.count > oldValue.count {
                totalErrors += 1
                AudioService.shared.playSound("wrong")
                let generator = UINotificationFeedbackGenerator()
                generator.notificationOccurred(.error)
            }
            typedText = oldValue
            return
        }

        if newValue.count > oldValue.count {
            totalCharactersTyped += 1
        }

        if newValue == targetText {
            AudioService.shared.playSound("sussces")
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                if currentIndex + 1 < vocabularies.count {
                    currentIndex += 1
                    typedText = ""
                } else {
                    AudioService.shared.playSound("sussces")
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
                    storyId: nil,
                    lessonId: lesson.id,
                    wpm: 0,  // Vocab doesn't strictly use WPM
                    accuracy: accuracy
                )
                print("✅ Vocab progress saved!")
            } catch {
                print("❌ Failed to save vocab progress: \(error)")
            }
        }
    }
}
