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
