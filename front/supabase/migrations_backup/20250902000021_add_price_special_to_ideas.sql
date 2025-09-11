-- Migration: 20250902000021_add_price_special_to_ideas
-- Description: アイデアテーブルにprice(enum)とspecial(string)カラムを追加
-- 作成日: 2025-09-02

-- =================================================================
-- アイデアテーブルへのカラム追加
-- =================================================================

-- price用のenum型を作成
DO $$ BEGIN
    CREATE TYPE price_enum AS ENUM ('3000', '5000', '10000', '30000', '50000');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- priceカラムを追加
ALTER TABLE public.ideas
ADD COLUMN IF NOT EXISTS price price_enum;

-- specialカラムを追加（TEXT型、NULL許可）
ALTER TABLE public.ideas
ADD COLUMN IF NOT EXISTS special TEXT;

-- コメント追加
COMMENT ON COLUMN public.ideas.price IS 'アイデアの価格設定（3000, 5000, 10000, 30000, 50000円）';
COMMENT ON COLUMN public.ideas.special IS '特別な設定や備考情報';

-- インデックス作成（priceカラム用）
CREATE INDEX IF NOT EXISTS idx_ideas_price ON public.ideas(price);
CREATE INDEX IF NOT EXISTS idx_ideas_special ON public.ideas USING GIN (special gin_trgm_ops);
