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
