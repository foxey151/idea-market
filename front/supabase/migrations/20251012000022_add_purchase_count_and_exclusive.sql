-- Migration: 20251012000022_add_purchase_count_and_exclusive
-- Description: 複数回購入対応と独占契約機能の追加
-- 作成日: 2025-10-12

-- =================================================================
-- 1. ideasテーブルに購入回数と独占契約フラグを追加
-- =================================================================

-- purchase_countカラムを追加（購入回数を管理）
ALTER TABLE public.ideas
  ADD COLUMN IF NOT EXISTS purchase_count INTEGER NOT NULL DEFAULT 0;

-- is_exclusiveカラムを追加（独占契約フラグ）
ALTER TABLE public.ideas
  ADD COLUMN IF NOT EXISTS is_exclusive BOOLEAN NOT NULL DEFAULT false;

-- コメント追加
COMMENT ON COLUMN public.ideas.purchase_count IS '購入回数（通常購入の場合にカウント）';
COMMENT ON COLUMN public.ideas.is_exclusive IS '独占契約フラグ（trueの場合、1回のみ購入可能でstatusがsoldoutになる）';

-- インデックス追加（購入回数でソートする場合に使用）
CREATE INDEX IF NOT EXISTS idx_ideas_purchase_count ON public.ideas(purchase_count DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_is_exclusive ON public.ideas(is_exclusive);

-- =================================================================
-- 2. soldテーブルのunique_sold_idea制約を削除（複数回購入を許可）
-- =================================================================

-- 一意制約を削除
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE t.relname = 'sold' 
    AND n.nspname = 'public' 
    AND c.conname = 'unique_sold_idea';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.sold DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

-- =================================================================
-- 3. purchase_idea関数を修正（独占契約と通常購入を分岐）
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
    INSERT INTO public.sold (idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline)
    VALUES (p_idea_id, p_user_id, false, p_phone, p_company, p_manager, NOW() + INTERVAL '7 days')
    RETURNING id INTO v_id;

    -- 購入回数をカウントアップ（statusは変更しない）
    UPDATE public.ideas 
    SET purchase_count = purchase_count + 1, updated_at = NOW() 
    WHERE id = p_idea_id;
  END IF;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 実行権限（既存の権限を維持）
REVOKE ALL ON FUNCTION public.purchase_idea(UUID, UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purchase_idea(UUID, UUID, TEXT, TEXT, TEXT) TO anon, authenticated;

-- =================================================================
-- 4. cancel_purchase関数を修正（独占契約と通常購入を分岐）
-- =================================================================

CREATE OR REPLACE FUNCTION public.cancel_purchase(
  p_sold_id UUID,
  p_user_id UUID
) RETURNS UUID AS $$
DECLARE
  v_idea_id UUID;
  v_is_exclusive BOOLEAN;
BEGIN
  -- 呼び出しユーザーの検証
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'UNAUTHORIZED' USING ERRCODE = '42501';
  END IF;

  -- soldの所有者チェックと対象ideaの取得
  SELECT s.idea_id, i.is_exclusive INTO v_idea_id, v_is_exclusive
  FROM public.sold s
  JOIN public.ideas i ON s.idea_id = i.id
  WHERE s.id = p_sold_id AND s.user_id = p_user_id
  FOR UPDATE;

  IF v_idea_id IS NULL THEN
    RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- soldレコード削除
  DELETE FROM public.sold WHERE id = p_sold_id;

  -- 独占契約の場合：statusをpublishedに戻す
  -- 通常購入の場合：purchase_countを減らす（0未満にはならない）
  IF v_is_exclusive = true THEN
    UPDATE public.ideas
    SET status = 'published', updated_at = NOW()
    WHERE id = v_idea_id AND status = 'soldout';
  ELSE
    UPDATE public.ideas
    SET purchase_count = GREATEST(0, purchase_count - 1), updated_at = NOW()
    WHERE id = v_idea_id;
  END IF;

  RETURN v_idea_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 権限設定（既存の権限を維持）
REVOKE ALL ON FUNCTION public.cancel_purchase(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_purchase(UUID, UUID) TO anon, authenticated;

-- =================================================================
-- 5. restore_idea_on_sold_delete関数を修正（独占契約と通常購入を分岐）
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

  -- 独占契約の場合：statusをsoldoutからpublishedに戻す
  -- 通常購入の場合：purchase_countを減らす（0未満にはならない）
  IF v_is_exclusive = true THEN
    UPDATE public.ideas
    SET status = 'published', updated_at = NOW()
    WHERE id = OLD.idea_id AND status = 'soldout';
  ELSE
    UPDATE public.ideas
    SET purchase_count = GREATEST(0, purchase_count - 1), updated_at = NOW()
    WHERE id = OLD.idea_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- トリガーは既に存在するので、関数のみ更新
-- コメント更新
COMMENT ON FUNCTION public.restore_idea_on_sold_delete() IS 'soldテーブルからレコードが削除されたときに、独占契約の場合はstatusをsoldoutからpublishedに戻し、通常購入の場合はpurchase_countを減らす';

