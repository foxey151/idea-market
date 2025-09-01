-- Migration: 20250127000014_create_test_user
-- Description: テスト用ユーザーの作成
-- Note: 開発環境でのテスト用ユーザーアカウント

-- =================================================================
-- 1. テスト用ユーザーをauth.usersに直接挿入
-- =================================================================

-- テスト用ユーザーの作成
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    aud,
    role
) VALUES (
    '12345678-1234-1234-1234-123456789012'::uuid,
    '00000000-0000-0000-0000-000000000000',
    'test@example.com',
    crypt('password123', gen_salt('bf')), -- パスワードはpassword123
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- 2. テスト用ユーザーのプロフィールを作成
-- =================================================================

INSERT INTO public.profiles (
    id,
    role,
    display_name,
    created_at,
    updated_at
) VALUES (
    '12345678-1234-1234-1234-123456789012'::uuid,
    'member'::public.role,
    'テストユーザー',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    display_name = 'テストユーザー',
    updated_at = NOW();

-- =================================================================
-- 3. 確認用メッセージ
-- =================================================================

SELECT 'Test user created: test@example.com / password123' AS message;
