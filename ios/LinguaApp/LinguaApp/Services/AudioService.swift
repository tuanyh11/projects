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
        
        // Request Edge TTS
        Task {
            do {
                try await fetchAndPlayEdgeTTS(text: text, language: language)
            } catch {
                print("❌ Edge TTS Failed: \(error.localizedDescription). Falling back to system TTS.")
                fallbackSpeak(text, language: language)
            }
        }
    }
    
    /// Chọn giọng Edge TTS (Microsoft Neural) phù hợp
    private func edgeVoice(for language: String) -> String {
        let lang = language.lowercased()
        switch lang {
        case "zh": return "zh-CN-XiaoxiaoNeural"
        case "ja": return "ja-JP-NanamiNeural"
        case "ko": return "ko-KR-SunHiNeural"
        case "fr": return "fr-FR-DeniseNeural"
        case "it": return "it-IT-ElsaNeural"
        case "vi": return "vi-VN-HoaiMyNeural"
        default:   return "en-US-AriaNeural"
        }
    }
    
    private func fetchAndPlayEdgeTTS(text: String, language: String = "en") async throws {
        // API URL của server Python Edge TTS đã deploy lên Render
        let baseUrlString = "https://lingua-tts.onrender.com/v1/audio/speech"
        
        guard var components = URLComponents(string: baseUrlString) else {
            throw URLError(.badURL)
        }
        
        let voice = edgeVoice(for: language)
        components.queryItems = [
            URLQueryItem(name: "text", value: text),
            URLQueryItem(name: "voice", value: voice)
        ]
        
        guard let url = components.url else { throw URLError(.badURL) }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        
        print("🎙️ Requesting Edge TTS voice: \(voice) for text: \(text)")
        
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

    /// Phát hiệu ứng âm thanh từ file nội bộ
    /// - Parameters:
    ///   - name: Tên file âm thanh (không cần đuôi file)
    ///   - volume: Âm lượng (0.0 – 2.0; mặc định 1.0)
    ///   - rate: Tốc độ phát (0.5 – 2.0; mặc định 1.0)
    private var effectPlayer: AVAudioPlayer?
    func playSound(_ name: String, volume: Float = 1.0, rate: Float = 1.0) {
        try? AVAudioSession.sharedInstance().setCategory(.playAndRecord, mode: .default, options: [.duckOthers, .defaultToSpeaker])
        try? AVAudioSession.sharedInstance().setActive(true)

        guard let url = Bundle.main.url(forResource: name, withExtension: nil) ??
                       Bundle.main.url(forResource: name, withExtension: "mp3") ??
                       Bundle.main.url(forResource: name, withExtension: "wav") ??
                       Bundle.main.url(forResource: name, withExtension: "m4a") else {
            print("⚠️ Could not find sound file: \(name)")
            AudioServicesPlaySystemSound(1053)
            return
        }

        do {
            effectPlayer = try AVAudioPlayer(contentsOf: url)
            effectPlayer?.volume = min(max(volume, 0.0), 2.0)   // clamp 0–2
            effectPlayer?.enableRate = true
            effectPlayer?.rate   = min(max(rate, 0.25), 4.0)    // clamp 0.25–4
            effectPlayer?.prepareToPlay()
            effectPlayer?.play()
            print("🔊 Playing effect: \(name) | volume=\(volume) rate=\(rate)")
        } catch {
            print("❌ Failed to play sound \(name): \(error.localizedDescription)")
        }
    }

    /// Phát tiếng báo lỗi — chậm hơn bình thường
    func playWrongSound() {
        playSound("wrong", volume: 1.0, rate: 0.6)
    }

    /// Phát tiếng hoàn thành — to hơn bình thường
    func playSuccessSound() {
        playSound("sussces", volume: 2.0, rate: 1.0)
    }
}
