import Foundation
import SwiftUI

@MainActor
final class AuthService: ObservableObject {
    static let shared = AuthService()
    
    @Published var isAuthenticated = false
    @Published var currentUser: User? = nil
    
    private let userDefaultsKey = "saved_user_data"
    
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
    
    func login(email: String, password: String) async throws {
        let body = ["email": email, "password": password]
        let user: User = try await APIService.shared.post("/rpc/login", body: body)
        handleSuccessfulSignIn(user: user)
    }
    
    func register(name: String, email: String, password: String) async throws {
        let body = ["name": name, "email": email, "password": password]
        let user: User = try await APIService.shared.post("/rpc/signup", body: body)
        handleSuccessfulSignIn(user: user)
    }
    
    private func handleSuccessfulSignIn(user: User) {
        self.currentUser = user
        self.isAuthenticated = true
        
        if let encoded = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(encoded, forKey: userDefaultsKey)
        }
    }
    
    func signOut() {
        UserDefaults.standard.removeObject(forKey: userDefaultsKey)
        self.isAuthenticated = false
        self.currentUser = nil
    }
}
