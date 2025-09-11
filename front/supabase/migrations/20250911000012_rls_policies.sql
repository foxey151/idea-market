-- Migration: 20250911000012_rls_policies
-- Description: RLSポリシーの設定（整理版）
-- 作成日: 2025-09-11

-- =================================================================
-- RLSポリシーの設定
-- =================================================================

-- RLSを有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- profiles テーブルのポリシー
-- =================================================================

-- 全ユーザーがプロファイルを閲覧可能
CREATE POLICY "Anyone can view profiles" ON public.profiles
    FOR SELECT USING (true);

-- 認証済みユーザーのみ自分のプロファイルを更新可能
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 新規ユーザー登録時のみ挿入可能（トリガーで制御）
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =================================================================
-- user_details テーブルのポリシー
-- =================================================================

-- ユーザーは自分の詳細情報のみ閲覧・更新可能
CREATE POLICY "Users can view own details" ON public.user_details
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own details" ON public.user_details
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own details" ON public.user_details
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own details" ON public.user_details
    FOR DELETE USING (auth.uid() = user_id);

-- =================================================================
-- ideas テーブルのポリシー
-- =================================================================

-- 全ユーザーがアイデアを閲覧可能
CREATE POLICY "Anyone can view ideas" ON public.ideas
    FOR SELECT USING (true);

-- 認証済みユーザーのみアイデアを作成可能
CREATE POLICY "Authenticated users can create ideas" ON public.ideas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 作成者のみ自分のアイデアを更新・削除可能
CREATE POLICY "Authors can update own ideas" ON public.ideas
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own ideas" ON public.ideas
    FOR DELETE USING (auth.uid() = author_id);

-- 管理者は全てのアイデアを更新・削除可能
CREATE POLICY "Admins can update all ideas" ON public.ideas
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete all ideas" ON public.ideas
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =================================================================
-- idea_versions テーブルのポリシー
-- =================================================================

-- 全ユーザーがアイデアバージョンを閲覧可能
CREATE POLICY "Anyone can view idea versions" ON public.idea_versions
    FOR SELECT USING (true);

-- 認証済みユーザーのみアイデアバージョンを作成可能
CREATE POLICY "Authenticated users can create idea versions" ON public.idea_versions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 作成者のみ自分のアイデアバージョンを更新・削除可能
CREATE POLICY "Authors can update own idea versions" ON public.idea_versions
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT author_id FROM public.ideas WHERE id = idea_id
        )
    );

CREATE POLICY "Authors can delete own idea versions" ON public.idea_versions
    FOR DELETE USING (
        auth.uid() IN (
            SELECT author_id FROM public.ideas WHERE id = idea_id
        )
    );

-- =================================================================
-- comments テーブルのポリシー
-- =================================================================

-- 全ユーザーがコメントを閲覧可能
CREATE POLICY "Anyone can view comments" ON public.comments
    FOR SELECT USING (true);

-- 認証済みユーザーのみコメントを作成可能
CREATE POLICY "Authenticated users can create comments" ON public.comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 投稿者のみ自分のコメントを更新・削除可能
CREATE POLICY "Authors can update own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own comments" ON public.comments
    FOR DELETE USING (auth.uid() = author_id);

-- =================================================================
-- purchases テーブルのポリシー
-- =================================================================

-- ユーザーは自分の購入履歴のみ閲覧可能
CREATE POLICY "Users can view own purchases" ON public.purchases
    FOR SELECT USING (auth.uid() = buyer_id);

-- 認証済みユーザーのみ購入を作成可能
CREATE POLICY "Authenticated users can create purchases" ON public.purchases
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 購入者のみ自分の購入履歴を更新可能
CREATE POLICY "Buyers can update own purchases" ON public.purchases
    FOR UPDATE USING (auth.uid() = buyer_id);

-- 購入履歴の削除は不可（監査のため）

-- =================================================================
-- audit_logs テーブルのポリシー
-- =================================================================

-- 管理者のみ監査ログを閲覧可能
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- システムのみ監査ログを作成可能
CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- 監査ログの更新・削除は不可
