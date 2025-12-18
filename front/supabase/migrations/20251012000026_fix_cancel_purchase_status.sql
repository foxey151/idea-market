-- Migration: 20251012000026_fix_cancel_purchase_status
-- Description: 購入取消時にアイデアのステータスをclosedに戻すように修正（publishedではなく）
-- 作成日: 2025-10-12

-- =================================================================
-- restore_idea_on_sold_delete関数を修正（closedに戻す）
-- =================================================================

CREATE OR REPLACE FUNCTION public.restore_idea_on_sold_delete()
RETURNS TRIGGER AS $$
DECLARE
  v_is_exclusive BOOLEAN;
BEGIN
  -- 削除されたsoldレコードのidea_idに対応するideasのis_exclusiveを取得
  SELECT is_exclusive INTO v_is_exclusive
  FROM public.ideas
  WHERE id = OLD.idea_id;

  -- 独占契約の場合：statusをsoldoutからclosedに戻す（購入可能な状態に戻す）
  -- 通常購入の場合：支払い済み（is_paid=true）だった場合のみ購入回数を減らす
  IF v_is_exclusive = true THEN
    UPDATE public.ideas
    SET status = 'closed', updated_at = NOW()
    WHERE id = OLD.idea_id AND status = 'soldout';
  ELSE
    -- 支払い済みだった場合のみ購入回数を減らす
    IF OLD.is_paid = true THEN
      UPDATE public.ideas
      SET purchase_count = GREATEST(0, purchase_count - 1), updated_at = NOW()
      WHERE id = OLD.idea_id;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- コメント更新
COMMENT ON FUNCTION public.restore_idea_on_sold_delete() IS 'soldテーブルからレコードが削除されたときに、独占契約の場合はstatusをsoldoutからclosedに戻し、通常購入で支払い済みだった場合はpurchase_countを減らす';

-- =================================================================
-- cancel_purchase関数を修正（closedに戻す）
-- =================================================================

CREATE OR REPLACE FUNCTION public.cancel_purchase(
  p_sold_id UUID,
  p_user_id UUID
) RETURNS UUID AS $$
DECLARE
  v_idea_id UUID;
  v_is_exclusive BOOLEAN;
  v_is_paid BOOLEAN;
BEGIN
  -- 呼び出しユーザーの検証
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'UNAUTHORIZED' USING ERRCODE = '42501';
  END IF;

  -- soldの所有者チェックと対象ideaの取得
  SELECT s.idea_id, i.is_exclusive, s.is_paid INTO v_idea_id, v_is_exclusive, v_is_paid
  FROM public.sold s
  JOIN public.ideas i ON s.idea_id = i.id
  WHERE s.id = p_sold_id AND s.user_id = p_user_id
  FOR UPDATE;

  IF v_idea_id IS NULL THEN
    RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- soldレコード削除
  DELETE FROM public.sold WHERE id = p_sold_id;

  -- 独占契約の場合：statusをclosedに戻す（購入可能な状態に戻す）
  -- 通常購入の場合：支払い済み（is_paid=true）だった場合のみ購入回数を減らす
  IF v_is_exclusive = true THEN
    UPDATE public.ideas
    SET status = 'closed', updated_at = NOW()
    WHERE id = v_idea_id AND status = 'soldout';
  ELSE
    -- 支払い済みだった場合のみ購入回数を減らす
    IF v_is_paid = true THEN
      UPDATE public.ideas
      SET purchase_count = GREATEST(0, purchase_count - 1), updated_at = NOW()
      WHERE id = v_idea_id;
    END IF;
  END IF;

  RETURN v_idea_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 権限設定（既存の権限を維持）
REVOKE ALL ON FUNCTION public.cancel_purchase(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_purchase(UUID, UUID) TO anon, authenticated;
