-- Migration: 20251220000001_create_login_and_blog_view_history_tables
-- Description: ログイン履歴とブログ閲覧履歴テーブルの作成（adminページのログ出力機能用）
-- 作成日: 2025-12-20

-- =================================================================
-- ENUM型の定義
-- =================================================================

-- ログインステータス
DO $$ BEGIN
    CREATE TYPE public.login_status AS ENUM ('success', 'failed', 'logout');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =================================================================
-- ログイン履歴テーブル
-- =================================================================

CREATE TABLE IF NOT EXISTS public.login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    login_status public.login_status NOT NULL DEFAULT 'success',
    ip_address INET, -- IPアドレス
    user_agent TEXT, -- User-Agent
    failure_reason TEXT, -- ログイン失敗の理由（NULL可能）
    login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- ログイン日時
    logout_at TIMESTAMPTZ, -- ログアウト日時（NULL可能）
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =================================================================
-- ブログ閲覧履歴テーブル（既存のblog_viewsを拡張）
-- =================================================================

-- 既存のblog_viewsテーブルは既に存在しているため、そのまま使用
-- adminページでログ出力するために、必要に応じてビューを作成

-- ログイン履歴の詳細ビュー（admin用）
-- auth.usersテーブルへのアクセスが必要なため、関数として実装
CREATE OR REPLACE FUNCTION public.get_login_history_admin(
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    user_display_name TEXT,
    user_email VARCHAR(255),
    login_status public.login_status,
    ip_address INET,
    user_agent TEXT,
    failure_reason TEXT,
    login_at TIMESTAMPTZ,
    logout_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lh.id,
        lh.user_id,
        p.display_name AS user_display_name,
        u.email AS user_email,
        lh.login_status,
        lh.ip_address,
        lh.user_agent,
        lh.failure_reason,
        lh.login_at,
        lh.logout_at,
        lh.created_at
    FROM public.login_history lh
    LEFT JOIN public.profiles p ON lh.user_id = p.id
    LEFT JOIN auth.users u ON p.id = u.id
    WHERE (p_start_date IS NULL OR lh.login_at >= p_start_date)
      AND (p_end_date IS NULL OR lh.login_at <= p_end_date)
    ORDER BY lh.login_at DESC;
END;
$$;

-- ブログ閲覧履歴の詳細ビュー（admin用）
-- auth.usersテーブルへのアクセスが必要なため、関数として実装
CREATE OR REPLACE FUNCTION public.get_blog_view_history_admin(
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    blog_id TEXT,
    user_id UUID,
    user_display_name TEXT,
    user_email VARCHAR(255),
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    view_date DATE,
    created_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bv.id,
        bv.blog_id,
        bv.user_id,
        p.display_name AS user_display_name,
        u.email AS user_email,
        bv.session_id,
        bv.ip_address,
        bv.user_agent,
        bv.view_date,
        bv.created_at
    FROM public.blog_views bv
    LEFT JOIN public.profiles p ON bv.user_id = p.id
    LEFT JOIN auth.users u ON p.id = u.id
    WHERE (p_start_date IS NULL OR bv.created_at >= p_start_date)
      AND (p_end_date IS NULL OR bv.created_at <= p_end_date)
    ORDER BY bv.created_at DESC;
END;
$$;

-- 関数への実行権限を付与
GRANT EXECUTE ON FUNCTION public.get_login_history_admin(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_blog_view_history_admin(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

-- 既存のビューを削除（存在する場合）
DROP VIEW IF EXISTS public.login_history_admin CASCADE;
DROP VIEW IF EXISTS public.blog_view_history_admin CASCADE;

-- ビューも作成（後方互換性のため、関数の結果を返すビュー）
CREATE VIEW public.login_history_admin AS
SELECT * FROM public.get_login_history_admin();

CREATE VIEW public.blog_view_history_admin AS
SELECT * FROM public.get_blog_view_history_admin();

-- =================================================================
-- インデックス
-- =================================================================

-- ログイン履歴テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON public.login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_login_at ON public.login_history(login_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_login_status ON public.login_history(login_status);
CREATE INDEX IF NOT EXISTS idx_login_history_ip_address ON public.login_history(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_history_user_id_login_at ON public.login_history(user_id, login_at DESC);

-- 複合インデックス（よく使われるクエリパターン用）
CREATE INDEX IF NOT EXISTS idx_login_history_status_date ON public.login_history(login_status, login_at DESC);

-- =================================================================
-- RLS (Row Level Security) ポリシー
-- =================================================================

ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "login_history_select_policy" ON public.login_history;
DROP POLICY IF EXISTS "login_history_insert_policy" ON public.login_history;
DROP POLICY IF EXISTS "login_history_admin_select_policy" ON public.login_history;

-- ユーザーは自分のログイン履歴のみ閲覧可能
CREATE POLICY "login_history_select_policy" ON public.login_history
    FOR SELECT USING (auth.uid() = user_id);

-- ログイン履歴の挿入は誰でも可能（認証システムから記録）
CREATE POLICY "login_history_insert_policy" ON public.login_history
    FOR INSERT WITH CHECK (true);

-- 管理者はすべてのログイン履歴を閲覧可能
CREATE POLICY "login_history_admin_select_policy" ON public.login_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ビューへのアクセス権限（管理者のみ）
-- ビューはベーステーブルのRLSポリシーを継承するため、追加のポリシーは不要
-- ただし、auth.usersテーブルへのアクセスが必要なため、サービスロールで実行するか、
-- ビューをSECURITY DEFINERで作成する必要がある場合がある

-- =================================================================
-- コメント
-- =================================================================

COMMENT ON TABLE public.login_history IS 'ログイン履歴テーブル（adminページのログ出力機能用）';
COMMENT ON COLUMN public.login_history.user_id IS 'ログインしたユーザーID（NULLの場合は匿名ユーザー）';
COMMENT ON COLUMN public.login_history.login_status IS 'ログインステータス（success: 成功, failed: 失敗, logout: ログアウト）';
COMMENT ON COLUMN public.login_history.ip_address IS 'IPアドレス';
COMMENT ON COLUMN public.login_history.user_agent IS 'User-Agent';
COMMENT ON COLUMN public.login_history.failure_reason IS 'ログイン失敗の理由（NULLの場合は成功）';
COMMENT ON COLUMN public.login_history.login_at IS 'ログイン日時';
COMMENT ON COLUMN public.login_history.logout_at IS 'ログアウト日時（NULLの場合はログアウトしていない）';

COMMENT ON VIEW public.login_history_admin IS 'ログイン履歴の詳細ビュー（adminページ用）';
COMMENT ON VIEW public.blog_view_history_admin IS 'ブログ閲覧履歴の詳細ビュー（adminページ用）';

