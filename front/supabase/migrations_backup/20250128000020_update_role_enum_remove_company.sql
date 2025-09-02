-- Migration: 20250128000020_update_role_enum_remove_company
-- Description: roleのENUM型からcompanyを削除し、memberとadminのみにする
-- 作成日: 2025-01-28

-- =================================================================
-- 1. 既存のcompanyロールユーザーをmemberに変更
-- =================================================================

-- company役割のユーザーが存在する場合はmemberに変更
UPDATE public.profiles 
SET role = 'member' 
WHERE role = 'company';

-- =================================================================
-- 2. roleカラムに依存するビューと関数を一時的に削除
-- =================================================================

-- ideas_with_statsビューを削除
DROP VIEW IF EXISTS public.ideas_with_stats;

-- 関連する関数を削除
DROP FUNCTION IF EXISTS public.get_published_ideas(INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.get_user_ideas(UUID, INTEGER, INTEGER);

-- =================================================================
-- 3. roleのENUM型を再作成
-- =================================================================

-- 一時的な新しいENUM型を作成
CREATE TYPE public.role_new AS ENUM ('member', 'admin');

-- デフォルト値制約を一時的に削除
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;

-- profilesテーブルのroleカラムを新しい型に変更
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE public.role_new 
USING role::text::public.role_new;

-- 古いENUM型を削除
DROP TYPE public.role;

-- 新しいENUM型を正式な名前に変更
ALTER TYPE public.role_new RENAME TO role;

-- デフォルト値制約を再設定
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'member';

-- =================================================================
-- 4. ビューと関数を再作成
-- =================================================================

-- ideas_with_statsビューを再作成
CREATE OR REPLACE VIEW public.ideas_with_stats AS
SELECT 
    i.*,
    p.display_name as author_display_name,
    p.role as author_role,
    COALESCE(comment_counts.comment_count, 0) as comment_count
FROM public.ideas i
LEFT JOIN public.profiles p ON i.author_id = p.id
LEFT JOIN (
    SELECT 
        idea_id,
        COUNT(*) as comment_count
    FROM public.comments
    GROUP BY idea_id
) comment_counts ON i.id = comment_counts.idea_id
WHERE i.status = 'published';

-- get_published_ideas関数を再作成
CREATE OR REPLACE FUNCTION public.get_published_ideas(
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    author_id UUID,
    mmb_no TEXT,
    title TEXT,
    summary TEXT,
    attachments TEXT[],
    deadline TIMESTAMPTZ,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    author_display_name TEXT,
    author_role TEXT,
    comment_count BIGINT
) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.author_id,
        i.mmb_no,
        i.title,
        i.summary,
        i.attachments,
        i.deadline,
        i.status,
        i.created_at,
        i.updated_at,
        p.display_name as author_display_name,
        COALESCE(p.role::TEXT, 'member') as author_role,
        COALESCE(comment_counts.comment_count, 0) as comment_count
    FROM public.ideas i
    LEFT JOIN public.profiles p ON i.author_id = p.id
    LEFT JOIN (
        SELECT 
            idea_id,
            COUNT(*) as comment_count
        FROM public.comments
        GROUP BY idea_id
    ) comment_counts ON i.id = comment_counts.idea_id
    WHERE i.status = 'published'
    ORDER BY i.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- get_user_ideas関数を再作成
CREATE OR REPLACE FUNCTION public.get_user_ideas(
    user_id UUID,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    author_id UUID,
    mmb_no TEXT,
    title TEXT,
    summary TEXT,
    attachments TEXT[],
    deadline TIMESTAMPTZ,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    author_display_name TEXT,
    author_role TEXT,
    comment_count BIGINT
) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.author_id,
        i.mmb_no,
        i.title,
        i.summary,
        i.attachments,
        i.deadline,
        i.status,
        i.created_at,
        i.updated_at,
        p.display_name as author_display_name,
        COALESCE(p.role::TEXT, 'member') as author_role,
        COALESCE(comment_counts.comment_count, 0) as comment_count
    FROM public.ideas i
    LEFT JOIN public.profiles p ON i.author_id = p.id
    LEFT JOIN (
        SELECT 
            idea_id,
            COUNT(*) as comment_count
        FROM public.comments
        GROUP BY idea_id
    ) comment_counts ON i.id = comment_counts.idea_id
    WHERE i.author_id = user_id
    ORDER BY i.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- 5. インデックスの再作成（必要に応じて）
-- =================================================================

-- roleインデックスの再作成（DROP IF EXISTSで安全に）
DROP INDEX IF EXISTS idx_profiles_role;
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- =================================================================
-- 6. 関数の更新（新規ユーザー作成時のデフォルト値確認）
-- =================================================================

-- handle_new_user関数はデフォルトで'member'を使用しているので変更不要
-- ただし、念のため関数の存在確認
SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user';
