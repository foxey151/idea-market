-- Migration: 20250902000022_create_pages_content_table
-- Description: ページコンテンツ保存用のテーブルを作成
-- 作成日: 2025-09-02

-- =================================================================
-- ページコンテンツ保存テーブル
-- =================================================================

CREATE TABLE IF NOT EXISTS public.pages_content (
    id SERIAL PRIMARY KEY,
    page_type TEXT UNIQUE NOT NULL,
    content TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_pages_content_page_type ON public.pages_content(page_type);
CREATE INDEX IF NOT EXISTS idx_pages_content_updated_at ON public.pages_content(updated_at DESC);

-- RLSポリシー
-- ALTER TABLE public.pages_content ENABLE ROW LEVEL SECURITY; -- 一時的に無効化してデバッグ

-- 全ユーザーが閲覧可能
CREATE POLICY "Anyone can view pages content" ON public.pages_content
    FOR SELECT USING (true);

-- 管理者用の更新・挿入・削除ポリシー
CREATE POLICY "Admins can insert pages content" ON public.pages_content
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update pages content" ON public.pages_content
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete pages content" ON public.pages_content
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 更新時刻自動更新トリガー
DROP TRIGGER IF EXISTS trg_pages_content_updated_at ON public.pages_content;
CREATE TRIGGER trg_pages_content_updated_at
    BEFORE UPDATE ON public.pages_content
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
