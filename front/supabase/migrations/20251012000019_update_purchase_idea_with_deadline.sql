-- Migration: 20251012000019_update_purchase_idea_with_deadline
-- Description: purchase_idea関数を更新して支払期限（購入日から7日後）を設定

-- purchase_idea関数を更新（payment_deadlineを設定）
CREATE OR REPLACE FUNCTION public.purchase_idea(
  p_idea_id UUID,
  p_user_id UUID,
  p_phone TEXT,
  p_company TEXT,
  p_manager TEXT
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  -- 数字のみ許可
  IF p_phone IS NULL OR p_phone !~ '^[0-9]+$' THEN
    RAISE EXCEPTION 'PHONE_INVALID' USING ERRCODE = '23514';
  END IF;

  -- 既に売り切れか確認
  IF EXISTS (SELECT 1 FROM public.ideas WHERE id = p_idea_id AND status = 'soldout') THEN
    RAISE EXCEPTION 'ALREADY_SOLDOUT' USING ERRCODE = '23505';
  END IF;

  -- sold を作成（payment_deadlineを購入日から7日後に設定）
  INSERT INTO public.sold (idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline)
  VALUES (p_idea_id, p_user_id, false, p_phone, p_company, p_manager, NOW() + INTERVAL '7 days')
  RETURNING id INTO v_id;

  -- ideas を soldout に更新
  UPDATE public.ideas SET status = 'soldout', updated_at = NOW() WHERE id = p_idea_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 実行権限（既存の権限を維持）
REVOKE ALL ON FUNCTION public.purchase_idea(UUID, UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purchase_idea(UUID, UUID, TEXT, TEXT, TEXT) TO anon, authenticated;

