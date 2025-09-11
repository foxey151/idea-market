-- Migration: 20250911000010_blog_views_tables
-- Description: ブログ記事閲覧数管理テーブルの作成（整理版）
-- 作成日: 2025-09-11

-- =================================================================
-- ブログ記事閲覧数テーブル
-- =================================================================

CREATE TABLE IF NOT EXISTS public.blog_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id TEXT NOT NULL, -- microCMSのブログ記事ID
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- ログインユーザーの場合
    session_id TEXT, -- 匿名ユーザー用のセッションID
    ip_address INET, -- IPアドレス（重複防止用）
    user_agent TEXT, -- ユーザーエージェント
    view_date DATE NOT NULL DEFAULT CURRENT_DATE, -- 閲覧日（重複防止用）
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ブログ記事閲覧数集計テーブル
CREATE TABLE IF NOT EXISTS public.blog_view_counts (
    blog_id TEXT PRIMARY KEY,
    view_count INTEGER NOT NULL DEFAULT 0,
    unique_view_count INTEGER NOT NULL DEFAULT 0, -- ユニーク閲覧数
    last_viewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =================================================================
-- インデックス
-- =================================================================

-- 基本インデックス
CREATE INDEX IF NOT EXISTS idx_blog_views_blog_id ON public.blog_views(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_views_user_id ON public.blog_views(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_views_created_at ON public.blog_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_views_session ON public.blog_views(session_id);
CREATE INDEX IF NOT EXISTS idx_blog_views_date ON public.blog_views(view_date);

-- 重複防止用のユニークインデックス
-- ログインユーザーの日別重複防止
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_views_unique_user_daily
ON public.blog_views(blog_id, user_id, view_date)
WHERE user_id IS NOT NULL;

-- セッションユーザーの日別重複防止
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_views_unique_session_daily
ON public.blog_views(blog_id, session_id, view_date)
WHERE session_id IS NOT NULL AND user_id IS NULL;

-- IPアドレスベースの重複防止（匿名ユーザー向け）
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_views_unique_ip_daily
ON public.blog_views(blog_id, ip_address, view_date)
WHERE user_id IS NULL AND session_id IS NULL;

-- 集計テーブル用インデックス
CREATE INDEX IF NOT EXISTS idx_blog_view_counts_view_count ON public.blog_view_counts(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_blog_view_counts_last_viewed ON public.blog_view_counts(last_viewed_at DESC);

-- =================================================================
-- トリガー関数
-- =================================================================

-- 更新時刻自動更新トリガー（既存関数を使用）
DROP TRIGGER IF EXISTS trg_blog_view_counts_updated_at ON public.blog_view_counts;
CREATE TRIGGER trg_blog_view_counts_updated_at
    BEFORE UPDATE ON public.blog_view_counts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 閲覧数集計更新関数
CREATE OR REPLACE FUNCTION public.update_blog_view_count()
RETURNS TRIGGER AS $$
BEGIN
    -- blog_view_countsテーブルを更新
    INSERT INTO public.blog_view_counts (blog_id, view_count, unique_view_count, last_viewed_at)
    VALUES (
        NEW.blog_id,
        1,
        1,
        NEW.created_at
    )
    ON CONFLICT (blog_id)
    DO UPDATE SET
        view_count = blog_view_counts.view_count + 1,
        unique_view_count = (
            SELECT COUNT(DISTINCT COALESCE(user_id::text, session_id, ip_address::text))
            FROM public.blog_views
            WHERE blog_id = NEW.blog_id
        ),
        last_viewed_at = NEW.created_at,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 閲覧数集計更新トリガー
DROP TRIGGER IF EXISTS trg_update_blog_view_count ON public.blog_views;
CREATE TRIGGER trg_update_blog_view_count
    AFTER INSERT ON public.blog_views
    FOR EACH ROW EXECUTE FUNCTION public.update_blog_view_count();

-- =================================================================
-- RLS (Row Level Security) ポリシー
-- =================================================================

ALTER TABLE public.blog_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_view_counts ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "blog_views_select_policy" ON public.blog_views;
DROP POLICY IF EXISTS "blog_views_insert_policy" ON public.blog_views;
DROP POLICY IF EXISTS "blog_view_counts_select_policy" ON public.blog_view_counts;
DROP POLICY IF EXISTS "blog_view_counts_update_policy" ON public.blog_view_counts;

-- 閲覧ログは誰でも閲覧可能（統計目的）
CREATE POLICY "blog_views_select_policy" ON public.blog_views
    FOR SELECT USING (true);

-- 閲覧ログの挿入は誰でも可能
CREATE POLICY "blog_views_insert_policy" ON public.blog_views
    FOR INSERT WITH CHECK (true);

-- 集計テーブルは誰でも閲覧可能
CREATE POLICY "blog_view_counts_select_policy" ON public.blog_view_counts
    FOR SELECT USING (true);

-- 管理者のみ集計テーブルを更新可能（システムトリガーは除く）
CREATE POLICY "blog_view_counts_update_policy" ON public.blog_view_counts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
        OR current_setting('role') = 'service_role'
    );
