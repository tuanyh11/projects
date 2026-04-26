import SwiftUI

struct RegisterView: View {
    @StateObject private var authService = AuthService.shared
    @Environment(\.dismiss) var dismiss
    
    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    var body: some View {
        ZStack {
            Color.adaptiveBg.ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 40) {
                    // Title
                    VStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(LinearGradient.pinkGradient)
                                .frame(width: 72, height: 72)
                            Image(systemName: "person.badge.plus.fill")
                                .font(.system(size: 32, weight: .medium))
                                .foregroundStyle(.white)
                        }
                        
                        Text("Tạo Tài Khoản")
                            .font(.largeTitle.weight(.bold))
                            .foregroundStyle(Color.adaptiveText)
                        
                        Text("Tham gia học ngôn ngữ cùng LinguaZen")
                            .font(.subheadline)
                            .foregroundStyle(Color.appTextMuted)
                    }
                    .padding(.top, 40)
                    
                    // Form
                    VStack(spacing: 20) {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Tên của bạn")
                                .font(.caption.weight(.bold))
                                .foregroundStyle(Color.appTextMuted)
                            TextField("", text: $name, prompt: Text("Nguyễn Văn A").foregroundColor(Color.appTextMuted.opacity(0.5)))
                                .foregroundStyle(Color.adaptiveText)
                                .textInputAutocapitalization(.words)
                                .padding()
                                .background(Color.adaptiveSurface, in: RoundedRectangle(cornerRadius: 12))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.appBorder, lineWidth: 1)
                                )
                        }
                        
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
                            SecureField("", text: $password, prompt: Text("Nhập mật khẩu (ít nhất 6 ký tự)").foregroundColor(Color.appTextMuted.opacity(0.5)))
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
                        Button(action: handleRegister) {
                            HStack(spacing: 8) {
                                if isLoading {
                                    ProgressView().tint(.white)
                                } else {
                                    Image(systemName: "checkmark.circle.fill")
                                    Text("Đăng ký")
                                }
                            }
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 52)
                            .background(
                                LinearGradient.pinkGradient,
                                in: RoundedRectangle(cornerRadius: 14, style: .continuous)
                            )
                            .shadow(color: Color.appPink.opacity(0.3), radius: 12, x: 0, y: 6)
                        }
                        .disabled(isLoading || email.isEmpty || password.count < 6 || name.isEmpty)
                        .padding(.horizontal, 32)
                        
                        // Gợi ý nếu nút bị khóa
                        if name.isEmpty || email.isEmpty || password.count < 6 {
                            Text("Vui lòng nhập đủ Tên, Email và Mật khẩu ≥ 6 ký tự")
                                .font(.caption2)
                                .foregroundStyle(Color.appTextMuted)
                                .padding(.top, 4)
                        }

                        Button(action: {
                            dismiss()
                        }) {
                            Text("Đã có tài khoản? **Đăng nhập**")
                                .font(.subheadline)
                                .foregroundStyle(Color.adaptiveText)
                                .padding(.vertical, 8)
                                .contentShape(Rectangle())
                        }
                    }
                    .padding(.top, 10)
                    
                    Spacer()
                }
            }
        }
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button(action: { dismiss() }) {
                    Image(systemName: "chevron.left")
                        .foregroundStyle(Color.adaptiveText)
                        .padding(8)
                        .background(Color.adaptiveSurface, in: Circle())
                }
            }
        }
    }
    
    private func handleRegister() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                try await authService.register(name: name, email: email, password: password)
            } catch {
                errorMessage = "Đăng ký thất bại. Email có thể đã tồn tại."
                isLoading = false
            }
        }
    }
}
