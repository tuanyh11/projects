-- 1. Tạo role anon cho truy cập công khai (nếu chưa có)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon nologin;
  END IF;
END $$;

-- 2. Cấp quyền cho role anon truy cập vào schema public
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon; -- Cho phép app thao tác dữ liệu
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon; -- Cần thiết cho SERIAL ID

-- 3. Cấp quyền thực thi các function (nếu có)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
-- Enable pgcrypto for hashing passwords
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- JWT type for PostgREST
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    flag VARCHAR(50),
    description TEXT,
    total_lessons INT DEFAULT 0,
    total_students INT DEFAULT 0,
    level VARCHAR(50),
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    language_id INT REFERENCES languages(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    level VARCHAR(50),
    "order" INT DEFAULT 0,
    duration INT DEFAULT 0,
    is_published INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vocabularies (
    id SERIAL PRIMARY KEY,
    lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
    word VARCHAR(255) NOT NULL,
    pronunciation VARCHAR(255),
    translation VARCHAR(255),
    example TEXT,
    part_of_speech VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stories (
    id SERIAL PRIMARY KEY,
    language_id INT REFERENCES languages(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    title_vi VARCHAR(255),
    category VARCHAR(100),
    category_vi VARCHAR(100),
    difficulty VARCHAR(50),
    total_lines INT DEFAULT 0,
    total_words INT DEFAULT 0,
    is_published INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE story_lines (
    id SERIAL PRIMARY KEY,
    story_id INT REFERENCES stories(id) ON DELETE CASCADE,
    line_order INT DEFAULT 0,
    text_en TEXT,
    text_vi TEXT,
    words_json JSONB
);

CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    story_id INT REFERENCES stories(id) ON DELETE CASCADE,
    lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
    wpm INT DEFAULT 0,
    accuracy INT DEFAULT 0,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE writing_prompts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    task_type VARCHAR(100),
    category VARCHAR(100),
    difficulty VARCHAR(50),
    time_limit_minutes INT DEFAULT 0,
    min_words INT DEFAULT 0,
    max_words INT DEFAULT 0,
    tips TEXT,
    sample_outline TEXT,
    is_published INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create login and signup RPC functions
CREATE OR REPLACE FUNCTION signup(
    name VARCHAR,
    email VARCHAR,
    password VARCHAR
) RETURNS JSON
AS $$
DECLARE
    new_user_id INT;
BEGIN
    IF EXISTS (SELECT 1 FROM public.users u WHERE u.email = signup.email) THEN
        RAISE EXCEPTION 'Email already exists';
    END IF;

    INSERT INTO public.users (name, email, password_hash)
    VALUES (signup.name, signup.email, crypt(signup.password, gen_salt('bf')))
    RETURNING id INTO new_user_id;

    RETURN json_build_object(
        'id', new_user_id,
        'name', signup.name,
        'email', signup.email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION login(
    email VARCHAR,
    password VARCHAR
) RETURNS JSON
AS $$
DECLARE
    user_record RECORD;
BEGIN
    SELECT * INTO user_record
    FROM public.users u
    WHERE u.email = login.email;

    IF user_record IS NULL THEN
        RAISE EXCEPTION 'Invalid email or password';
    END IF;

    IF user_record.password_hash = crypt(login.password, user_record.password_hash) THEN
        RETURN json_build_object(
            'id', user_record.id,
            'name', user_record.name,
            'email', user_record.email
        );
    ELSE
        RAISE EXCEPTION 'Invalid email or password';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Setup PostgREST roles and permissions
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'web_anon') THEN
        CREATE ROLE web_anon NOLOGIN;
    END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO web_anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO web_anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO web_anon;

-- Grant execute on RPC functions to web_anon
GRANT EXECUTE ON FUNCTION login(VARCHAR, VARCHAR) TO web_anon;
GRANT EXECUTE ON FUNCTION signup(VARCHAR, VARCHAR, VARCHAR) TO web_anon;

-- app_user is created by Docker, just grant web_anon to it
GRANT web_anon TO app_user;
-- Seed data for languages
INSERT INTO languages (name, code, flag, description, total_lessons, total_students, level, color) VALUES
('Tiếng Anh', 'en-US', '🇺🇸', 'Học tiếng Anh giao tiếp và từ vựng thông dụng.', 10, 1500, 'Cơ bản', '#4a90e2'),
('Tiếng Trung', 'zh-CN', '🇨🇳', 'Học tiếng Trung (Hán ngữ) từ cơ bản đến nâng cao.', 8, 800, 'Mới bắt đầu', '#e74c3c');

-- Seed data for lessons (English)
INSERT INTO lessons (language_id, title, content, level, "order", duration, is_published) VALUES
(1, 'Chào hỏi cơ bản', 'Học cách chào hỏi trong tiếng Anh.', 'Beginner', 1, 10, 1),
(1, 'Gia đình', 'Từ vựng về các thành viên trong gia đình.', 'Beginner', 2, 15, 1);

-- Seed data for vocabularies (English Lesson 1)
INSERT INTO vocabularies (lesson_id, word, pronunciation, translation, example, part_of_speech) VALUES
(1, 'Hello', '/həˈloʊ/', 'Xin chào', 'Hello, how are you?', 'Exclamation'),
(1, 'Goodbye', '/ˌɡʊdˈbaɪ/', 'Tạm biệt', 'Goodbye, see you tomorrow.', 'Exclamation'),
(1, 'Please', '/pliːz/', 'Làm ơn / Vui lòng', 'Can you help me, please?', 'Adverb');

-- Seed data for vocabularies (English Lesson 2)
INSERT INTO vocabularies (lesson_id, word, pronunciation, translation, example, part_of_speech) VALUES
(2, 'Father', '/ˈfɑːðər/', 'Cha', 'My father is a doctor.', 'Noun'),
(2, 'Mother', '/ˈmʌðər/', 'Mẹ', 'My mother is very kind.', 'Noun');

-- Seed data for lessons (Chinese)
INSERT INTO lessons (language_id, title, content, level, "order", duration, is_published) VALUES
(2, '汉语问候', 'Learning basic greetings in Chinese.', 'Beginner', 1, 12, 1);

-- Seed data for vocabularies (Chinese Lesson 1)
INSERT INTO vocabularies (lesson_id, word, pronunciation, translation, example, part_of_speech) VALUES
(3, '你好', 'nǐ hǎo', 'Xin chào', '你好！ (Nǐ hǎo!)', 'Phrase'),
(3, '谢谢', 'xièxie', 'Cảm ơn', '谢谢你！ (Xièxie nǐ!)', 'Verb'),
(3, '再见', 'zàijn', 'Tạm biệt', '老师，再见！ (Lǎoshī, zàijiàn!)', 'Phrase');

-- Seed data for stories
INSERT INTO stories (language_id, title, title_vi, category, category_vi, difficulty, total_lines, total_words, is_published) VALUES
(1, 'A Sunny Day', 'Một ngày nắng đẹp', 'Daily Life', 'Đời sống', 'Easy', 3, 30, 1),
(2, '快乐的一天', 'Một ngày vui vẻ', 'Daily Life', 'Đời sống', 'Beginner', 3, 15, 1);

-- Seed data for story lines (Story 1 - English)
INSERT INTO story_lines (story_id, line_order, text_en, text_vi, words_json) VALUES
(1, 1, 'Today is a sunny day.', 'Hôm nay là một ngày nắng đẹp.', '[{"en": "Today", "vi": "Hôm nay"}, {"en": "is", "vi": "là"}, {"en": "a", "vi": "một"}, {"en": "sunny", "vi": "nắng"}, {"en": "day", "vi": "ngày"}]'),
(1, 2, 'The sky is blue.', 'Bầu trời màu xanh.', '[{"en": "The", "vi": "Cái"}, {"en": "sky", "vi": "bầu trời"}, {"en": "is", "vi": "thì"}, {"en": "blue", "vi": "xanh"}]'),
(1, 3, 'I go to the park.', 'Tôi đi ra công viên.', '[{"en": "I", "vi": "Tôi"}, {"en": "go", "vi": "đi"}, {"en": "to", "vi": "đến"}, {"en": "the", "vi": "cái"}, {"en": "park", "vi": "công viên"}]');

-- Seed data for story lines (Story 2 - Chinese)
INSERT INTO story_lines (story_id, line_order, text_en, text_vi, words_json) VALUES
(2, 1, '今天天气很好。', 'Hôm nay thời tiết rất đẹp.', '[{"en": "今天", "vi": "Hôm nay"}, {"en": "天气", "vi": "thời tiết"}, {"en": "很好", "vi": "rất tốt"}]'),
(2, 2, '我和朋友去公园。', 'Tôi và bạn đi công viên.', '[{"en": "我", "vi": "Tôi"}, {"en": "和", "vi": "và"}, {"en": "朋友", "vi": "bạn bè"}, {"en": "去", "vi": "đi"}, {"en": "公园", "vi": "công viên"}]'),
(2, 3, '我们很高兴。', 'Chúng tôi rất vui.', '[{"en": "我们", "vi": "Chúng tôi"}, {"en": "很", "vi": "rất"}, {"en": "高兴", "vi": "vui vẻ"}]');

-- Seed data for writing prompts
INSERT INTO writing_prompts (title, prompt, task_type, category, difficulty, time_limit_minutes, min_words, max_words, is_published) VALUES
('Giới thiệu bản thân', 'Hãy viết một đoạn văn ngắn giới thiệu về tên, tuổi và sở thích của bạn bằng tiếng Anh.', 'Writing', 'General', 'Easy', 15, 30, 100, 1),
('我的周末', 'Hãy mô tả về cuối tuần của bạn bằng tiếng Trung.', 'Writing', 'General', 'Easy', 20, 20, 80, 1);
