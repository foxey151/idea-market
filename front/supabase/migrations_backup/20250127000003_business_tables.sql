-- Migration: 20250127000003_business_tables
-- Description: ビジネステーブルの作成（idea_versions, purchases, ads, pages, audit_logs）
-- Based on: documents/DB設計書.md

-- =================================================================
-- 1. 最終アイデアバージョンテーブル（X版/Y版）
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_versions_idea_type ON public.idea_versions(idea_id, type);
CREATE INDEX IF NOT EXISTS idx_versions_public ON public.idea_versions(is_public);
CREATE INDEX IF NOT EXISTS idx_versions_title_trgm ON public.idea_versions USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_versions_summary_trgm ON public.idea_versions USING GIN (summary gin_trgm_ops);

-- 更新時刻自動更新トリガー
DROP TRIGGER IF EXISTS trg_versions_updated_at ON public.idea_versions;
CREATE TRIGGER trg_versions_updated_at
    BEFORE UPDATE ON public.idea_versions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =================================================================
-- 2. 購入履歴テーブル
-- =================================================================

CREATE TABLE public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    idea_version_id UUID NOT NULL REFERENCES public.idea_versions(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    invoice_url TEXT,
    status public.purchase_status NOT NULL DEFAULT 'succeeded',
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (buyer_id, idea_version_id)
);

-- インデックス
CREATE INDEX idx_purchases_buyer ON public.purchases(buyer_id, paid_at);

-- =================================================================
-- 3. 広告管理テーブル（コメントアウト）
-- =================================================================

/*
CREATE TABLE public.ads (
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
CREATE INDEX idx_ads_active ON public.ads(active_from, active_to);
CREATE INDEX idx_ads_keywords ON public.ads USING GIN (target_keywords);

-- 更新時刻自動更新トリガー
CREATE TRIGGER trg_ads_updated_at
    BEFORE UPDATE ON public.ads
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
*/

-- =================================================================
-- 4. 広告計測テーブル（コメントアウト）
-- =================================================================

/*
CREATE TABLE public.ad_metrics (
    id BIGSERIAL PRIMARY KEY,
    ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
    user_id UUID, -- null=未ログイン
    event TEXT NOT NULL CHECK (event IN ('impression', 'click')),
    ip INET,
    ua TEXT,
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_ad_metrics ON public.ad_metrics(ad_id, event, ts);
*/

-- =================================================================
-- 5. CMSページ管理テーブル
-- =================================================================

CREATE TABLE public.pages (
    slug TEXT PRIMARY KEY, -- 'legal'|'company'|'tech' など
    content JSONB NOT NULL, -- WYSIWYG 出力
    draft BOOLEAN NOT NULL DEFAULT false,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 更新時刻自動更新トリガー
CREATE TRIGGER trg_pages_updated_at
    BEFORE UPDATE ON public.pages
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =================================================================
-- 6. 監査ログテーブル（パーティション対応）
-- =================================================================

CREATE TABLE public.audit_logs (
    id BIGSERIAL,
    actor_id UUID,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 月次パーティションの例（2025年1月）
CREATE TABLE public.audit_logs_2025_01 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- 月次パーティションの例（2025年2月）
CREATE TABLE public.audit_logs_2025_02 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- インデックス
CREATE INDEX idx_audit_logs_2025_01_time ON public.audit_logs_2025_01 (created_at);
CREATE INDEX idx_audit_logs_2025_02_time ON public.audit_logs_2025_02 (created_at);
