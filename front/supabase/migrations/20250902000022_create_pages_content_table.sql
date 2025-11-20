-- Migration: 20250902000022_create_pages_content_table
-- Description: ページコンテンツ保存用のテーブルを作成
-- 作成日: 2025-09-02
-- 注意: profilesテーブルとset_updated_at()関数に依存するため、
--       これらが作成される前に実行される場合は外部キー制約とトリガーを後で追加する

-- =================================================================
-- ページコンテンツ保存テーブル
-- =================================================================

CREATE TABLE IF NOT EXISTS public.pages_content (
    id SERIAL PRIMARY KEY,
    page_type TEXT UNIQUE NOT NULL,
    content TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID -- 外部キー制約は後で追加（profilesテーブル作成後）
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_pages_content_page_type ON public.pages_content(page_type);
CREATE INDEX IF NOT EXISTS idx_pages_content_updated_at ON public.pages_content(updated_at DESC);

-- 外部キー制約の追加（profilesテーブルが存在する場合のみ）
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        -- 外部キー制約を追加
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_schema = 'public' 
            AND table_name = 'pages_content' 
            AND constraint_name = 'pages_content_updated_by_fkey'
        ) THEN
            ALTER TABLE public.pages_content
            ADD CONSTRAINT pages_content_updated_by_fkey 
            FOREIGN KEY (updated_by) REFERENCES public.profiles(id);
        END IF;
    END IF;
END $$;

-- RLSポリシー（profilesテーブルが存在する場合のみ作成）
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        -- 全ユーザーが閲覧可能
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'pages_content' 
            AND policyname = 'Anyone can view pages content'
        ) THEN
            CREATE POLICY "Anyone can view pages content" ON public.pages_content
                FOR SELECT USING (true);
        END IF;

        -- 管理者用の更新・挿入・削除ポリシー
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'pages_content' 
            AND policyname = 'Admins can insert pages content'
        ) THEN
            CREATE POLICY "Admins can insert pages content" ON public.pages_content
                FOR INSERT WITH CHECK (
                    EXISTS (
                        SELECT 1 FROM public.profiles
                        WHERE id = auth.uid() AND role = 'admin'
                    )
                );
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'pages_content' 
            AND policyname = 'Admins can update pages content'
        ) THEN
            CREATE POLICY "Admins can update pages content" ON public.pages_content
                FOR UPDATE USING (
                    EXISTS (
                        SELECT 1 FROM public.profiles
                        WHERE id = auth.uid() AND role = 'admin'
                    )
                );
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'pages_content' 
            AND policyname = 'Admins can delete pages content'
        ) THEN
            CREATE POLICY "Admins can delete pages content" ON public.pages_content
                FOR DELETE USING (
                    EXISTS (
                        SELECT 1 FROM public.profiles
                        WHERE id = auth.uid() AND role = 'admin'
                    )
                );
        END IF;
    END IF;
END $$;

-- 更新時刻自動更新トリガー（set_updated_at()関数が存在する場合のみ作成）
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'set_updated_at'
    ) THEN
        DROP TRIGGER IF EXISTS trg_pages_content_updated_at ON public.pages_content;
        CREATE TRIGGER trg_pages_content_updated_at
            BEFORE UPDATE ON public.pages_content
            FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    END IF;
END $$;
