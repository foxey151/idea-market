-- Migration: 20250130000002_fix_blog_views_policies
-- Description: ブログ閲覧数テーブルのポリシー修正
-- 作成日: 2025-01-30

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "blog_views_select_policy" ON public.blog_views;
DROP POLICY IF EXISTS "blog_views_insert_policy" ON public.blog_views;
DROP POLICY IF EXISTS "blog_view_counts_select_policy" ON public.blog_view_counts;
DROP POLICY IF EXISTS "blog_view_counts_update_policy" ON public.blog_view_counts;

-- 新しいポリシーを作成
CREATE POLICY "blog_views_select_policy" ON public.blog_views
    FOR SELECT USING (true);

CREATE POLICY "blog_views_insert_policy" ON public.blog_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "blog_view_counts_select_policy" ON public.blog_view_counts
    FOR SELECT USING (true);

CREATE POLICY "blog_view_counts_update_policy" ON public.blog_view_counts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
        OR current_setting('role') = 'service_role'
    );
