-- =============================================
-- PROGRESS TRACKING SYSTEM
-- =============================================

-- 1. Bảng theo dõi hoạt động hàng ngày
CREATE TABLE IF NOT EXISTS daily_activity (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    lessons_completed INT DEFAULT 0,
    stories_completed INT DEFAULT 0,
    quizzes_completed INT DEFAULT 0,
    total_minutes INT DEFAULT 0,
    words_typed INT DEFAULT 0,
    avg_accuracy INT DEFAULT 0,
    avg_wpm INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, activity_date)
);

-- 2. Bảng lưu thành tựu (achievements)
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL,  -- 'first_lesson', 'streak_7', 'accuracy_90', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_type)
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON daily_activity TO web_anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON achievements TO web_anon;
GRANT USAGE, SELECT ON SEQUENCE daily_activity_id_seq TO web_anon;
GRANT USAGE, SELECT ON SEQUENCE achievements_id_seq TO web_anon;

-- 3. Function: Ghi nhận hoạt động (upsert - nếu đã có hôm nay thì cộng dồn)
CREATE OR REPLACE FUNCTION record_activity(
    p_user_id INT,
    p_type VARCHAR,       -- 'lesson', 'story', 'quiz'
    p_accuracy INT DEFAULT 0,
    p_wpm INT DEFAULT 0,
    p_words_typed INT DEFAULT 0,
    p_minutes INT DEFAULT 0
) RETURNS JSON AS $$
DECLARE
    result daily_activity;
BEGIN
    INSERT INTO daily_activity (user_id, activity_date, lessons_completed, stories_completed, quizzes_completed, total_minutes, words_typed, avg_accuracy, avg_wpm)
    VALUES (
        p_user_id,
        CURRENT_DATE,
        CASE WHEN p_type = 'lesson' THEN 1 ELSE 0 END,
        CASE WHEN p_type = 'story' THEN 1 ELSE 0 END,
        CASE WHEN p_type = 'quiz' THEN 1 ELSE 0 END,
        p_minutes,
        p_words_typed,
        p_accuracy,
        p_wpm
    )
    ON CONFLICT (user_id, activity_date) DO UPDATE SET
        lessons_completed = daily_activity.lessons_completed + CASE WHEN p_type = 'lesson' THEN 1 ELSE 0 END,
        stories_completed = daily_activity.stories_completed + CASE WHEN p_type = 'story' THEN 1 ELSE 0 END,
        quizzes_completed = daily_activity.quizzes_completed + CASE WHEN p_type = 'quiz' THEN 1 ELSE 0 END,
        total_minutes = daily_activity.total_minutes + p_minutes,
        words_typed = daily_activity.words_typed + p_words_typed,
        avg_accuracy = (daily_activity.avg_accuracy + p_accuracy) / 2,
        avg_wpm = CASE WHEN p_wpm > 0 THEN (daily_activity.avg_wpm + p_wpm) / 2 ELSE daily_activity.avg_wpm END
    RETURNING * INTO result;

    RETURN json_build_object(
        'id', result.id,
        'activity_date', result.activity_date,
        'lessons_completed', result.lessons_completed,
        'stories_completed', result.stories_completed,
        'quizzes_completed', result.quizzes_completed,
        'total_minutes', result.total_minutes,
        'words_typed', result.words_typed,
        'avg_accuracy', result.avg_accuracy,
        'avg_wpm', result.avg_wpm
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function: Lấy thống kê tổng hợp của user
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id INT)
RETURNS JSON AS $$
DECLARE
    total_lessons_done INT;
    total_stories_done INT;
    total_quizzes_done INT;
    total_words INT;
    total_time INT;
    overall_accuracy INT;
    overall_wpm INT;
    current_streak INT;
    longest_streak INT;
    weekly_data JSON;
BEGIN
    -- Tổng hợp từ bảng user_progress
    SELECT 
        COALESCE(COUNT(DISTINCT lesson_id), 0),
        COALESCE(COUNT(DISTINCT story_id), 0)
    INTO total_lessons_done, total_stories_done
    FROM user_progress WHERE user_id = p_user_id;

    -- Tổng hợp từ bảng daily_activity
    SELECT
        COALESCE(SUM(quizzes_completed), 0),
        COALESCE(SUM(words_typed), 0),
        COALESCE(SUM(total_minutes), 0),
        COALESCE(AVG(NULLIF(avg_accuracy, 0))::INT, 0),
        COALESCE(AVG(NULLIF(avg_wpm, 0))::INT, 0)
    INTO total_quizzes_done, total_words, total_time, overall_accuracy, overall_wpm
    FROM daily_activity WHERE user_id = p_user_id;

    -- Tính streak hiện tại (chuỗi ngày liên tiếp tính từ hôm nay)
    WITH ordered_dates AS (
        SELECT activity_date,
               activity_date - (ROW_NUMBER() OVER (ORDER BY activity_date DESC))::INT AS grp
        FROM daily_activity 
        WHERE user_id = p_user_id
        ORDER BY activity_date DESC
    ),
    streaks AS (
        SELECT grp, COUNT(*) as streak_length, MAX(activity_date) as last_date
        FROM ordered_dates
        GROUP BY grp
    )
    SELECT COALESCE(
        (SELECT streak_length FROM streaks 
         WHERE last_date >= CURRENT_DATE - INTERVAL '1 day'
         ORDER BY last_date DESC LIMIT 1), 0
    ) INTO current_streak;

    -- Longest streak
    WITH ordered_dates AS (
        SELECT activity_date,
               activity_date - (ROW_NUMBER() OVER (ORDER BY activity_date))::INT AS grp
        FROM daily_activity 
        WHERE user_id = p_user_id
    )
    SELECT COALESCE(MAX(cnt), 0) INTO longest_streak
    FROM (SELECT COUNT(*) as cnt FROM ordered_dates GROUP BY grp) sub;

    -- Dữ liệu 7 ngày gần nhất
    SELECT json_agg(day_data ORDER BY d) INTO weekly_data
    FROM (
        SELECT 
            d,
            COALESCE(da.lessons_completed, 0) + COALESCE(da.stories_completed, 0) + COALESCE(da.quizzes_completed, 0) as activities,
            COALESCE(da.total_minutes, 0) as minutes,
            COALESCE(da.words_typed, 0) as words
        FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') AS d
        LEFT JOIN daily_activity da ON da.activity_date = d AND da.user_id = p_user_id
    ) day_data;

    RETURN json_build_object(
        'total_lessons', total_lessons_done,
        'total_stories', total_stories_done,
        'total_quizzes', total_quizzes_done,
        'total_words_typed', total_words,
        'total_minutes', total_time,
        'avg_accuracy', overall_accuracy,
        'avg_wpm', overall_wpm,
        'current_streak', current_streak,
        'longest_streak', longest_streak,
        'weekly_activity', weekly_data
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute
GRANT EXECUTE ON FUNCTION record_activity(INT, VARCHAR, INT, INT, INT, INT) TO web_anon;
GRANT EXECUTE ON FUNCTION get_user_stats(INT) TO web_anon;
