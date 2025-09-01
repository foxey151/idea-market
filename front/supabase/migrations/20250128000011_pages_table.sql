-- Migration: 20250128000011_pages_table
-- Description: CMSページ管理テーブルの作成
-- 作成日: 2025-01-28

-- =================================================================
-- CMSページ管理テーブル
-- =================================================================

CREATE TABLE IF NOT EXISTS public.pages (
    slug TEXT PRIMARY KEY, -- 'legal'|'company'|'tech' など
    content JSONB NOT NULL, -- WYSIWYG 出力
    draft BOOLEAN NOT NULL DEFAULT false,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_pages_draft ON public.pages(draft);
CREATE INDEX IF NOT EXISTS idx_pages_updated_by ON public.pages(updated_by);

-- 更新時刻自動更新トリガー
DROP TRIGGER IF EXISTS trg_pages_updated_at ON public.pages;
CREATE TRIGGER trg_pages_updated_at
    BEFORE UPDATE ON public.pages
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
