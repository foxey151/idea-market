-- Migration: 20250127000013_fix_missing_profiles
-- Description: 不足しているprofilesレコードを補完し、今後の自動作成を確実にする
-- Issue: auth.usersに存在するがprofilesに存在しないユーザーがいるため外部キー制約エラーが発生

-- =================================================================
-- 1. 不足しているprofilesレコードを補完
-- =================================================================

-- auth.usersに存在するがprofilesに存在しないユーザーを補完
INSERT INTO public.profiles (id, role, display_name, created_at, updated_at)
SELECT 
    au.id,
    'member'::public.role as role,
    COALESCE(
        NULLIF(au.email, ''), 
        'ユーザー' || substr(au.id::text, 1, 8)
    ) as display_name,
    COALESCE(au.created_at, NOW()) as created_at,
    NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- 2. handle_new_user関数の改良（より確実な実装）
-- =================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- profilesテーブルにレコードを作成
    INSERT INTO public.profiles (id, role, display_name, created_at, updated_at)
    VALUES (
        NEW.id, 
        'member'::public.role, 
        COALESCE(
            NULLIF(NEW.email, ''), 
            'ユーザー' || substr(NEW.id::text, 1, 8)
        ),
        COALESCE(NEW.created_at, NOW()),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        -- 既存レコードがある場合は更新
        display_name = COALESCE(
            NULLIF(NEW.email, ''), 
            'ユーザー' || substr(NEW.id::text, 1, 8)
        ),
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- エラーをログに記録
        RAISE WARNING 'プロフィール作成/更新に失敗: ユーザーID %, エラー: %', NEW.id, SQLERRM;
        -- エラーが発生してもサインアップは継続
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 3. トリガーの確実な設置
-- =================================================================

-- 既存のトリガーを削除して再作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 新しいトリガーを作成
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 既存ユーザーの更新時にもプロファイルを更新するトリガー
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =================================================================
-- 4. プロフィール作成用の安全な関数
-- =================================================================

-- 手動でプロフィールを作成する関数（アプリから呼び出し可能）
CREATE OR REPLACE FUNCTION public.ensure_profile_exists(
    user_id UUID,
    user_email TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.profiles (id, role, display_name, created_at, updated_at)
    VALUES (
        user_id, 
        'member'::public.role, 
        COALESCE(
            NULLIF(user_email, ''), 
            'ユーザー' || substr(user_id::text, 1, 8)
        ),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        display_name = COALESCE(
            NULLIF(user_email, ''), 
            'ユーザー' || substr(user_id::text, 1, 8)
        ),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 関数に実行権限を付与
GRANT EXECUTE ON FUNCTION public.ensure_profile_exists(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_profile_exists(UUID, TEXT) TO anon;

-- =================================================================
-- 5. 確認用クエリ（コメントアウト）
-- =================================================================

-- 補完結果の確認
-- SELECT 
--     (SELECT COUNT(*) FROM auth.users) as total_users,
--     (SELECT COUNT(*) FROM public.profiles) as total_profiles,
--     (SELECT COUNT(*) FROM auth.users au LEFT JOIN public.profiles p ON au.id = p.id WHERE p.id IS NULL) as missing_profiles;
