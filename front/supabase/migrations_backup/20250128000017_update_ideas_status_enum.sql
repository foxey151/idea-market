-- Migration: 20250128000017_update_ideas_status_enum
-- Description: ideasテーブルのstatusをpublished, overdue, completedに変更
-- 作成日: 2025-01-28

-- =================================================================
-- ideasテーブルのステータス制約を更新
-- =================================================================

-- 既存のステータス制約を削除
ALTER TABLE public.ideas DROP CONSTRAINT IF EXISTS ideas_status_check;

-- 新しいステータス制約を追加
-- published: 公開中（議論中）
-- overdue: 期限切れ（最終アイデア作成可能）
-- completed: 完成（最終アイデア作成済み）
ALTER TABLE public.ideas 
ADD CONSTRAINT ideas_status_check 
CHECK (status IN ('published', 'overdue', 'completed'));

-- 既存の'draft'と'closed'ステータスのアイデアを'published'に変更
-- 注意: 実際のデータに応じて調整してください
UPDATE public.ideas 
SET status = 'published' 
WHERE status IN ('draft', 'closed');

-- statusカラムにコメントを追加
COMMENT ON COLUMN public.ideas.status IS 'アイデアのステータス: published(公開中), overdue(期限切れ), completed(完成)';

-- 確認用クエリ（コメントアウト）
-- SELECT status, COUNT(*) as count
-- FROM public.ideas 
-- GROUP BY status
-- ORDER BY status;

-- 制約確認クエリ（コメントアウト）
-- SELECT conname, consrc 
-- FROM pg_constraint 
-- WHERE conrelid = 'public.ideas'::regclass 
-- AND conname LIKE '%status%';
