-- Migration: 20250128000012_audit_logs_table
-- Description: 監査ログテーブルの作成（パーティション対応）
-- 作成日: 2025-01-28

-- =================================================================
-- 監査ログテーブル（パーティション対応）
-- =================================================================

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

-- 月次パーティションの例（2025年1月）
CREATE TABLE IF NOT EXISTS public.audit_logs_2025_01 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- 月次パーティションの例（2025年2月）
CREATE TABLE IF NOT EXISTS public.audit_logs_2025_02 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- 月次パーティションの例（2025年3月）
CREATE TABLE IF NOT EXISTS public.audit_logs_2025_03 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- インデックス
CREATE INDEX IF NOT EXISTS idx_audit_logs_2025_01_time ON public.audit_logs_2025_01 (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_2025_01_actor ON public.audit_logs_2025_01 (actor_id, created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_2025_02_time ON public.audit_logs_2025_02 (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_2025_02_actor ON public.audit_logs_2025_02 (actor_id, created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_2025_03_time ON public.audit_logs_2025_03 (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_2025_03_actor ON public.audit_logs_2025_03 (actor_id, created_at);
