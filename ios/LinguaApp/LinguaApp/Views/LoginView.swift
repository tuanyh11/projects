import SwiftUI

struct LoginView: View {
    @StateObject private var authService = AuthService.shared
    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.adaptiveBg.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 40) {
                        Spacer().frame(height: 60)
                        
                        // Logo & Title
                        VStack(spacing: 16) {
                            ZStack {
                                Circle()
                                    .fill(LinearGradient.accentGradient)
                                    .frame(width: 80, height: 80)
                                Image(systemName: "globe.asia.australia.fill")
                                    .font(.system(size: 40, weight: .medium))
                                    .foregroundStyle(.white)
                            }
                            
                            Text("LinguaZen")
                                .font(.largeTitle.weight(.bold))
                                .tracking(1.5)
                                .foregroundStyle(Color.adaptiveText)
                            
                            Text("Đăng nhập để tiếp tục")
                                .font(.subheadline)
                                .foregroundStyle(Color.appTextMuted)
                        }
                        
                        // Form
                        VStack(spacing: 20) {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Email")
                                    .font(.caption.weight(.bold))
                                    .foregroundStyle(Color.appTextMuted)
                                TextField("", text: $email, prompt: Text("Nhập email").foregroundColor(Color.appTextMuted.opacity(0.5)))
                                    .foregroundStyle(Color.adaptiveText)
                                    .keyboardType(.emailAddress)
                                    .textInputAutocapitalization(.never)
                                    .autocorrectionDisabled()
                                    .padding()
                                    .background(Color.adaptiveSurface, in: RoundedRectangle(cornerRadius: 12))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(Color.appBorder, lineWidth: 1)
                                    )
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Mật khẩu")
                                    .font(.caption.weight(.bold))
                                    .foregroundStyle(Color.appTextMuted)
                                SecureField("", text: $password, prompt: Text("Nhập mật khẩu").foregroundColor(Color.appTextMuted.opacity(0.5)))
                                    .foregroundStyle(Color.adaptiveText)
                                    .padding()
                                    .background(Color.adaptiveSurface, in: RoundedRectangle(cornerRadius: 12))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(Color.appBorder, lineWidth: 1)
                                    )
                            }
                            
                            if let error = errorMessage {
                                Text(error)
                                    .font(.caption)
                                    .foregroundStyle(.red)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }
                        }
                        .padding(.horizontal, 32)
                        
                        // Action Buttons
                        VStack(spacing: 16) {
                            Button(action: handleLogin) {
                                HStack(spacing: 8) {
                                    if isLoading {
                                        ProgressView().tint(.white)
                                    } else {
                                        Image(systemName: "arrow.right.circle.fill")
                                        Text("Đăng nhập")
                                    }
                                }
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 52)
                                .background(
                                    LinearGradient.accentGradient,
                                    in: RoundedRectangle(cornerRadius: 14, style: .continuous)
                                )
                                .shadow(color: Color.appAccent.opacity(0.3), radius: 12, x: 0, y: 6)
                            }
                            .disabled(isLoading || email.isEmpty || password.isEmpty)
                            .padding(.horizontal, 32)
                            
                            NavigationLink(destination: RegisterView()) {
                                Text("Chưa có tài khoản? **Đăng ký ngay**")
                                    .font(.subheadline)
                                    .foregroundStyle(Color.adaptiveText)
                                    .padding(.vertical, 8)
                                    .frame(maxWidth: .infinity)
                                    .contentShape(Rectangle())
                            }
                        }
                        .padding(.top, 10)
                        
                        Spacer()
                    }
                }
            }
        }
    }
    
    private func handleLogin() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                try await authService.login(email: email, password: password)
            } catch {
                errorMessage = "Đăng nhập thất bại. Kiểm tra lại email hoặc mật khẩu."
                isLoading = false
            }
        }
    }
}

#Preview {
    LoginView()
}
