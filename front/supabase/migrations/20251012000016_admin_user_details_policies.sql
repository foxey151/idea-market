-- Migration: 20251012000016_admin_user_details_policies
-- Description: user_detailsテーブルに管理者用RLSポリシーを追加

DO $$
BEGIN
  -- 管理者は全件参照可能
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_details' AND policyname = 'Admins can view all user_details'
  ) THEN
    CREATE POLICY "Admins can view all user_details" ON public.user_details
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;

  -- 管理者は全件更新可能
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_details' AND policyname = 'Admins can update all user_details'
  ) THEN
    CREATE POLICY "Admins can update all user_details" ON public.user_details
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;


