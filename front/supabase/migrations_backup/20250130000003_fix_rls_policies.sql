-- Migration: 20250130000003_fix_rls_policies
-- Description: ブログ閲覧数テーブルのRLSポリシー修正
-- 作成日: 2025-01-30

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "blog_view_counts_update_policy" ON public.blog_view_counts;

-- システムトリガーが更新できるようにポリシーを修正
CREATE POLICY "blog_view_counts_update_policy" ON public.blog_view_counts
    FOR UPDATE USING (true)
    WITH CHECK (true);

-- システムトリガーが挿入できるようにポリシーを追加
CREATE POLICY "blog_view_counts_insert_policy" ON public.blog_view_counts
    FOR INSERT WITH CHECK (true);
