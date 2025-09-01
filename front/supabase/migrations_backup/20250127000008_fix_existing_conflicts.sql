-- Migration: 20250127000008_fix_existing_conflicts
-- Description: 既存テーブル・型との競合を回避するための修正
-- Note: このマイグレーションは既存の003〜007マイグレーションの代替として実行

-- =================================================================
-- 1. 残りのビジネステーブルを安全に作成
-- =================================================================

-- 購入履歴テーブル
CREATE TABLE IF NOT EXISTS public.purchases (
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

CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON public.purchases(buyer_id, paid_at);

-- 広告管理テーブル
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

CREATE INDEX IF NOT EXISTS idx_ads_active ON public.ads(active_from, active_to);
CREATE INDEX IF NOT EXISTS idx_ads_keywords ON public.ads USING GIN (target_keywords);

DROP TRIGGER IF EXISTS trg_ads_updated_at ON public.ads;
CREATE TRIGGER trg_ads_updated_at
    BEFORE UPDATE ON public.ads
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 広告計測テーブル
CREATE TABLE IF NOT EXISTS public.ad_metrics (
    id BIGSERIAL PRIMARY KEY,
    ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
    user_id UUID, -- null=未ログイン
    event TEXT NOT NULL CHECK (event IN ('impression', 'click')),
    ip INET,
    ua TEXT,
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_metrics ON public.ad_metrics(ad_id, event, ts);

-- CMSページ管理テーブル
CREATE TABLE IF NOT EXISTS public.pages (
    slug TEXT PRIMARY KEY, -- 'legal'|'company'|'tech' など
    content JSONB NOT NULL, -- WYSIWYG 出力
    draft BOOLEAN NOT NULL DEFAULT false,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_pages_updated_at ON public.pages;
CREATE TRIGGER trg_pages_updated_at
    BEFORE UPDATE ON public.pages
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 監査ログテーブル（パーティション対応）
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL,
    actor_id UUID,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 月次パーティション（存在チェック付き）
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'audit_logs_2025_01' AND n.nspname = 'public'
    ) THEN
        CREATE TABLE public.audit_logs_2025_01 PARTITION OF public.audit_logs
            FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'audit_logs_2025_02' AND n.nspname = 'public'
    ) THEN
        CREATE TABLE public.audit_logs_2025_02 PARTITION OF public.audit_logs
            FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_audit_logs_2025_01_time ON public.audit_logs_2025_01 (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_2025_02_time ON public.audit_logs_2025_02 (created_at);

-- =================================================================
-- 2. 検索用インデックス
-- =================================================================

CREATE INDEX IF NOT EXISTS idx_ideas_title_trgm ON public.ideas USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_ideas_summary_trgm ON public.ideas USING GIN (summary gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_comments_text_trgm ON public.comments USING GIN (text gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_versions_body_trgm ON public.idea_versions USING GIN (body gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_ideas_status_created ON public.ideas(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_versions_public_type_created ON public.idea_versions(is_public, type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_versions_purchase_count ON public.idea_versions(purchase_count DESC);

-- =================================================================
-- 3. サンプルデータ（CMSページのみ）
-- =================================================================

INSERT INTO public.pages (slug, content, draft) VALUES (
    'terms',
    '{
        "title": "利用規約",
        "content": "<h1>利用規約</h1><p>アイデアマーケットの利用規約をここに記載します。</p><h2>第1条 目的</h2><p>本規約は、当サービスの利用条件を定めるものです。</p>",
        "last_updated": "2025-01-27"
    }',
    false
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.pages (slug, content, draft) VALUES (
    'privacy',
    '{
        "title": "プライバシーポリシー",
        "content": "<h1>プライバシーポリシー</h1><p>個人情報の取り扱いについて説明します。</p><h2>収集する情報</h2><p>当サービスでは以下の情報を収集します。</p>",
        "last_updated": "2025-01-27"
    }',
    false
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.pages (slug, content, draft) VALUES (
    'company',
    '{
        "title": "会社情報",
        "content": "<h1>会社情報</h1><p>株式会社アイデアマーケット</p><p>所在地：東京都...</p><p>設立：2025年</p>",
        "last_updated": "2025-01-27"
    }',
    false
) ON CONFLICT (slug) DO NOTHING;

-- pg_trgm 設定
DO $$
BEGIN
    -- 類似度の閾値を設定（デフォルト0.3 -> 0.2に下げて検索しやすくする）
    PERFORM set_limit(0.2);
    
    -- 確認用
    RAISE NOTICE 'pg_trgm similarity limit set to: %', show_limit();
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'pg_trgm configuration skipped: %', SQLERRM;
END $$;
