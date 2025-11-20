-- Migration: 20251012000021_restore_idea_on_sold_delete
-- Description: soldテーブルからレコードが削除されたときに、関連するアイデアを自動的に再購入可能（published）にするトリガー

-- sold削除時にideasをpublishedに戻す関数
CREATE OR REPLACE FUNCTION public.restore_idea_on_sold_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- 削除されたsoldレコードのidea_idに対応するideasのstatusをpublishedに戻す
  UPDATE public.ideas
  SET status = 'published', updated_at = NOW()
  WHERE id = OLD.idea_id AND status = 'soldout';
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- トリガーの作成
DROP TRIGGER IF EXISTS trg_restore_idea_on_sold_delete ON public.sold;
CREATE TRIGGER trg_restore_idea_on_sold_delete
  AFTER DELETE ON public.sold
  FOR EACH ROW
  EXECUTE FUNCTION public.restore_idea_on_sold_delete();

-- コメント追加
COMMENT ON FUNCTION public.restore_idea_on_sold_delete() IS 'soldテーブルからレコードが削除されたときに、関連するアイデアのstatusをsoldoutからpublishedに戻して再購入可能にする';
COMMENT ON TRIGGER trg_restore_idea_on_sold_delete ON public.sold IS 'soldレコード削除時に自動的にアイデアを再公開するトリガー';

