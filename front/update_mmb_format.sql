-- MMB番号生成関数を新フォーマットに更新
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
    
    -- MMB番号を生成（MMB-YYMMDNNNN形式 - ハイフン1個削除）
    mmb_no := 'MMB-' || to_char(today_date, 'YYMMDD') || lpad(seq_no::text, 4, '0');
    
    RETURN mmb_no;
END;
$$ LANGUAGE plpgsql;
