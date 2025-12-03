-- Migration: 20251012000023_move_purchase_count_to_admin
-- Description: 購入回数のカウントアップを管理画面の支払い済み設定時に移動
-- 作成日: 2025-10-12

-- =================================================================
-- 1. purchase_idea関数から購入回数を増やす処理を削除
-- =================================================================

CREATE OR REPLACE FUNCTION public.purchase_idea(
  p_idea_id UUID,
  p_user_id UUID,
  p_phone TEXT,
  p_company TEXT,
  p_manager TEXT
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_is_exclusive BOOLEAN;
BEGIN
  -- 数字のみ許可
  IF p_phone IS NULL OR p_phone !~ '^[0-9]+$' THEN
    RAISE EXCEPTION 'PHONE_INVALID' USING ERRCODE = '23514';
  END IF;

  -- アイデアの独占契約フラグを取得
  SELECT is_exclusive INTO v_is_exclusive
  FROM public.ideas
  WHERE id = p_idea_id;

  IF v_is_exclusive IS NULL THEN
    RAISE EXCEPTION 'IDEA_NOT_FOUND' USING ERRCODE = '23503';
  END IF;

  -- 独占契約の場合の処理
  IF v_is_exclusive = true THEN
    -- 既に売り切れか確認
    IF EXISTS (SELECT 1 FROM public.ideas WHERE id = p_idea_id AND status = 'soldout') THEN
      RAISE EXCEPTION 'ALREADY_SOLDOUT' USING ERRCODE = '23505';
    END IF;

    -- sold を作成（payment_deadlineを購入日から7日後に設定）
    INSERT INTO public.sold (idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline)
    VALUES (p_idea_id, p_user_id, false, p_phone, p_company, p_manager, NOW() + INTERVAL '7 days')
    RETURNING id INTO v_id;

    -- ideas を soldout に更新
    UPDATE public.ideas 
    SET status = 'soldout', updated_at = NOW() 
    WHERE id = p_idea_id;

  -- 通常購入の場合の処理
  ELSE
    -- sold を作成（payment_deadlineを購入日から7日後に設定）
    -- 購入回数は増やさない（管理画面で支払い済みに設定されたときに増やす）
    INSERT INTO public.sold (idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline)
    VALUES (p_idea_id, p_user_id, false, p_phone, p_company, p_manager, NOW() + INTERVAL '7 days')
    RETURNING id INTO v_id;

    -- statusは変更しない（購入回数も増やさない）
  END IF;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 実行権限（既存の権限を維持）
REVOKE ALL ON FUNCTION public.purchase_idea(UUID, UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purchase_idea(UUID, UUID, TEXT, TEXT, TEXT) TO anon, authenticated;

-- =================================================================
-- 2. soldテーブルのis_paid更新時に購入回数を増やすトリガー関数を作成
-- =================================================================

CREATE OR REPLACE FUNCTION public.increment_purchase_count_on_paid()
RETURNS TRIGGER AS $$
DECLARE
  v_is_exclusive BOOLEAN;
BEGIN
  -- is_paidがfalseからtrueに変更された場合のみ処理
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- トリガーの作成
DROP TRIGGER IF EXISTS trg_increment_purchase_count_on_paid ON public.sold;
CREATE TRIGGER trg_increment_purchase_count_on_paid
  AFTER UPDATE ON public.sold
  FOR EACH ROW
  WHEN (OLD.is_paid IS DISTINCT FROM NEW.is_paid)
  EXECUTE FUNCTION public.increment_purchase_count_on_paid();

-- コメント追加
COMMENT ON FUNCTION public.increment_purchase_count_on_paid() IS 'soldテーブルのis_paidがfalseからtrueに変更されたときに、通常購入（is_exclusive=false）のアイデアの購入回数を増やす';

-- =================================================================
-- 3. is_paidがtrueからfalseに戻された場合の購入回数を減らす処理を追加
-- =================================================================

CREATE OR REPLACE FUNCTION public.increment_purchase_count_on_paid()
RETURNS TRIGGER AS $$
DECLARE
  v_is_exclusive BOOLEAN;
BEGIN
  -- is_paidがfalseからtrueに変更された場合：購入回数を増やす
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

  -- is_paidがtrueからfalseに変更された場合：購入回数を減らす
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

