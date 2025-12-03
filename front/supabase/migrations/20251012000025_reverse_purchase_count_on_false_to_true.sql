-- Migration: 20251012000025_reverse_purchase_count_on_false_to_true
-- Description: is_paidがfalseからtrueに変更されたときに購入回数を増やす（正しい動作）
-- 作成日: 2025-10-12

-- =================================================================
-- increment_purchase_count_on_paid関数を更新
-- falseからtrueに変更されたときに購入回数を増やす（支払済みにしたら購入回数が増える）
-- trueからfalseに変更されたときに購入回数を減らす（未払いに戻したら購入回数が減る）
-- =================================================================

CREATE OR REPLACE FUNCTION public.increment_purchase_count_on_paid()
RETURNS TRIGGER AS $$
DECLARE
  v_is_exclusive BOOLEAN;
BEGIN
  -- is_paidがfalseからtrueに変更された場合：購入回数を増やす（支払済みにしたら購入回数が増える）
  IF OLD.is_paid = false AND NEW.is_paid = true THEN
    -- アイデアの独占契約フラグを取得
    SELECT is_exclusive INTO v_is_exclusive
    FROM public.ideas
    WHERE id = NEW.idea_id;

    -- 通常購入（is_exclusive=false）の場合のみ購入回数を増やす
    IF v_is_exclusive = false THEN
      UPDATE public.ideas
      SET purchase_count = purchase_count + 1, updated_at = NOW()
      WHERE id = NEW.idea_id;
    END IF;
  END IF;

  -- is_paidがtrueからfalseに変更された場合：購入回数を減らす（未払いに戻したら購入回数が減る）
  IF OLD.is_paid = true AND NEW.is_paid = false THEN
    -- アイデアの独占契約フラグを取得
    SELECT is_exclusive INTO v_is_exclusive
    FROM public.ideas
    WHERE id = NEW.idea_id;

    -- 通常購入（is_exclusive=false）の場合のみ購入回数を減らす（0未満にはならない）
    IF v_is_exclusive = false THEN
      UPDATE public.ideas
      SET purchase_count = GREATEST(0, purchase_count - 1), updated_at = NOW()
      WHERE id = NEW.idea_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- コメント更新
COMMENT ON FUNCTION public.increment_purchase_count_on_paid() IS 'soldテーブルのis_paidが変更されたときに購入回数を調整する。false→true: 購入回数を増やす（支払済みにしたら購入回数が増える）、true→false: 購入回数を減らす（未払いに戻したら購入回数が減る）';

