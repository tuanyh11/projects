import SwiftUI

struct HomeView: View {
    @State private var userName = AuthService.shared.currentUser?.name ?? "Bạn"
    @State private var totalLessons = 0
    @State private var totalStories = 0
    @State private var streak = 0  // PostgREST doesn't easily compute streak without custom RPC, so we mock or calculate simple version.

    @State private var dailyChallenge: WritingPrompt?
    @State private var recentLanguage: Language?
    @State private var isLoading = true

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 28) {
                    // Header
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Hi \(userName)!")
                                .font(.largeTitle.weight(.bold))
                        }

                    }
                    .padding(.horizontal)
                    .padding(.top, 8)

                    if isLoading {
                        ProgressView()
                            .padding(.top, 50)
                    } else {
                        // Stats
                        HStack(spacing: 12) {
                            StatBox(value: "\(streak)", label: "Chuỗi ngày", color: .appAccent)
                            StatBox(value: "\(totalLessons)", label: "Bài học", color: .appBlue)
                            StatBox(value: "\(totalStories)", label: "Ký sự", color: .appGreen)
                        }
                        .padding(.horizontal)

                        // Learning Journey Section
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Tiến trình học tập")
                                .font(.system(.headline, design: .rounded).weight(.bold))
                                .padding(.horizontal)

                            GlassCard {
                                VStack(spacing: 12) {
                                    HStack {
                                        VStack(alignment: .leading, spacing: 4) {
                                            Text("Tiến độ tổng quát")
                                                .font(.subheadline.weight(.semibold))
                                            Text("Bạn đang đi rất đúng hướng!")
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                        }
                                        Spacer()
                                        Image(systemName: "airplane")
                                            .font(.title2)
                                            .foregroundStyle(Color.appAccent)
                                    }

                                    let progressValue = Double(totalLessons + totalStories) / 50.0  // Giả sử mục tiêu là 50
                                    ProgressView(value: min(progressValue, 1.0))
                                        .tint(Color.appAccent)
                                        .background(Color.appSurface2)
                                        .clipShape(Capsule())

                                    HStack {
                                        Text("\(Int(progressValue * 100))% hoàn thành")
                                            .font(.caption2.weight(.bold))
                                            .foregroundStyle(Color.appAccent)
                                        Spacer()
                                        Text("Mục tiêu: 50 trạm")
                                            .font(.caption2)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                            }
                            .padding(.horizontal)
                        }
                        .padding(.top, 8)

                        // Continue Learning
                        if let recentLang = recentLanguage {
                            VStack(alignment: .leading, spacing: 12) {
                                HStack {
                                    Image(systemName: "map.fill")
                                        .font(.title3)
                                        .foregroundStyle(Color.appAccent)
                                    Text("Tiếp tục hành trình")
                                        .font(.system(.headline, design: .rounded))
                                }
                                .padding(.horizontal)

                                NavigationLink(
                                    destination: LanguageHubView(
                                        languageId: recentLang.id, languageName: recentLang.name,
                                        languageCode: recentLang.code)
                                ) {
                                    GlassCard {
                                        HStack(spacing: 14) {
                                            ZStack {
                                                Circle()
                                                    .fill(LinearGradient.accentGradient)
                                                    .frame(width: 52, height: 52)
                                                Image(systemName: "globe")
                                                    .font(.title3)
                                                    .foregroundStyle(.white)
                                            }

                                            VStack(alignment: .leading, spacing: 6) {
                                                Text(recentLang.name)
                                                    .font(.subheadline.weight(.semibold))

                                                Text("Tiếp tục hành trình học \(recentLang.name)")
                                                    .font(.caption)
                                                    .foregroundStyle(.secondary)
                                            }
                                            Spacer()
                                            Image(systemName: "chevron.right")
                                                .font(.caption.weight(.semibold))
                                                .foregroundStyle(.quaternary)
                                        }
                                    }
                                }
                                .buttonStyle(.plain)
                                .padding(.horizontal)
                            }
                        }

                        // Daily Challenge
                        if let challenge = dailyChallenge {
                            VStack(alignment: .leading, spacing: 12) {
                                HStack {
                                    Image(systemName: "star.circle.fill")
                                        .font(.title3)
                                        .foregroundStyle(Color.appGold)
                                    Text("Thử thách hôm nay")
                                        .font(.headline)
                                }
                                .padding(.horizontal)

                                GlassCard {
                                    HStack(spacing: 14) {
                                        ZStack {
                                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                                .fill(LinearGradient.goldGradient)
                                                .frame(width: 52, height: 52)
                                            Image(systemName: "pencil.line")
                                                .font(.title3)
                                                .foregroundStyle(.white)
                                        }

                                        VStack(alignment: .leading, spacing: 6) {
                                            Text(challenge.title)
                                                .font(.subheadline.weight(.semibold))
                                            Text(challenge.prompt)
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                                .lineLimit(2)
                                            if let diff = challenge.difficulty {
                                                DifficultyBadge(difficulty: diff)
                                                    .padding(.top, 2)
                                            }
                                        }
                                        Spacer()
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                    }
                }
                .padding(.bottom, 100)
            }
            .background(Color.appBg.ignoresSafeArea())
            .navigationBarHidden(true)
            .task {
                await loadRealData()
            }
        }
    }

    private func loadRealData() async {
        guard let userId = AuthService.shared.currentUser?.id else { return }

        do {
            async let progressTask = APIService.shared.fetchUserProgress(userId: userId)
            async let promptsTask = APIService.shared.fetchWritingPrompts()
            async let languagesTask = APIService.shared.fetchLanguages()

            let (progressList, promptsList, languagesList) = try await (
                progressTask, promptsTask, languagesTask
            )

            // Calculate stats
            let lessons = progressList.filter { $0.lessonId != nil }
            let stories = progressList.filter { $0.storyId != nil }

            self.totalLessons = lessons.count
            self.totalStories = stories.count

            // Calculate pseudo streak based on unique days
            let dates = progressList.compactMap { $0.completedAt?.prefix(10) }
            self.streak = Set(dates).count

            // Random or latest daily challenge
            if let firstPrompt = promptsList.first {
                self.dailyChallenge = firstPrompt
            }

            // "Tiếp tục học" based on most recent activity or random language
            // Since we don't store languageId in user_progress easily, we can just suggest the first available language
            if let firstLanguage = languagesList.first {
                self.recentLanguage = firstLanguage
            }

            self.isLoading = false

        } catch {
            print("Error loading home data: \(error)")
            self.isLoading = false
        }
    }
}

#Preview {
    HomeView()
}
