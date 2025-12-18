-- Migration: 20251218000002_change_price_to_integer
-- Description: priceカラムをprice_enumからINTEGERに変更（計算結果の金額をそのまま保存可能にする）
-- 作成日: 2025-12-18

-- =================================================================
-- priceカラムをINTEGER型に変更
-- =================================================================

-- 既存のprice_enum値をINTEGERに変換して一時カラムに保存
ALTER TABLE public.ideas
ADD COLUMN IF NOT EXISTS price_temp INTEGER;

-- price_enumの値をINTEGERに変換
UPDATE public.ideas
SET price_temp = CASE 
    WHEN price::text = '3000' THEN 3000
    WHEN price::text = '5000' THEN 5000
    WHEN price::text = '10000' THEN 10000
    WHEN price::text = '30000' THEN 30000
    WHEN price::text = '50000' THEN 50000
    ELSE NULL
END;

-- 古いpriceカラムを削除
ALTER TABLE public.ideas
DROP COLUMN IF EXISTS price;

-- 一時カラムをpriceにリネーム
ALTER TABLE public.ideas
RENAME COLUMN price_temp TO price;

-- priceカラムにCHECK制約を追加（10000円以上、NULL許可）
ALTER TABLE public.ideas
ADD CONSTRAINT price_min_check CHECK (price IS NULL OR price >= 10000);

-- コメント更新
COMMENT ON COLUMN public.ideas.price IS 'アイデアの販売価格（計算結果の金額をそのまま保存、10000円以上）';

-- インデックスを再作成（INTEGER型用）
DROP INDEX IF EXISTS idx_ideas_price;
CREATE INDEX IF NOT EXISTS idx_ideas_price ON public.ideas(price);
