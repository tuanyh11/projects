import SwiftUI

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
    
    enum FeedbackType {
        case correct, incorrect
    }
    
    var body: some View {
        ZStack {
            Color.appBg.ignoresSafeArea()
            
            if isLoading {
                ProgressView()
            } else if isFinished {
                finishView
            } else if let question = currentQuestion() {
                VStack(spacing: 0) {
                    // Progress Header
                    HStack {
                        Text("Câu hỏi \(currentQuestionIndex + 1)/\(questions.count)")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.secondary)
                        Spacer()
                        Text("Điểm: \(score)")
                            .font(.subheadline.weight(.bold))
                            .foregroundStyle(.appAccent)
                    }
                    .padding()
                    
                    ScrollView {
                        VStack(alignment: .leading, spacing: 20) {
                            // Passage Content
                            VStack(alignment: .leading, spacing: 12) {
                                Text(passage.title)
                                    .font(.title2.weight(.bold))
                                
                                Text(showTranslation ? (passage.translation ?? passage.content) : passage.content)
                                    .font(.body)
                                    .lineSpacing(6)
                                
                                Button(action: { showTranslation.toggle() }) {
                                    Label(showTranslation ? "Hiện nguyên bản" : "Xem bản dịch", systemImage: "character.book.closed")
                                        .font(.caption.weight(.medium))
                                        .foregroundStyle(.appAccent)
                                }
                                .padding(.top, 4)
                            }
                            .padding(20)
                            .background(Color.appSurface)
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                            .shadow(color: Color.black.opacity(0.03), radius: 5, x: 0, y: 2)
                            
                            // Question
                            VStack(alignment: .leading, spacing: 16) {
                                Text(question.question)
                                    .font(.headline)
                                    .padding(.top, 8)
                                
                                ForEach(0..<question.options.count, id: \.self) { index in
                                    OptionButton(
                                        text: question.options[index],
                                        isSelected: selectedOptionIndex == index,
                                        isCorrect: feedbackType == .correct && index == question.correctOptionIndex,
                                        isIncorrect: feedbackType == .incorrect && selectedOptionIndex == index,
                                        action: {
                                            if selectedOptionIndex == nil {
                                                handleAnswer(index: index)
                                            }
                                        }
                                    )
                                }
                            }
                        }
                        .padding(.horizontal)
                        .padding(.bottom, 32)
                    }
                }
            }
        }
        .navigationTitle("Trắc Nghiệm")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadQuestions()
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
                StatBox(value: "\(Int(Double(score) / Double(max(1, questions.count)) * 100))%", label: "Tỷ lệ", color: .appBlue)
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
    let text: String
    let isSelected: Bool
    let isCorrect: Bool
    let isIncorrect: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Text(text)
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
