import SwiftUI

@main
struct LinguaApp: App {
    @StateObject private var authService = AuthService.shared
    @StateObject private var localization = LocalizationService.shared

    var body: some Scene {
        WindowGroup {
            if authService.isAuthenticated {
                ContentView()
                    .environmentObject(localization)
            } else {
                LoginView()
                    .environmentObject(localization)
            }
        }
    }
}

struct ContentView: View {
    @State private var selectedTab = 0
    @EnvironmentObject var localization: LocalizationService

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("tab-home".localized(), systemImage: "house.fill")
                }
                .tag(0)

            LanguagesView()
                .tabItem {
                    Label("tab-languages".localized(), systemImage: "globe")
                }
                .tag(1)

            SettingsView()
                .tabItem {
                    Label("tab-settings".localized(), systemImage: "gearshape")
                }
                .tag(2)
        }
        .tint(Color.appAccent)
    }
}

#Preview {
    ContentView()
        .environmentObject(LocalizationService.shared)
}
