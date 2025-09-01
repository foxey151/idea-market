-- =================================================================
-- ステータス制約を修正してoverdueを追加するSQL
-- =================================================================

-- 現在の制約を確認
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'public.ideas'::regclass 
AND conname LIKE '%status%';

-- 既存のステータス制約を削除
ALTER TABLE public.ideas DROP CONSTRAINT IF EXISTS ideas_status_check;

-- 新しい制約を追加（overdueを含む）
ALTER TABLE public.ideas 
ADD CONSTRAINT ideas_status_check 
CHECK (status IN ('draft', 'published', 'closed', 'overdue'));

-- 制約が正しく追加されたか確認
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'public.ideas'::regclass 
AND conname LIKE '%status%';
