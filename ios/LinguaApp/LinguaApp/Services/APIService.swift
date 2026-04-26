import Foundation

final class APIService: Sendable {
    static let shared = APIService()

    // Standalone API URL trên tài khoản Render mới
    private let baseURL = "https://lingua-api-standalone.onrender.com"

    private var decoder: JSONDecoder {
        let d = JSONDecoder()
        d.keyDecodingStrategy = .convertFromSnakeCase
        return d
    }

    // MARK: - Languages
    func fetchLanguages() async throws -> [Language] {
        try await get("/languages?order=id")
    }

    // MARK: - Lessons
    func fetchLessons(languageId: Int) async throws -> [Lesson] {
        try await get("/lessons?language_id=eq.\(languageId)&order=order")
    }

    // MARK: - Vocabularies
    func fetchVocabularies(lessonId: Int) async throws -> [Vocabulary] {
        try await get("/vocabularies?lesson_id=eq.\(lessonId)")
    }

    // MARK: - Stories
    func fetchStories(languageId: Int? = nil) async throws -> [Story] {
        var path = "/stories?is_published=eq.1&order=id"
        if let id = languageId {
            path += "&language_id=eq.\(id)"
        }
        return try await get(path)
    }

    // MARK: - Story Lines
    func fetchStoryLines(storyId: Int) async throws -> [StoryLine] {
        try await get("/story_lines?story_id=eq.\(storyId)&order=line_order")
    }

    // MARK: - Writing Prompts
    func fetchWritingPrompts() async throws -> [WritingPrompt] {
        try await get("/writing_prompts?is_published=eq.1")
    }

    // MARK: - Reading Comprehension
    func fetchReadingPassages(languageId: Int) async throws -> [ReadingPassage] {
        try await get("/reading_passages?language_id=eq.\(languageId)&order=id")
    }

    func fetchReadingQuestions(passageId: Int) async throws -> [ReadingQuestion] {
        try await get("/reading_questions?passage_id=eq.\(passageId)&order=id")
    }

    // MARK: - User Progress
    func fetchUserProgress(userId: Int) async throws -> [UserProgress] {
        try await get("/user_progress?user_id=eq.\(userId)")
    }

    func saveProgress(userId: Int, storyId: Int?, lessonId: Int?, wpm: Int, accuracy: Int)
        async throws
    {
        let body = ProgressPayload(
            userId: userId,
            storyId: storyId,
            lessonId: lessonId,
            wpm: wpm,
            accuracy: accuracy
        )
        // PostgREST returns the created object, but we don't need it here
        let _: [UserProgress] = try await post("/user_progress", body: body)
    }

    private struct ProgressPayload: Codable, Sendable {
        let userId: Int
        let storyId: Int?
        let lessonId: Int?
        let wpm: Int
        let accuracy: Int
    }

    // MARK: - Progress Tracking
    func getUserStats(userId: Int) async throws -> UserStats {
        let body = ["p_user_id": userId]
        return try await post("/rpc/get_user_stats", body: body)
    }

    func recordActivity(userId: Int, type: String, accuracy: Int = 0, wpm: Int = 0, wordsTyped: Int = 0, minutes: Int = 0) async throws {
        let body: [String: Any] = [
            "p_user_id": userId,
            "p_type": type,
            "p_accuracy": accuracy,
            "p_wpm": wpm,
            "p_words_typed": wordsTyped,
            "p_minutes": minutes
        ]
        // Use a raw post since we have mixed types
        guard let url = URL(string: baseURL + "/rpc/record_activity") else {
            throw URLError(.badURL)
        }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        if let token = await AuthService.shared.token {
            request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (_, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
            throw URLError(.badServerResponse)
        }
    }

    func fetchAchievements(userId: Int) async throws -> [Achievement] {
        try await get("/achievements?user_id=eq.\(userId)&order=unlocked_at.desc")
    }

    // MARK: - Generic GET
    private func get<T: Decodable & Sendable>(_ path: String) async throws -> T {
        guard let url = URL(string: baseURL + path) else {
            throw URLError(.badURL)
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.addValue("application/json", forHTTPHeaderField: "Accept")

        // Thêm JWT Token nếu có
        if let token = await AuthService.shared.token {
            request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await URLSession.shared.data(for: request)
        
        // Log để debug
        if let jsonString = String(data: data, encoding: .utf8) {
            print("📡 GET Response [\(path)]: \(jsonString)")
        }

        guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
            throw URLError(.badServerResponse)
        }
        
        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            print("❌ Decoding Error [\(path)]: \(error)")
            throw error
        }
    }

    // MARK: - Generic POST
    func post<T: Decodable & Sendable, U: Encodable & Sendable>(_ path: String, body: U)
        async throws -> T
    {
        guard let url = URL(string: baseURL + path) else {
            throw URLError(.badURL)
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        request.addValue("return=representation", forHTTPHeaderField: "Prefer")

        // Thêm JWT Token nếu có
        if let token = await AuthService.shared.token {
            request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        request.httpBody = try encoder.encode(body)

        let (data, response) = try await URLSession.shared.data(for: request)

        // Log để debug
        if let jsonString = String(data: data, encoding: .utf8) {
            print("📡 POST Response [\(path)]: \(jsonString)")
        }

        guard let http = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }

        if !(200...299).contains(http.statusCode) {
            // Attempt to parse PostgREST error
            if let errorJson = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                let message = errorJson["message"] as? String
            {
                throw NSError(
                    domain: "APIServiceError", code: http.statusCode,
                    userInfo: [NSLocalizedDescriptionKey: message])
            }
            throw URLError(.badServerResponse)
        }

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            print("❌ Decoding Error [\(path)]: \(error)")
            throw error
        }
    }
}
