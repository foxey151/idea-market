-- Migration: 20250902000004_mmb_counters_table
-- Description: MMB番号管理テーブルの作成
-- 作成日: 2025-09-02

-- =================================================================
-- MMB番号管理テーブル
-- =================================================================

CREATE TABLE IF NOT EXISTS public.mmb_counters (
    seq_date DATE PRIMARY KEY,
    last_no INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MMB番号生成関数
CREATE OR REPLACE FUNCTION public.generate_mmb_no()
RETURNS TEXT AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
    seq_no INTEGER;
    mmb_no TEXT;
BEGIN
    -- 今日の日付でカウンターを更新または挿入
    INSERT INTO public.mmb_counters (seq_date, last_no, updated_at)
    VALUES (today_date, 1, NOW())
    ON CONFLICT (seq_date)
    DO UPDATE SET
        last_no = public.mmb_counters.last_no + 1,
        updated_at = NOW()
    RETURNING last_no INTO seq_no;
    
    -- MMB番号を生成（MMB-YYMMDNNNN形式）
    mmb_no := 'MMB-' || to_char(today_date, 'YYMMDD') || lpad(seq_no::text, 4, '0');
    
    RETURN mmb_no;
END;
$$ LANGUAGE plpgsql;
