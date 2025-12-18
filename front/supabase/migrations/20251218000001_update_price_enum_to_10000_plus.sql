-- Migration: 20251218000001_update_price_enum_to_10000_plus
-- Description: price_enumから3000と5000を削除し、10000円以上のみに変更
-- 作成日: 2025-12-18

-- =================================================================
-- price_enumの更新（10000円以上のみ）
-- =================================================================

-- 既存の3000円と5000円のデータを10000円に更新
UPDATE public.ideas
SET price = '10000'
WHERE price IN ('3000', '5000');

-- 新しいENUM型を作成（一時的な名前）
DO $$ BEGIN
    CREATE TYPE public.price_enum_new AS ENUM ('10000', '30000', '50000');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- カラムの型を変更
ALTER TABLE public.ideas
ALTER COLUMN price TYPE public.price_enum_new
USING price::text::public.price_enum_new;

-- 古いENUM型を削除
DROP TYPE IF EXISTS public.price_enum;

-- 新しいENUM型の名前を変更
ALTER TYPE public.price_enum_new RENAME TO price_enum;

-- コメント更新
COMMENT ON COLUMN public.ideas.price IS 'アイデアの価格設定（10000, 30000, 50000円）';
