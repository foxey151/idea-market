-- Migration: 20251012000017_cancel_purchase_function
-- Description: ユーザー自身の購入取消（sold削除 + ideas.statusをpublishedへ）関数の追加

-- 取消処理関数（SECURITY DEFINER）
CREATE OR REPLACE FUNCTION public.cancel_purchase(
  p_sold_id UUID,
  p_user_id UUID
) RETURNS UUID AS $$
DECLARE
  v_idea_id UUID;
BEGIN
  -- 呼び出しユーザーの検証
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'UNAUTHORIZED' USING ERRCODE = '42501';
  END IF;

  -- soldの所有者チェックと対象ideaの取得
  SELECT idea_id INTO v_idea_id
  FROM public.sold
  WHERE id = p_sold_id AND user_id = p_user_id
  FOR UPDATE;

  IF v_idea_id IS NULL THEN
    RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- soldレコード削除
  DELETE FROM public.sold WHERE id = p_sold_id;

  -- ideasをpublishedに戻す
  UPDATE public.ideas
  SET status = 'published', updated_at = NOW()
  WHERE id = v_idea_id;

  RETURN v_idea_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 権限設定
REVOKE ALL ON FUNCTION public.cancel_purchase(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_purchase(UUID, UUID) TO anon, authenticated;



