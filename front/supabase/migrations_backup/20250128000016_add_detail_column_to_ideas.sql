-- Migration: 20250128000016_add_detail_column_to_ideas
-- Description: ideasテーブルにdetailカラムを追加
-- 作成日: 2025-01-28

-- =================================================================
-- ideasテーブルにdetailカラムを追加
-- =================================================================

-- detailカラムを追加
-- summaryは概要（短い説明）、detailは詳細（長い説明）として使い分け
ALTER TABLE public.ideas 
ADD COLUMN detail TEXT;

-- detailカラムにコメントを追加
COMMENT ON COLUMN public.ideas.detail IS 'アイデアの詳細説明（最終アイデア作成時に使用）';

-- 既存のsummaryカラムにもコメントを追加（明確にするため）
COMMENT ON COLUMN public.ideas.summary IS 'アイデアの概要（短い説明）';

-- 全文検索用インデックスをdetailカラムにも追加
CREATE INDEX IF NOT EXISTS idx_ideas_detail_trgm ON public.ideas USING GIN (detail gin_trgm_ops);

-- 確認用クエリ（コメントアウト）
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'ideas' AND table_schema = 'public'
-- ORDER BY ordinal_position;
