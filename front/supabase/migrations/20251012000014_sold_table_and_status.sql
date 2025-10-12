-- Migration: 20251012000014_sold_table_and_status
-- Description: soldテーブルの作成とideas.statusにsoldoutを追加、購入処理関数

-- 1) ideas.status に 'soldout' を追加（既存CHECK制約を置換）
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT c.conname INTO constraint_name
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE t.relname = 'ideas' AND n.nspname = 'public' AND c.contype = 'c';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.ideas DROP CONSTRAINT %I', constraint_name);
  END IF;

  ALTER TABLE public.ideas
    ADD CONSTRAINT ideas_status_check CHECK (status IN ('overdue','published','closed','soldout'));
END $$;

-- 2) sold テーブル
CREATE TABLE IF NOT EXISTS public.sold (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  phone_number TEXT NOT NULL,
  company TEXT,
  manager TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_phone_digits CHECK (phone_number ~ '^[0-9]+$')
);

-- 一意制約: 1アイデアにつき1件の販売のみ
DO $$
BEGIN
  ALTER TABLE public.sold ADD CONSTRAINT unique_sold_idea UNIQUE (idea_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- インデックス
CREATE INDEX IF NOT EXISTS idx_sold_idea ON public.sold(idea_id);
CREATE INDEX IF NOT EXISTS idx_sold_user ON public.sold(user_id);

-- RLS 有効化
ALTER TABLE public.sold ENABLE ROW LEVEL SECURITY;

-- ポリシー
DROP POLICY IF EXISTS "Users can view own sold records" ON public.sold;
CREATE POLICY "Users can view own sold records" ON public.sold
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sold" ON public.sold;
CREATE POLICY "Users can insert own sold" ON public.sold
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sold" ON public.sold;
CREATE POLICY "Users can update own sold" ON public.sold
  FOR UPDATE USING (auth.uid() = user_id);

-- 更新時刻トリガー
DROP TRIGGER IF EXISTS trg_sold_updated_at ON public.sold;
CREATE TRIGGER trg_sold_updated_at
  BEFORE UPDATE ON public.sold
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) 購入処理関数（トランザクション）
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

  -- sold を作成
  INSERT INTO public.sold (idea_id, user_id, is_paid, phone_number, company, manager)
  VALUES (p_idea_id, p_user_id, false, p_phone, p_company, p_manager)
  RETURNING id INTO v_id;

  -- ideas を soldout に更新
  UPDATE public.ideas SET status = 'soldout', updated_at = NOW() WHERE id = p_idea_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 実行権限
REVOKE ALL ON FUNCTION public.purchase_idea(UUID, UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purchase_idea(UUID, UUID, TEXT, TEXT, TEXT) TO anon, authenticated;


