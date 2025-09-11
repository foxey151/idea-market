-- Migration: 20250902000009_audit_logs_table
-- Description: 監査ログテーブルの作成（月次パーティション自動作成対応）
-- 作成日: 2025-09-02

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

-- 月次パーティションの作成（2025年9月）
CREATE TABLE IF NOT EXISTS public.audit_logs_2025_09 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');

-- 月次パーティション自動作成関数
CREATE OR REPLACE FUNCTION public.create_monthly_partition()
RETURNS void AS $$
DECLARE
    partition_name TEXT;
    start_date DATE;
    end_date DATE;
BEGIN
    -- 翌月のパーティションを作成
    start_date := date_trunc('month', CURRENT_DATE + INTERVAL '1 month');
    end_date := start_date + INTERVAL '1 month';
    partition_name := 'audit_logs_' || to_char(start_date, 'YYYY_MM');
    
    -- パーティションが存在しない場合のみ作成
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = partition_name
    ) THEN
        EXECUTE format(
            'CREATE TABLE public.%I PARTITION OF public.audit_logs
             FOR VALUES FROM (%L) TO (%L)',
            partition_name, start_date, end_date
        );
        
        -- インデックスも作成
        EXECUTE format(
            'CREATE INDEX %I ON public.%I (created_at)',
            'idx_' || partition_name || '_time', partition_name
        );
        
        EXECUTE format(
            'CREATE INDEX %I ON public.%I (actor_id, created_at)',
            'idx_' || partition_name || '_actor', partition_name
        );
        
        RAISE NOTICE 'Created partition: %', partition_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 月次パーティション自動作成のスケジュール設定（cron等で実行）
-- SELECT cron.schedule('create-audit-partition', '0 0 1 * *', 'SELECT public.create_monthly_partition();');

-- インデックス（2025年9月パーティション）
CREATE INDEX IF NOT EXISTS idx_audit_logs_2025_09_time ON public.audit_logs_2025_09 (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_2025_09_actor ON public.audit_logs_2025_09 (actor_id, created_at);
