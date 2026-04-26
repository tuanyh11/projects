import SwiftUI

struct ProgressView_Custom: View {
    @State private var stats: UserStats?
    @State private var isLoading = true
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationStack {
            ScrollView {
                if isLoading {
                    VStack(spacing: 16) {
                        ForEach(0..<4, id: \.self) { _ in
                            ShimmerView()
                                .frame(height: 100)
                        }
                    }
                    .padding()
                } else if let stats = stats {
                    VStack(spacing: 24) {
                        // Streak Card
                        streakSection(stats: stats)
                        
                        // Weekly Activity Chart
                        weeklyChartSection(stats: stats)
                        
                        // Overall Stats Grid
                        overallStatsSection(stats: stats)
                        
                        // Detailed Stats
                        detailedStatsSection(stats: stats)
                    }
                    .padding(.bottom, 100)
                } else if let error = errorMessage {
                    EmptyStateView(
                        icon: "exclamationmark.triangle",
                        title: "Lỗi tải dữ liệu",
                        subtitle: error
                    )
                }
            }
            .background(Color.appBg.ignoresSafeArea())
            .navigationTitle("Tiến Độ Học Tập")
            .navigationBarTitleDisplayMode(.large)
            .task {
                await loadStats()
            }
            .refreshable {
                await loadStats()
            }
        }
    }
    
    // MARK: - Streak Section
    private func streakSection(stats: UserStats) -> some View {
        GlassCard {
            HStack(spacing: 20) {
                // Streak Fire
                ZStack {
                    Circle()
                        .fill(
                            stats.currentStreak > 0
                            ? LinearGradient(colors: [Color(hex: "FF6B35"), Color(hex: "F2994A")], startPoint: .top, endPoint: .bottom)
                            : LinearGradient(colors: [Color.appSurface2, Color.appSurface2], startPoint: .top, endPoint: .bottom)
                        )
                        .frame(width: 72, height: 72)
                    
                    VStack(spacing: 2) {
                        Image(systemName: "flame.fill")
                            .font(.system(size: 24))
                            .foregroundStyle(stats.currentStreak > 0 ? .white : Color.appTextMuted)
                        Text("\(stats.currentStreak)")
                            .font(.system(size: 16, weight: .heavy, design: .rounded))
                            .foregroundStyle(stats.currentStreak > 0 ? .white : Color.appTextMuted)
                    }
                }
                
                VStack(alignment: .leading, spacing: 6) {
                    Text(stats.currentStreak > 0 ? "Chuỗi ngày liên tiếp!" : "Bắt đầu chuỗi ngày mới!")
                        .font(.headline)
                        .foregroundStyle(Color.appText)
                    
                    Text(stats.currentStreak > 0
                         ? "Tiếp tục duy trì! Kỷ lục: \(stats.longestStreak) ngày"
                         : "Hãy hoàn thành một bài học hôm nay")
                        .font(.caption)
                        .foregroundStyle(Color.appTextMuted)
                    
                    // Streak dots
                    HStack(spacing: 4) {
                        ForEach(0..<7, id: \.self) { day in
                            Circle()
                                .fill(day < stats.currentStreak
                                      ? Color.appAccent
                                      : Color.appSurface2)
                                .frame(width: 10, height: 10)
                        }
                    }
                    .padding(.top, 2)
                }
                
                Spacer()
            }
        }
        .padding(.horizontal)
        .padding(.top, 8)
    }
    
    // MARK: - Weekly Chart
    private func weeklyChartSection(stats: UserStats) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Hoạt động 7 ngày qua")
                .font(.system(.headline, design: .rounded).weight(.bold))
                .padding(.horizontal)
            
            GlassCard {
                if let weekly = stats.weeklyActivity, !weekly.isEmpty {
                    let maxActivities = max(weekly.map { $0.activities }.max() ?? 1, 1)
                    
                    HStack(alignment: .bottom, spacing: 8) {
                        ForEach(weekly) { day in
                            VStack(spacing: 6) {
                                // Bar
                                RoundedRectangle(cornerRadius: 6)
                                    .fill(
                                        day.activities > 0
                                        ? LinearGradient.sunsetGradient
                                        : LinearGradient(colors: [Color.appSurface2], startPoint: .top, endPoint: .bottom)
                                    )
                                    .frame(
                                        height: max(CGFloat(day.activities) / CGFloat(maxActivities) * 80, 8)
                                    )
                                
                                // Count badge
                                if day.activities > 0 {
                                    Text("\(day.activities)")
                                        .font(.system(size: 10, weight: .heavy, design: .rounded))
                                        .foregroundStyle(Color.appAccent)
                                }
                                
                                // Day label
                                Text(day.dayLabel)
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundStyle(Color.appTextMuted)
                            }
                            .frame(maxWidth: .infinity)
                        }
                    }
                    .frame(height: 130)
                } else {
                    HStack {
                        Spacer()
                        VStack(spacing: 8) {
                            Image(systemName: "chart.bar")
                                .font(.title2)
                                .foregroundStyle(Color.appTextMuted)
                            Text("Chưa có dữ liệu")
                                .font(.caption)
                                .foregroundStyle(Color.appTextMuted)
                        }
                        Spacer()
                    }
                    .frame(height: 100)
                }
            }
            .padding(.horizontal)
        }
    }
    
    // MARK: - Overall Stats
    private func overallStatsSection(stats: UserStats) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Tổng quan")
                .font(.system(.headline, design: .rounded).weight(.bold))
                .padding(.horizontal)
            
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 12),
                GridItem(.flexible(), spacing: 12)
            ], spacing: 12) {
                ProgressStatCard(
                    icon: "book.fill",
                    value: "\(stats.totalLessons)",
                    label: "Bài học",
                    color: .appBlue,
                    gradient: .oceanGradient
                )
                ProgressStatCard(
                    icon: "map.fill",
                    value: "\(stats.totalStories)",
                    label: "Ký sự",
                    color: .appGreen,
                    gradient: .tropicalGradient
                )
                ProgressStatCard(
                    icon: "checkmark.circle.fill",
                    value: "\(stats.totalQuizzes)",
                    label: "Trắc nghiệm",
                    color: .appAccent,
                    gradient: .sunsetGradient
                )
                ProgressStatCard(
                    icon: "flame.fill",
                    value: "\(stats.longestStreak)",
                    label: "Kỷ lục streak",
                    color: .appPink,
                    gradient: .pinkGradient
                )
            }
            .padding(.horizontal)
        }
    }
    
    // MARK: - Detailed Stats
    private func detailedStatsSection(stats: UserStats) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Chi tiết")
                .font(.system(.headline, design: .rounded).weight(.bold))
                .padding(.horizontal)
            
            GlassCard {
                VStack(spacing: 16) {
                    DetailRow(icon: "keyboard", label: "Tổng số từ đã gõ", value: formatNumber(stats.totalWordsTyped), color: .appBlue)
                    Divider()
                    DetailRow(icon: "clock", label: "Thời gian học", value: formatMinutes(stats.totalMinutes), color: .appGreen)
                    Divider()
                    DetailRow(icon: "target", label: "Độ chính xác TB", value: "\(stats.avgAccuracy)%", color: .appAccent)
                    Divider()
                    DetailRow(icon: "gauge.with.dots.needle.33percent", label: "Tốc độ gõ TB", value: "\(stats.avgWpm) WPM", color: .appPink)
                }
            }
            .padding(.horizontal)
        }
    }
    
    // MARK: - Helpers
    private func formatNumber(_ num: Int) -> String {
        if num >= 1000 {
            return String(format: "%.1fk", Double(num) / 1000.0)
        }
        return "\(num)"
    }
    
    private func formatMinutes(_ mins: Int) -> String {
        if mins >= 60 {
            let hours = mins / 60
            let remaining = mins % 60
            return "\(hours)h \(remaining)m"
        }
        return "\(mins) phút"
    }
    
    private func loadStats() async {
        guard let userId = AuthService.shared.currentUser?.id else { 
            errorMessage = "Chưa đăng nhập"
            isLoading = false
            return 
        }
        
        do {
            stats = try await APIService.shared.getUserStats(userId: userId)
            isLoading = false
        } catch {
            print("❌ Error loading stats: \(error)")
            // Fallback: tính từ user_progress
            do {
                let progressList = try await APIService.shared.fetchUserProgress(userId: userId)
                let lessons = Set(progressList.compactMap { $0.lessonId }).count
                let stories = Set(progressList.compactMap { $0.storyId }).count
                let dates = progressList.compactMap { $0.completedAt?.prefix(10) }
                let streak = Set(dates).count
                let avgAcc = progressList.compactMap { $0.accuracy }.reduce(0, +) / max(progressList.count, 1)
                let avgWpm = progressList.compactMap { $0.wpm }.filter { $0 ?? 0 > 0 }.compactMap { $0 }.reduce(0, +) / max(progressList.filter { ($0.wpm ?? 0) > 0 }.count, 1)
                
                stats = UserStats(
                    totalLessons: lessons,
                    totalStories: stories,
                    totalQuizzes: 0,
                    totalWordsTyped: 0,
                    totalMinutes: 0,
                    avgAccuracy: avgAcc,
                    avgWpm: avgWpm,
                    currentStreak: streak,
                    longestStreak: streak,
                    weeklyActivity: nil
                )
                isLoading = false
            } catch {
                errorMessage = "Không thể tải dữ liệu tiến độ"
                isLoading = false
            }
        }
    }
}

// MARK: - Progress Stat Card
struct ProgressStatCard: View {
    let icon: String
    let value: String
    let label: String
    let color: Color
    let gradient: LinearGradient
    
    var body: some View {
        GlassCard {
            VStack(spacing: 12) {
                HStack {
                    ZStack {
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .fill(gradient)
                            .frame(width: 36, height: 36)
                        Image(systemName: icon)
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(.white)
                    }
                    Spacer()
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(value)
                        .font(.system(size: 28, weight: .heavy, design: .rounded))
                        .foregroundStyle(Color.appText)
                    Text(label)
                        .font(.system(size: 11, weight: .bold))
                        .textCase(.uppercase)
                        .tracking(0.5)
                        .foregroundStyle(Color.appTextMuted)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }
}

// MARK: - Detail Row
struct DetailRow: View {
    let icon: String
    let label: String
    let value: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(color)
                .frame(width: 28)
            
            Text(label)
                .font(.subheadline)
                .foregroundStyle(Color.appText)
            
            Spacer()
            
            Text(value)
                .font(.subheadline.weight(.bold))
                .foregroundStyle(color)
        }
    }
}

#Preview {
    ProgressView_Custom()
}
