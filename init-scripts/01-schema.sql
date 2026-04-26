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
