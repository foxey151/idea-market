-- Migration: 20251012000020_auto_cancel_overdue_purchases
-- Description: 支払期限切れの未払い購入を自動的に削除する関数

-- 期限切れ購入を自動削除する関数
CREATE OR REPLACE FUNCTION public.auto_cancel_overdue_purchases()
RETURNS TABLE(
  cancelled_count INTEGER,
  idea_ids UUID[]
) AS $$
DECLARE
  v_cancelled_count INTEGER := 0;
  v_idea_ids UUID[] := ARRAY[]::UUID[];
  v_sold_record RECORD;
BEGIN
  -- 期限切れの未払い購入を取得
  FOR v_sold_record IN
    SELECT id, idea_id
    FROM public.sold
    WHERE is_paid = false
      AND payment_deadline < NOW()
    FOR UPDATE
  LOOP
    -- soldレコードを削除
    DELETE FROM public.sold WHERE id = v_sold_record.id;
    
    -- ideasをpublishedに戻す
    UPDATE public.ideas
    SET status = 'published', updated_at = NOW()
    WHERE id = v_sold_record.idea_id;
    
    -- カウントとIDを記録
    v_cancelled_count := v_cancelled_count + 1;
    v_idea_ids := array_append(v_idea_ids, v_sold_record.idea_id);
  END LOOP;
  
  RETURN QUERY SELECT v_cancelled_count, v_idea_ids;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 実行権限（管理者と認証済みユーザーに許可）
REVOKE ALL ON FUNCTION public.auto_cancel_overdue_purchases() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auto_cancel_overdue_purchases() TO authenticated, service_role;

-- コメント追加
COMMENT ON FUNCTION public.auto_cancel_overdue_purchases() IS '支払期限切れの未払い購入を自動的に削除し、関連するアイデアを再公開する。定期的に実行されることを想定。';

