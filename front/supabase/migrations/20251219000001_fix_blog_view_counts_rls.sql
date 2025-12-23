-- Migration: 20251219000001_fix_blog_view_counts_rls
-- Description: blog_view_countsテーブルのRLSポリシーを修正してトリガー関数が動作するようにする
-- 作成日: 2025-12-19

-- =================================================================
-- トリガー関数の修正（SECURITY DEFINERを追加）
-- =================================================================

-- 閲覧数集計更新関数をSECURITY DEFINERで再作成
-- これにより、関数は関数の所有者（通常はpostgresユーザー）の権限で実行され、RLSをバイパスできる
CREATE OR REPLACE FUNCTION public.update_blog_view_count()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
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

-- =================================================================
-- RLSポリシーの修正
-- =================================================================

-- 既存のUPDATEポリシーを削除
DROP POLICY IF EXISTS "blog_view_counts_update_policy" ON public.blog_view_counts;
DROP POLICY IF EXISTS "blog_view_counts_insert_policy" ON public.blog_view_counts;

-- INSERTポリシーを追加（誰でもINSERT可能）
-- blog_view_countsは統計情報なので、誰でも更新できるようにする
CREATE POLICY "blog_view_counts_insert_policy" ON public.blog_view_counts
    FOR INSERT WITH CHECK (true);

-- UPDATEポリシーを修正（誰でもUPDATE可能）
-- blog_view_countsは統計情報なので、誰でも更新できるようにする
CREATE POLICY "blog_view_counts_update_policy" ON public.blog_view_counts
    FOR UPDATE USING (true);

