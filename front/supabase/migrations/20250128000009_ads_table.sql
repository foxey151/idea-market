-- Migration: 20250128000009_ads_table
-- Description: 広告管理テーブルの作成
-- 作成日: 2025-01-28
-- DISABLED: 広告機能を無効化

-- =================================================================
-- 広告管理テーブル（コメントアウト）
-- =================================================================

/*
CREATE TABLE IF NOT EXISTS public.ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT NOT NULL,
    target_keywords TEXT[] NOT NULL,
    active_from TIMESTAMPTZ NOT NULL,
    active_to TIMESTAMPTZ NOT NULL,
    priority INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_ads_active ON public.ads(active_from, active_to);
CREATE INDEX IF NOT EXISTS idx_ads_keywords ON public.ads USING GIN (target_keywords);
CREATE INDEX IF NOT EXISTS idx_ads_priority ON public.ads(priority DESC);

-- 更新時刻自動更新トリガー
DROP TRIGGER IF EXISTS trg_ads_updated_at ON public.ads;
CREATE TRIGGER trg_ads_updated_at
    BEFORE UPDATE ON public.ads
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
*/
