import Foundation

final class TranslationService: Sendable {
    static let shared = TranslationService()
    
    /// Dịch một từ hoặc câu sử dụng Lingva (Free Google Translate API)
    func translate(_ text: String, from source: String, to target: String = "vi") async throws -> String {
        // Lingva API Format: https://lingva.ml/api/v1/source/target/query
        let query = text.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? text
        let urlString = "https://lingva.ml/api/v1/\(source)/\(target)/\(query)"
        
        guard let url = URL(string: urlString) else {
            throw URLError(.badURL)
        }
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }
        
        let result = try JSONDecoder().decode(LingvaResponse.self, from: data)
        return result.translation
    }
    
    private struct LingvaResponse: Codable {
        let translation: String
    }
}
