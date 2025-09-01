-- Migration: 20250128000018_fix_comments_rls_policy
-- Description: コメントのRLSポリシーを修正して期限切れ・完成アイデアでも表示可能にする
-- 作成日: 2025-01-28

-- =================================================================
-- コメントテーブルのRLSポリシーを修正
-- =================================================================

-- 既存のコメント読み取りポリシーを削除
DROP POLICY IF EXISTS "Anyone can view comments on published ideas" ON public.comments;

-- 新しいポリシーを作成（published, overdue, completedアイデアのコメントを表示可能に）
CREATE POLICY "Anyone can view comments on public ideas" ON public.comments
    FOR SELECT USING (
        idea_id IN (
            SELECT id FROM public.ideas WHERE status IN ('published', 'overdue', 'completed')
        )
    );

-- 既存のコメント投稿ポリシーを削除
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;

-- 新しいコメント投稿ポリシーを作成（publishedアイデアのみに投稿可能）
CREATE POLICY "Authenticated users can create comments on published ideas" ON public.comments
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        idea_id IN (
            SELECT id FROM public.ideas WHERE status = 'published'
        )
    );

-- ポリシー確認用クエリ（コメントアウト）
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies 
-- WHERE tablename = 'comments' 
-- ORDER BY policyname;
