-- Migration: 20250902000006_idea_versions_table
-- Description: アイデアバージョンテーブルの作成（販売中Y版管理に特化）
-- 作成日: 2025-09-02

-- =================================================================
-- アイデアバージョンテーブル（販売中Y版管理）
-- =================================================================

CREATE TABLE IF NOT EXISTS public.idea_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
    price INTEGER NOT NULL CHECK (price >= 0), -- 販売価格
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_versions_idea ON public.idea_versions(idea_id);
CREATE INDEX IF NOT EXISTS idx_versions_price ON public.idea_versions(price);
CREATE INDEX IF NOT EXISTS idx_versions_created_at ON public.idea_versions(created_at DESC);

-- 更新時刻自動更新トリガー
DROP TRIGGER IF EXISTS trg_versions_updated_at ON public.idea_versions;
CREATE TRIGGER trg_versions_updated_at
    BEFORE UPDATE ON public.idea_versions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
