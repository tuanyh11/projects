import SwiftUI

// MARK: - Color Palette (Travel & Youthful) — Dark Mode Adaptive
extension Color {
    // Helper to create adaptive colors (Light / Dark)
    private static func adaptive(light: UIColor, dark: UIColor) -> Color {
        Color(UIColor { $0.userInterfaceStyle == .dark ? dark : light })
    }
    
    // MARK: Backgrounds
    static let appBg = adaptive(
        light: UIColor(red: 253/255, green: 248/255, blue: 245/255, alpha: 1), // FDF8F5
        dark:  UIColor(red: 18/255,  green: 18/255,  blue: 20/255,  alpha: 1)  // Deep charcoal
    )
    static let appSurface = adaptive(
        light: .white,
        dark:  UIColor(red: 30/255, green: 30/255, blue: 34/255, alpha: 1)     // Elevated dark
    )
    static let appSurface2 = adaptive(
        light: UIColor(red: 255/255, green: 239/255, blue: 230/255, alpha: 1), // FFEFE6
        dark:  UIColor(red: 42/255,  green: 42/255,  blue: 48/255,  alpha: 1)  // Slightly lighter
    )
    static let appBorder = adaptive(
        light: UIColor(red: 255/255, green: 224/255, blue: 209/255, alpha: 1), // FFE0D1
        dark:  UIColor(red: 60/255,  green: 60/255,  blue: 67/255,  alpha: 1)  // Subtle border
    )
    
    // MARK: Accent colors (Same in both modes for brand consistency)
    static let appAccent     = Color(hex: "FF6B35") // Vibrant Orange (Sunset)
    static let appBlue       = Color(hex: "2D9CDB") // Sky Blue (Ocean)
    static let appGreen      = Color(hex: "27AE60") // Lush Green (Nature)
    static let appYellow     = Color(hex: "F2C94C") // Sunny Yellow
    
    // MARK: Text colors
    static let appText = adaptive(
        light: UIColor(red: 45/255,  green: 52/255,  blue: 54/255,  alpha: 1), // 2D3436
        dark:  UIColor(red: 240/255, green: 240/255, blue: 245/255, alpha: 1)  // Near-white
    )
    static let appTextMuted = adaptive(
        light: UIColor(red: 99/255,  green: 110/255, blue: 114/255, alpha: 1), // 636E72
        dark:  UIColor(red: 160/255, green: 165/255, blue: 170/255, alpha: 1)  // Soft gray
    )
    static let appPink       = Color(hex: "EB5757") // Coral red
    
    // Adaptive aliases (kept for backward compatibility with Login/Register)
    static var adaptiveBg: Color { appBg }
    static var adaptiveSurface: Color { appSurface }
    static var adaptiveText: Color { appText }
    
    // Aliases for compatibility
    static let appGold       = appYellow
    static let appTeal       = appGreen

    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r, g, b: Double
        switch hex.count {
        case 6:
            r = Double((int >> 16) & 0xFF) / 255
            g = Double((int >> 8) & 0xFF) / 255
            b = Double(int & 0xFF) / 255
        default:
            r = 1; g = 1; b = 1
        }
        self.init(red: r, green: g, blue: b)
    }
}

// MARK: - Gradients (Tropical & Adventure)
extension LinearGradient {
    static let sunsetGradient = LinearGradient(
        colors: [Color(hex: "FF6B35"), Color(hex: "F78154")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    static let oceanGradient = LinearGradient(
        colors: [Color(hex: "2D9CDB"), Color(hex: "56CCF2")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    static let tropicalGradient = LinearGradient(
        colors: [Color(hex: "27AE60"), Color(hex: "6FCF97")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    static let accentGradient = sunsetGradient
    static let tealGradient = oceanGradient
    static let goldGradient = LinearGradient(
        colors: [Color(hex: "F2C94C"), Color(hex: "F2994A")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    static let pinkGradient = LinearGradient(
        colors: [Color(hex: "EB5757"), Color(hex: "F2994A")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
}

// MARK: - Difficulty Badge
struct DifficultyBadge: View {
    let difficulty: String

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: difficultyIcon)
                .font(.system(size: 10, weight: .bold))
            Text(difficulty)
                .font(.system(size: 10, weight: .bold))
                .textCase(.uppercase)
                .tracking(0.8)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(difficultyColor.opacity(0.15))
        .foregroundStyle(difficultyColor)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
    
    private var difficultyColor: Color {
        switch difficulty.lowercased() {
        case "beginner": return .appGreen
        case "intermediate": return .appBlue
        case "advanced": return .appAccent
        default: return .appTextMuted
        }
    }
    
    private var difficultyIcon: String {
        switch difficulty.lowercased() {
        case "beginner": return "leaf.fill"
        case "intermediate": return "map.fill"
        case "advanced": return "mountain.2.fill"
        default: return "circle.fill"
        }
    }
}

// MARK: - Card (Playful & Soft)
struct GlassCard<Content: View>: View {
    let content: Content
    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }
    var body: some View {
        content
            .padding(18)
            .background(
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .fill(Color.appSurface)
                    .shadow(color: Color.appAccent.opacity(0.08), radius: 15, x: 0, y: 8)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .stroke(Color.appBorder.opacity(0.5), lineWidth: 1)
            )
    }
}

// MARK: - Shimmer Loading
struct ShimmerView: View {
    @State private var phase: CGFloat = 0

    var body: some View {
        RoundedRectangle(cornerRadius: 24, style: .continuous)
            .fill(Color.appSurface2)
            .overlay(
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [.clear, .white.opacity(0.5), .clear],
                            startPoint: .leading, endPoint: .trailing
                        )
                    )
                    .offset(x: phase)
            )
            .clipped()
            .onAppear {
                withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                    phase = 400
                }
            }
    }
}

// MARK: - Empty State
struct EmptyStateView: View {
    let icon: String
    let title: String
    let subtitle: String

    var body: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color.appSurface2)
                    .frame(width: 80, height: 80)
                Image(systemName: icon)
                    .font(.system(size: 32))
                    .foregroundStyle(Color.appAccent)
            }
            Text(title)
                .font(.system(.headline, design: .rounded))
            Text(subtitle)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(40)
    }
}

// MARK: - Stat Box
struct StatBox: View {
    let value: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: 6) {
            Text(value)
                .font(.system(size: 22, weight: .heavy, design: .rounded))
                .foregroundStyle(color)
            Text(label)
                .font(.system(size: 10, weight: .bold))
                .textCase(.uppercase)
                .foregroundStyle(.secondary)
                .tracking(0.5)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(Color.appSurface, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .shadow(color: color.opacity(0.1), radius: 10, x: 0, y: 5)
    }
}

// MARK: - Stat View (Header)
struct StatView: View {
    let title: String
    let value: String
    let color: Color

    var body: some View {
        VStack(spacing: 2) {
            Text(title)
                .font(.system(size: 10, weight: .bold))
                .foregroundStyle(.secondary)
                .textCase(.uppercase)
            Text(value)
                .font(.system(size: 16, weight: .heavy, design: .rounded))
                .foregroundStyle(color)
        }
    }
}

// MARK: - Rich Text View (Typing)
struct RichTextView: View {
    let target: String
    let typed: String

    var body: some View {
        var text = Text("")
        let targetChars = Array(target)
        let typedChars = Array(typed)

        for (i, char) in targetChars.enumerated() {
            if i < typedChars.count {
                text = text + Text(String(char))
                    .font(.system(size: 28, weight: .bold, design: .monospaced))
                    .foregroundStyle(Color.appText)
            } else if i == typedChars.count {
                text = text + Text(String(char))
                    .font(.system(size: 28, weight: .regular, design: .monospaced))
                    .foregroundColor(Color.appAccent)
                    .underline()
            } else {
                text = text + Text(String(char))
                    .font(.system(size: 28, weight: .regular, design: .monospaced))
                    .foregroundColor(Color.appTextMuted.opacity(0.3))
            }
        }

        return text
            .multilineTextAlignment(.leading)
            .lineSpacing(10)
    }
}
