-- Migration: 20251220000002_remove_logout_at_and_set_timezone
-- Description: logout_atカラムの削除とタイムゾーンをTokyoに設定
-- 作成日: 2025-12-20

-- =================================================================
-- タイムゾーンをTokyoに設定
-- =================================================================

-- セッションのタイムゾーンをAsia/Tokyoに設定
SET timezone = 'Asia/Tokyo';

-- =================================================================
-- logout_atカラムの削除
-- =================================================================

-- 既存のビューと関数を削除（依存関係があるため）
DROP VIEW IF EXISTS public.login_history_admin CASCADE;
DROP FUNCTION IF EXISTS public.get_login_history_admin(TIMESTAMPTZ, TIMESTAMPTZ) CASCADE;

-- logout_atカラムを削除
ALTER TABLE public.login_history DROP COLUMN IF EXISTS logout_at;

-- =================================================================
-- 関数とビューの再作成（logout_atを除く）
-- =================================================================

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
    login_at TEXT,
    created_at TEXT
) 
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
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
        to_char(lh.login_at AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD HH24:MI:SS') AS login_at,
        to_char(lh.created_at AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD HH24:MI:SS') AS created_at
    FROM public.login_history lh
    LEFT JOIN public.profiles p ON lh.user_id = p.id
    LEFT JOIN auth.users u ON p.id = u.id
    WHERE (p_start_date IS NULL OR lh.login_at >= p_start_date)
      AND (p_end_date IS NULL OR lh.login_at <= p_end_date)
    ORDER BY lh.login_at DESC;
END;
$$;

-- 関数への実行権限を付与
GRANT EXECUTE ON FUNCTION public.get_login_history_admin(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

-- ビューも作成（後方互換性のため、関数の結果を返すビュー）
CREATE VIEW public.login_history_admin AS
SELECT * FROM public.get_login_history_admin();

-- =================================================================
-- コメントの更新
-- =================================================================

COMMENT ON COLUMN public.login_history.login_at IS 'ログイン日時（Asia/Tokyoタイムゾーン）';
COMMENT ON VIEW public.login_history_admin IS 'ログイン履歴の詳細ビュー（adminページ用、Asia/Tokyoタイムゾーン）';

