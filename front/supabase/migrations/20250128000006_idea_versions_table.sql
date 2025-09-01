-- Migration: 20250128000006_idea_versions_table
-- Description: アイデアバージョンテーブルの作成（X版/Y版）
-- 作成日: 2025-01-28

-- =================================================================
-- アイデアバージョンテーブル（X版/Y版）
-- =================================================================

CREATE TABLE IF NOT EXISTS public.idea_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
    type public.version_type NOT NULL, -- 'X' or 'Y'
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    body TEXT, -- Y版で必須（アプリ側で検証）
    price INTEGER CHECK (price >= 0), -- Y版で必須
    is_public BOOLEAN NOT NULL DEFAULT false, -- X=true, Y=false
    purchase_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 制約: 1つのアイデアに対してX版、Y版それぞれ1つまで
    UNIQUE(idea_id, type)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_versions_idea_type ON public.idea_versions(idea_id, type);
CREATE INDEX IF NOT EXISTS idx_versions_public ON public.idea_versions(is_public);
CREATE INDEX IF NOT EXISTS idx_versions_created_at ON public.idea_versions(created_at DESC);

-- 全文検索用インデックス
CREATE INDEX IF NOT EXISTS idx_versions_title_trgm ON public.idea_versions USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_versions_summary_trgm ON public.idea_versions USING GIN (summary gin_trgm_ops);

-- 更新時刻自動更新トリガー
DROP TRIGGER IF EXISTS trg_versions_updated_at ON public.idea_versions;
CREATE TRIGGER trg_versions_updated_at
    BEFORE UPDATE ON public.idea_versions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
