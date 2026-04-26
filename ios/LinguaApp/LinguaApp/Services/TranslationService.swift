import Foundation

final class TranslationService: Sendable {
    static let shared = TranslationService()
    
    /// Dịch một từ hoặc câu sử dụng Google Translate API (không chính thức)
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
