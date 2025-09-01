-- Migration: Modify ideas table structure
-- Remove tags and attachments columns, add detail column
-- Created: 2025-01-27

BEGIN;

-- ideasテーブルのカラムを修正
-- 1. detailカラムを追加
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS detail TEXT;

-- 2. tagsカラムを削除
ALTER TABLE public.ideas DROP COLUMN IF EXISTS tags;

-- 3. attachmentsカラムを削除  
ALTER TABLE public.ideas DROP COLUMN IF EXISTS attachments;

-- tagsカラムに関連するインデックスを削除
DROP INDEX IF EXISTS idx_ideas_tags;

-- テーブル構造の変更をコミット
COMMIT;

-- 変更後のテーブル構造:
-- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
-- author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
-- cmt_no TEXT NOT NULL UNIQUE
-- title TEXT NOT NULL
-- summary TEXT NOT NULL
-- detail TEXT
-- status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published'))
-- created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
