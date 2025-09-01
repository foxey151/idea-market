-- Migration: 20250128000010_ad_metrics_table
-- Description: 広告計測テーブルの作成
-- 作成日: 2025-01-28

-- =================================================================
-- 広告計測テーブル
-- =================================================================

CREATE TABLE IF NOT EXISTS public.ad_metrics (
    id BIGSERIAL PRIMARY KEY,
    ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
    user_id UUID, -- null=未ログイン
    event TEXT NOT NULL CHECK (event IN ('impression', 'click')),
    ip INET,
    ua TEXT,
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_ad_metrics_ad_event_ts ON public.ad_metrics(ad_id, event, ts);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_user ON public.ad_metrics(user_id, ts);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_ts ON public.ad_metrics(ts DESC);
