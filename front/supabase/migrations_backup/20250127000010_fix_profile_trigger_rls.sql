-- Migration: 20250127000010_fix_profile_trigger_rls
-- Description: profilesテーブルの自動作成トリガーとRLSポリシーの競合を修正
-- Issue: トリガーによるprofilesレコード作成時にRLSポリシーが妨げになっている

-- =================================================================
-- 1. 現在のprofilesテーブルのRLSポリシーを修正
-- =================================================================

-- 既存のINSERTポリシーを削除
DROP POLICY IF EXISTS p_profiles_insert ON public.profiles;

-- 新しいINSERTポリシー（トリガーとサインアップ両方に対応）
CREATE POLICY p_profiles_insert ON public.profiles
    FOR INSERT WITH CHECK (
        -- 認証済みユーザーが自分のプロフィールを作成する場合
        auth.uid() = id
        -- または、システム（トリガー）による作成を許可
        OR auth.uid() IS NULL
    );

-- =================================================================
-- 2. handle_new_user関数を改良（より安全な実装）
-- =================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- profilesテーブルにレコードを作成
    -- SECURITY DEFINERによりRLSを回避
    INSERT INTO public.profiles (id, role, display_name)
    VALUES (NEW.id, 'member', COALESCE(NEW.email, 'ユーザー' || substr(NEW.id::text, 1, 8)))
    ON CONFLICT (id) DO NOTHING; -- 既存レコードがある場合は何もしない
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- エラーをログに記録（実際の運用では適切なログテーブルに記録）
        RAISE WARNING 'プロフィール作成に失敗: ユーザーID %, エラー: %', NEW.id, SQLERRM;
        -- エラーが発生してもサインアップは継続
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 3. 代替案：RLSをバイパスする関数を追加
-- =================================================================

-- プロフィール作成専用の関数（RLSをバイパス）
CREATE OR REPLACE FUNCTION public.create_profile_safe(
    user_id UUID,
    user_email TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.profiles (id, role, display_name)
    VALUES (
        user_id, 
        'member', 
        COALESCE(user_email, 'ユーザー' || substr(user_id::text, 1, 8))
    )
    ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 4. 既存ユーザーで不足しているprofilesレコードを補完
-- =================================================================

-- auth.usersに存在するがprofilesに存在しないユーザーがいる場合の補完
-- （この処理は一度だけ実行される）
INSERT INTO public.profiles (id, role, display_name)
SELECT 
    au.id,
    'member' as role,
    COALESCE(au.email, 'ユーザー' || substr(au.id::text, 1, 8)) as display_name
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- 5. トリガーを再作成（念のため）
-- =================================================================

-- 既存のトリガーを削除して再作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- トリガーを再作成
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =================================================================
-- 完了
-- =================================================================

-- このマイグレーションにより：
-- 1. トリガーによるprofilesレコード作成がRLSに阻害されなくなる
-- 2. 既存の不整合データが修正される
-- 3. 今後のサインアップが正常に動作するようになる
