-- Migration: Add deadline column to ideas table
-- Add deadline field for idea submission deadlines
-- Created: 2025-01-27

BEGIN;

-- ideasテーブルにdeadlineカラムを追加
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;

-- deadlineに関するコメント
COMMENT ON COLUMN public.ideas.deadline IS 'アイデアの締切日時（任意）';

-- deadlineカラムのインデックスを作成（検索効率のため）
CREATE INDEX IF NOT EXISTS idx_ideas_deadline ON public.ideas(deadline) WHERE deadline IS NOT NULL;

-- 変更をコミット
COMMIT;

-- 変更後のテーブル構造:
-- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
-- author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
-- cmt_no TEXT NOT NULL UNIQUE
-- title TEXT NOT NULL
-- summary TEXT NOT NULL
-- detail TEXT
-- deadline TIMESTAMPTZ
-- status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published'))
-- created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
