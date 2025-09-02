-- Migration: 20250128000013_rls_policies
-- Description: Row Level Security (RLS) ポリシーの設定
-- 作成日: 2025-01-28

-- =================================================================
-- Row Level Security (RLS) ポリシーの設定
-- =================================================================

-- RLSを有効にする
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- プロファイルテーブルのRLSポリシー
-- =================================================================

-- 自分のプロファイルは読み書き可能
CREATE POLICY "Users can view and edit their own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);

-- 他のユーザーのプロファイルは読み取り専用
CREATE POLICY "Users can view other profiles" ON public.profiles
    FOR SELECT USING (true);

-- =================================================================
-- ユーザー詳細テーブルのRLSポリシー
-- =================================================================

-- 自分の詳細情報のみアクセス可能
CREATE POLICY "Users can manage their own details" ON public.user_details
    FOR ALL USING (user_id = auth.uid());

-- =================================================================
-- アイデアテーブルのRLSポリシー
-- =================================================================

-- 公開されたアイデアは誰でも読み取り可能
CREATE POLICY "Anyone can view published ideas" ON public.ideas
    FOR SELECT USING (status = 'published');

-- 自分のアイデアは読み書き可能
CREATE POLICY "Users can manage their own ideas" ON public.ideas
    FOR ALL USING (author_id = auth.uid());

-- =================================================================
-- アイデアバージョンテーブルのRLSポリシー
-- =================================================================

-- 公開バージョン（X版）は誰でも読み取り可能
CREATE POLICY "Anyone can view public versions" ON public.idea_versions
    FOR SELECT USING (is_public = true);

-- 自分のアイデアのバージョンは読み書き可能
CREATE POLICY "Authors can manage their idea versions" ON public.idea_versions
    FOR ALL USING (
        idea_id IN (
            SELECT id FROM public.ideas WHERE author_id = auth.uid()
        )
    );

-- 購入済みのY版は閲覧可能
CREATE POLICY "Buyers can view purchased versions" ON public.idea_versions
    FOR SELECT USING (
        id IN (
            SELECT idea_version_id 
            FROM public.purchases 
            WHERE buyer_id = auth.uid() AND status = 'succeeded'
        )
    );

-- =================================================================
-- コメントテーブルのRLSポリシー
-- =================================================================

-- 公開されたアイデアのコメントは誰でも読み取り可能
CREATE POLICY "Anyone can view comments on published ideas" ON public.comments
    FOR SELECT USING (
        idea_id IN (
            SELECT id FROM public.ideas WHERE status = 'published'
        )
    );

-- ログインユーザーは公開アイデアにコメント投稿可能
CREATE POLICY "Authenticated users can create comments" ON public.comments
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        idea_id IN (
            SELECT id FROM public.ideas WHERE status = 'published'
        )
    );

-- 自分のコメントは編集・削除可能
CREATE POLICY "Users can edit their own comments" ON public.comments
    FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON public.comments
    FOR DELETE USING (author_id = auth.uid());

-- =================================================================
-- 購入履歴テーブルのRLSポリシー
-- =================================================================

-- 自分の購入履歴のみアクセス可能
CREATE POLICY "Users can view their own purchases" ON public.purchases
    FOR SELECT USING (buyer_id = auth.uid());

-- 購入の作成は認証されたユーザーのみ
CREATE POLICY "Authenticated users can create purchases" ON public.purchases
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND buyer_id = auth.uid());
