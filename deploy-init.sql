-- PHẦN 1: DỌN DẸP VÀ CÀI ĐẶT CƠ BẢN
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS story_lines CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS reading_questions CASCADE;
DROP TABLE IF EXISTS reading_passages CASCADE;
DROP TABLE IF EXISTS vocabularies CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS stories CASCADE;
DROP TABLE IF EXISTS languages CASCADE;
DROP TABLE IF EXISTS writing_prompts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- PHẦN 2: TẠO CÁC BẢNG CỐT LÕI
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    flag VARCHAR(50)
);

CREATE TABLE writing_prompts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    task_type VARCHAR(100),
    is_published INT DEFAULT 1
);

CREATE TABLE stories (
    id SERIAL PRIMARY KEY,
    language_id INT REFERENCES languages(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    title_vi VARCHAR(255),
    is_published INT DEFAULT 1
);

CREATE TABLE story_lines (
    id SERIAL PRIMARY KEY,
    story_id INT REFERENCES stories(id) ON DELETE CASCADE,
    line_order INT DEFAULT 0,
    text_en TEXT,
    text_vi TEXT
);

-- PHẦN 3: PHÂN QUYỀN (QUAN TRỌNG CHO RENDER)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon nologin;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- PHẦN 4: NẠP DỮ LIỆU MẪU
INSERT INTO languages (name, code, flag) VALUES
('English', 'en', '🇺🇸'),
('Chinese', 'zh', '🇨🇳');

INSERT INTO stories (language_id, title, title_vi) VALUES
(1, 'A Sunny Day', 'Một ngày nắng đẹp'),
(2, '快乐的一天', 'Một ngày vui vẻ');

INSERT INTO story_lines (story_id, line_order, text_en, text_vi) VALUES
(1, 1, 'Today is a sunny day.', 'Hôm nay là một ngày nắng đẹp.'),
(2, 1, '今天天气很好。', 'Hôm nay thời tiết rất đẹp.');

INSERT INTO writing_prompts (title, prompt, task_type) VALUES
('Giới thiệu bản thân', 'Hãy viết một đoạn văn ngắn giới thiệu về mình.', 'Writing'),
('我的周末', 'Hãy mô tả về cuối tuần của bạn bằng tiếng Trung.', 'Writing');
