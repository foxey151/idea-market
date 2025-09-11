-- Migration: 20250902000008_purchases_table
-- Description: 購入履歴テーブルの作成（改善版）
-- 作成日: 2025-09-02

-- =================================================================
-- 購入履歴テーブル
-- =================================================================

CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE, -- idea_version_idから変更
    amount INTEGER NOT NULL,
    invoice_url TEXT, -- 請求書URL
    status public.purchase_status NOT NULL DEFAULT 'succeeded',
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON public.purchases(buyer_id, paid_at);
CREATE INDEX IF NOT EXISTS idx_purchases_idea ON public.purchases(idea_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_paid_at ON public.purchases(paid_at DESC);

-- 制約: 同じユーザーが同じアイデアを重複購入できない
ALTER TABLE public.purchases ADD CONSTRAINT unique_buyer_idea UNIQUE (buyer_id, idea_id);
