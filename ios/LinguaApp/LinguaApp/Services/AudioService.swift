import AVFoundation
import Combine

@MainActor
final class AudioService: ObservableObject {
    static let shared = AudioService()
    
    private var audioPlayer: AVAudioPlayer?
    private var synthesizer = AVSpeechSynthesizer() // Fallback
    
    func stop() {
        audioPlayer?.stop()
        synthesizer.stopSpeaking(at: .immediate)
        print("🛑 Audio stopped")
    }
    
    func speak(_ text: String, language: String = "en") {
        // Ensure audio session is set to play sound
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: .duckOthers)
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Failed to set audio session: \(error)")
        }
        
        print("🔊 Speaking [\(language)]: \(text)")
        
        // Stop current speech or playback
        audioPlayer?.stop()
        synthesizer.stopSpeaking(at: .immediate)
        
        // Request Kokoro TTS
        Task {
            do {
                try await fetchAndPlayKokoro(text: text, language: language)
            } catch {
                print("❌ Kokoro TTS Failed: \(error.localizedDescription). Falling back to system TTS.")
                fallbackSpeak(text, language: language)
            }
        }
    }
    
    /// Chọn giọng Kokoro phù hợp với từng ngôn ngữ
    private func kokoroVoice(for language: String) -> String {
        let lang = language.lowercased()
        switch lang {
        case "zh": return "zf_xiaoxiao"
        case "ja": return "jf_alpha"
        case "ko": return "hf_alpha"
        case "fr": return "ff_siwis"
        case "it": return "if_sara"
        default:   return "af_bella" // Nữ Mỹ (thường rõ hơn Michael)
        }
    }
    
    /// Chọn ngôn ngữ (lang_code) cho Kokoro
    private func kokoroLangCode(for language: String) -> String {
        let lang = language.lowercased()
        if lang.contains("zh") { return "z" } // Trung
        if lang.contains("ja") { return "j" } // Nhật
        if lang.contains("ko") { return "k" } // Hàn
        if lang.contains("fr") { return "f" } // Pháp
        if lang.contains("it") { return "i" } // Ý
        return "a" // Mặc định là Tiếng Anh (American/British)
    }
    
    private func fetchAndPlayKokoro(text: String, language: String = "en") async throws {
        guard let url = URL(string: "http://localhost:8880/v1/audio/speech") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let voice = kokoroVoice(for: language)
        let langCode = kokoroLangCode(for: language)
        print("🎙️ Requesting Kokoro voice: \(voice), lang_code: \(langCode) for text: \(text)")
        
        let body: [String: Any] = [
            "model": "kokoro",
            "input": text,
            "voice": voice,
            "language": langCode, // Thử cả 2 key phổ biến
            "lang_code": langCode,
            "speed": 1.0,
            "response_format": "wav"
        ]
        
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }
        
        audioPlayer = try AVAudioPlayer(data: data)
        audioPlayer?.play()
    }
    
    private func fallbackSpeak(_ text: String, language: String) {
        let utterance = AVSpeechUtterance(string: text)
        
        // Map simple codes to BCP-47 for iOS
        let bcpCode: String
        switch language.lowercased() {
        case "zh": bcpCode = "zh-CN"
        case "en": bcpCode = "en-US"
        case "ja": bcpCode = "ja-JP"
        case "ko": bcpCode = "ko-KR"
        case "fr": bcpCode = "fr-FR"
        default:   bcpCode = language
        }
        
        print("📱 System TTS Fallback with code: \(bcpCode)")
        utterance.voice = AVSpeechSynthesisVoice(language: bcpCode)
        utterance.rate = 0.5
        synthesizer.speak(utterance)
    }
    
    func playKeystrokeSound() {
        AudioServicesPlaySystemSound(1104)
    }

    func listAvailableVoices() {
        let voices = AVSpeechSynthesisVoice.speechVoices()
        for voice in voices {
            print("🔊 Available Voice: \(voice.name) [\(voice.language)]")
        }
    }
}
