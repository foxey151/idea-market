-- Migration: 20250128000015_fix_rls_policies
-- Description: RLSポリシーの修正とアイデア取得の問題解決
-- 作成日: 2025-01-28

-- =================================================================
-- RLSポリシーの修正
-- =================================================================

-- まず既存の問題のあるポリシーを削除
DROP POLICY IF EXISTS "Anyone can view published ideas" ON public.ideas;
DROP POLICY IF EXISTS "Users can manage their own ideas" ON public.ideas;
DROP POLICY IF EXISTS "Users can view other profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view comments on published ideas" ON public.comments;

-- =================================================================
-- プロファイルテーブルのRLSポリシー（修正版）
-- =================================================================

-- すべてのプロファイルは読み取り可能（JOINのため、匿名ユーザーも含む）
CREATE POLICY "Anyone can view profiles" ON public.profiles
    FOR SELECT USING (true);

-- =================================================================
-- アイデアテーブルのRLSポリシー（修正版）
-- =================================================================

-- 公開されたアイデアは誰でも読み取り可能（匿名ユーザーも含む）
CREATE POLICY "Anyone can view published ideas" ON public.ideas
    FOR SELECT USING (status = 'published');

-- 認証されたユーザーは自分のアイデアを管理可能
CREATE POLICY "Authenticated users can manage their own ideas" ON public.ideas
    FOR ALL USING (auth.uid() IS NOT NULL AND author_id = auth.uid());

-- 認証されたユーザーはアイデアを作成可能
CREATE POLICY "Authenticated users can create ideas" ON public.ideas
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

-- =================================================================
-- コメントテーブルのRLSポリシー（修正版）
-- =================================================================

-- 公開されたアイデアのコメントは誰でも読み取り可能（匿名ユーザーも含む）
CREATE POLICY "Anyone can view comments on published ideas" ON public.comments
    FOR SELECT USING (
        idea_id IN (
            SELECT id FROM public.ideas WHERE status = 'published'
        )
    );

-- =================================================================
-- RLSを一時的に無効化（開発環境でのテスト用）
-- 本番環境では削除してください
-- =================================================================

-- 開発環境でのデバッグのため、一時的にRLSを無効化
-- 本番環境では以下の行をコメントアウトしてください
-- ALTER TABLE public.ideas DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;

-- =================================================================
-- コメント集計用のビューを作成（パフォーマンス向上のため）
-- =================================================================

-- アイデアとコメント数を結合するビューを作成
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

-- =================================================================
-- 関数を作成してアイデア一覧を取得
-- =================================================================

-- アイデア一覧取得関数（RLSを考慮）
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

-- ユーザーのアイデア取得関数
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
