-- Migration: 20251012000018_add_payment_deadline_to_sold
-- Description: soldテーブルに支払期限（payment_deadline）フィールドを追加

-- 1) payment_deadline カラムを追加（NULL許可で追加してから既存レコードを更新）
ALTER TABLE public.sold
  ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ;

-- 2) 既存レコードの支払期限を設定（created_atから7日後）
UPDATE public.sold
SET payment_deadline = created_at + INTERVAL '7 days'
WHERE payment_deadline IS NULL;

-- 3) NOT NULL制約を追加（デフォルト値も設定）
ALTER TABLE public.sold
  ALTER COLUMN payment_deadline SET DEFAULT (NOW() + INTERVAL '7 days'),
  ALTER COLUMN payment_deadline SET NOT NULL;

-- 4) インデックスを追加（期限切れ検索用）
CREATE INDEX IF NOT EXISTS idx_sold_payment_deadline ON public.sold(payment_deadline)
WHERE is_paid = false;

-- 5) コメント追加
COMMENT ON COLUMN public.sold.payment_deadline IS '支払期限。期限切れの未払い購入は自動的に削除される';

