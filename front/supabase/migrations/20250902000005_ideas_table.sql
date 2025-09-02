-- Migration: 20250902000005_ideas_table
-- Description: アイデアテーブルの作成（改善版）
-- 作成日: 2025-09-02

-- =================================================================
-- アイデアテーブル
-- =================================================================

CREATE TABLE IF NOT EXISTS public.ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mmb_no TEXT NOT NULL UNIQUE, -- MMB-2509020001
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    attachments TEXT[] NOT NULL DEFAULT '{}', -- ファイルパス配列
    deadline TIMESTAMPTZ NOT NULL, -- 募集締切日時（必須化）
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('overdue', 'published', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_ideas_author ON public.ideas(author_id);
CREATE INDEX IF NOT EXISTS idx_ideas_mmb_no ON public.ideas(mmb_no);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON public.ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_deadline ON public.ideas(deadline);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON public.ideas(status);

-- 全文検索用インデックス
CREATE INDEX IF NOT EXISTS idx_ideas_title_trgm ON public.ideas USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_ideas_summary_trgm ON public.ideas USING GIN (summary gin_trgm_ops);

-- 更新時刻自動更新トリガー
DROP TRIGGER IF EXISTS trg_ideas_updated_at ON public.ideas;
CREATE TRIGGER trg_ideas_updated_at
    BEFORE UPDATE ON public.ideas
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- MMB番号自動生成トリガー
CREATE OR REPLACE FUNCTION public.set_mmb_no()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.mmb_no IS NULL OR NEW.mmb_no = '' THEN
        NEW.mmb_no := public.generate_mmb_no();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ideas_set_mmb_no ON public.ideas;
CREATE TRIGGER trg_ideas_set_mmb_no
    BEFORE INSERT ON public.ideas
    FOR EACH ROW EXECUTE FUNCTION public.set_mmb_no();
