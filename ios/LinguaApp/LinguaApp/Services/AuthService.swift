import Foundation
import SwiftUI

@MainActor
final class AuthService: ObservableObject {
    static let shared = AuthService()
    
    @Published var isAuthenticated = false
    @Published var currentUser: User? = nil
    
    private let userDefaultsKey = "saved_user_data"
    private let tokenDefaultsKey = "saved_auth_token"
    
    init() {
        checkPreviousSignIn()
    }
    
    func checkPreviousSignIn() {
        if let data = UserDefaults.standard.data(forKey: userDefaultsKey),
           let savedUser = try? JSONDecoder().decode(User.self, from: data) {
            self.currentUser = savedUser
            self.isAuthenticated = true
        } else {
            self.isAuthenticated = false
        }
    }
    
    var token: String? {
        UserDefaults.standard.string(forKey: tokenDefaultsKey)
    }
    
    func login(email: String, password: String) async throws {
        let body = ["email": email, "password": password]
        let response: AuthResponse = try await APIService.shared.post("/rpc/login", body: body)
        handleSuccessfulSignIn(response: response)
    }
    
    func register(name: String, email: String, password: String) async throws {
        let body = ["name": name, "email": email, "password": password]
        // Signup có thể trả về User hoặc AuthResponse tùy SQL. 
        // Nếu SQL signup chỉ trả về User, mình cần gọi login sau đó.
        // Ở đây mình giả sử signup trả về User theo SQL cũ của anh.
        let _: User = try await APIService.shared.post("/rpc/signup", body: body)
        // Sau khi signup thành công, tự động login để lấy token
        try await login(email: email, password: password)
    }
    
    private func handleSuccessfulSignIn(response: AuthResponse) {
        self.currentUser = response.user
        self.isAuthenticated = true
        
        UserDefaults.standard.set(response.token, forKey: tokenDefaultsKey)
        if let encoded = try? JSONEncoder().encode(response.user) {
            UserDefaults.standard.set(encoded, forKey: userDefaultsKey)
        }
    }
    
    func signOut() {
        UserDefaults.standard.removeObject(forKey: userDefaultsKey)
        UserDefaults.standard.removeObject(forKey: tokenDefaultsKey)
        self.isAuthenticated = false
        self.currentUser = nil
    }
}
