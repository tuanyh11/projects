import Foundation
import Speech
import AVFoundation

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
        SFSpeechRecognizer.requestAuthorization { status in
            // Handle status if needed
        }
        
        AVAudioApplication.requestRecordPermission { granted in
            // Handle status if needed
        }
    }
    
    func startRecording(languageCode: String, completion: @escaping (String) -> Void) {
        // Reset state
        transcribedText = ""
        lastError = nil
        
        // Cancel previous task
        recognitionTask?.cancel()
        recognitionTask = nil
        
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            lastError = "Audio session error: \(error.localizedDescription)"
            return
        }
        
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        
        guard let recognitionRequest = recognitionRequest else { return }
        recognitionRequest.shouldReportPartialResults = true
        
        let recognizer = languageCode.hasPrefix("zh") ? speechRecognizerZh : speechRecognizerEn
        
        recognitionTask = recognizer?.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            if let result = result {
                self?.transcribedText = result.bestTranscription.formattedString
                if result.isFinal {
                    completion(result.bestTranscription.formattedString)
                }
            }
            
            if error != nil || result?.isFinal == true {
                self?.stopRecording()
            }
        }
        
        let recordingFormat = audioEngine.inputNode.outputFormat(forBus: 0)
        audioEngine.inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            recognitionRequest.append(buffer)
        }
        
        audioEngine.prepare()
        do {
            try audioEngine.start()
            isRecording = true
        } catch {
            lastError = "Audio engine error: \(error.localizedDescription)"
        }
    }
    
    func stopRecording() {
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        isRecording = false
        
        // Reset audio session to playback
        let audioSession = AVAudioSession.sharedInstance()
        try? audioSession.setCategory(.playback, mode: .default)
        try? audioSession.setActive(true)
    }
    
    // Scoring logic: Simple word overlap for now
    func calculateScore(original: String, spoken: String) -> Int {
        let originalWords = original.lowercased()
            .components(separatedBy: CharacterSet.alphanumerics.inverted)
            .filter { !$0.isEmpty }
        
        let spokenWords = spoken.lowercased()
            .components(separatedBy: CharacterSet.alphanumerics.inverted)
            .filter { !$0.isEmpty }
        
        if originalWords.isEmpty { return 0 }
        
        var matches = 0
        var spokenSet = Set(spokenWords)
        
        for word in originalWords {
            if spokenSet.contains(word) {
                matches += 1
                spokenSet.remove(word) // Count each word once
            }
        }
        
        return Int((Double(matches) / Double(originalWords.count)) * 100)
    }
}
