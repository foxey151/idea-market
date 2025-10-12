-- Migration: 20251012000015_admin_sold_policies
-- Description: soldテーブルに管理者用RLSポリシーを追加

-- RLS: 管理者は sold を全件参照/更新/削除可能
DO $$
BEGIN
  -- SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sold' AND policyname = 'Admins can view all sold'
  ) THEN
    CREATE POLICY "Admins can view all sold" ON public.sold
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;

  -- UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sold' AND policyname = 'Admins can update all sold'
  ) THEN
    CREATE POLICY "Admins can update all sold" ON public.sold
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;

  -- DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sold' AND policyname = 'Admins can delete all sold'
  ) THEN
    CREATE POLICY "Admins can delete all sold" ON public.sold
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;


