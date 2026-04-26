import Foundation

// MARK: - User
struct User: Codable, Identifiable, Sendable, Hashable {
    let id: Int
    let name: String?
    let email: String
    let avatarUrl: String?
}

// MARK: - Auth Response
struct AuthResponse: Codable, Sendable {
    let user: User
    let token: String
}

// MARK: - Language
struct Language: Codable, Identifiable, Sendable, Hashable {
    let id: Int
    let name: String
    let code: String
    let flag: String?
    let description: String?
    let totalLessons: Int?
    let totalStudents: Int?
    let level: String?
    let color: String?
    let createdAt: String?
    let updatedAt: String?

    var displayColor: String { color ?? "#7c6fff" }
    var displayFlag: String { flag ?? "🌐" }
}

// MARK: - Lesson
struct Lesson: Codable, Identifiable, Sendable, Hashable {
    let id: Int
    let languageId: Int
    let title: String
    let content: String?
    let level: String?
    let order: Int?
    let duration: Int?
    let isPublished: Int?
    let category: String?
    let createdAt: String?
    let updatedAt: String?
}

// MARK: - Vocabulary
struct Vocabulary: Codable, Identifiable, Sendable, Hashable {
    let id: Int
    let lessonId: Int
    let word: String
    let pronunciation: String?
    let translation: String?
    let example: String?
    let partOfSpeech: String?
    let createdAt: String?
    let updatedAt: String?
}

// MARK: - Story
struct Story: Codable, Identifiable, Sendable, Hashable {
    let id: Int
    let languageId: Int
    let title: String
    let titleVi: String?
    let category: String?
    let categoryVi: String?
    let difficulty: String?
    let totalLines: Int?
    let totalWords: Int?
    let isPublished: Int?
    let createdAt: String?
    let updatedAt: String?
}

// MARK: - StoryLine
struct StoryLine: Codable, Identifiable, Sendable {
    let id: Int
    let storyId: Int
    let lineOrder: Int?
    let textEn: String?
    let textVi: String?
    let wordsJson: [WordPair]?
}

// MARK: - WordPair
struct WordPair: Codable, Sendable, Hashable {
    let en: String
    let vi: String
}

// MARK: - WritingPrompt
struct WritingPrompt: Codable, Identifiable, Sendable, Hashable {
    let id: Int
    let title: String
    let prompt: String
    let taskType: String?
    let category: String?
    let difficulty: String?
    let timeLimitMinutes: Int?
    let minWords: Int?
    let maxWords: Int?
    let tips: String?
    let sampleOutline: String?
    let isPublished: Int?
    let createdAt: String?
    let updatedAt: String?
}

// MARK: - UserProgress
struct UserProgress: Codable, Identifiable, Sendable, Hashable {
    let id: Int
    let userId: Int
    let storyId: Int?
    let lessonId: Int?
    let wpm: Int?
    let accuracy: Int?
    let completedAt: String?
}

// MARK: - ReadingPassage
struct ReadingPassage: Codable, Identifiable, Sendable, Hashable {
    let id: Int
    let languageId: Int
    let title: String
    let content: String
    let translation: String?
    let difficulty: String?
}

// MARK: - ReadingQuestion
struct ReadingQuestion: Codable, Identifiable, Sendable, Hashable {
    let id: Int
    let passageId: Int
    let question: String
    let options: [String]
    let correctOptionIndex: Int
}

// MARK: - User Stats (from get_user_stats RPC)
struct UserStats: Codable, Sendable {
    let totalLessons: Int
    let totalStories: Int
    let totalQuizzes: Int
    let totalWordsTyped: Int
    let totalMinutes: Int
    let avgAccuracy: Int
    let avgWpm: Int
    let currentStreak: Int
    let longestStreak: Int
    let weeklyActivity: [WeeklyActivity]?
}

// MARK: - Weekly Activity
struct WeeklyActivity: Codable, Sendable, Identifiable {
    let d: String           // Date string
    let activities: Int
    let minutes: Int
    let words: Int
    
    var id: String { d }
    
    var dayLabel: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard let date = formatter.date(from: d) else { return "?" }
        formatter.dateFormat = "EEE"
        formatter.locale = Locale(identifier: "vi_VN")
        return formatter.string(from: date)
    }
}

// MARK: - Daily Activity
struct DailyActivity: Codable, Identifiable, Sendable {
    let id: Int
    let activityDate: String
    let lessonsCompleted: Int
    let storiesCompleted: Int
    let quizzesCompleted: Int
    let totalMinutes: Int
    let wordsTyped: Int
    let avgAccuracy: Int
    let avgWpm: Int
}

// MARK: - Achievement
struct Achievement: Codable, Identifiable, Sendable {
    let id: Int
    let userId: Int
    let achievementType: String
    let title: String
    let description: String?
    let icon: String?
    let unlockedAt: String?
}
