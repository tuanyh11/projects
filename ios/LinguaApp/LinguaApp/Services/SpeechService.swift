import Foundation
import Speech
import AVFoundation

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
