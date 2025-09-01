-- Migration: 20250127000005_rls_policies
-- Description: Row Level Security (RLS) ポリシーの設定
-- Based on: documents/DB設計書.md

-- =================================================================
-- 1. profiles テーブルのRLS
-- =================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 自分のプロファイルのみ読み取り可能
CREATE POLICY p_profiles_self_read ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- プロファイル作成を許可（サインアップ時に必要）
-- 注意: このポリシーは20250127000010で改良版を作成するためコメントアウト
-- CREATE POLICY p_profiles_insert ON public.profiles
--     FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 自分のプロファイルのみ更新可能
CREATE POLICY p_profiles_self_update ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =================================================================
-- 2. user_details テーブルのRLS
-- =================================================================

ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;

-- 自分の詳細情報のみ読み取り可能
CREATE POLICY p_user_details_self_read ON public.user_details
    FOR SELECT USING (auth.uid() = user_id);

-- 自分の詳細情報のみ作成可能
CREATE POLICY p_user_details_self_insert ON public.user_details
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 自分の詳細情報のみ更新可能
CREATE POLICY p_user_details_self_update ON public.user_details
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 管理者ポリシーはprofilesテーブル参照により無限再帰を起こすため一時的に削除

-- =================================================================
-- 3. ideas テーブルのRLS（当初：公開想定）
-- =================================================================

ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

-- 読み取り：誰でも（公開）
CREATE POLICY p_ideas_read_all ON public.ideas 
    FOR SELECT USING (true);

-- 作成：認証済のみ
CREATE POLICY p_ideas_insert_owner ON public.ideas
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- 更新：作者のみ
-- 注意: このポリシーは20250127000009で管理者権限チェックを削除した版を作成するためコメントアウト
-- CREATE POLICY p_ideas_update_owner ON public.ideas
--     FOR UPDATE USING (auth.uid() = author_id) 
--     WITH CHECK (auth.uid() = author_id);

-- =================================================================
-- 4. comments テーブルのRLS（公開閲覧）
-- =================================================================

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 読み取り：誰でも
CREATE POLICY p_comments_read_all ON public.comments 
    FOR SELECT USING (true);

-- 作成：認証済のみ
CREATE POLICY p_comments_insert_owner ON public.comments
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- 更新：作者のみ
CREATE POLICY p_comments_update_owner ON public.comments
    FOR UPDATE USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

-- 削除：作者のみ
-- 注意: このポリシーは20250127000009で再作成されるためコメントアウト
-- CREATE POLICY p_comments_delete_owner ON public.comments 
--     FOR DELETE USING (auth.uid() = author_id);

-- =================================================================
-- 5. idea_versions テーブルのRLS（X=公開, Y=制限）
-- =================================================================

ALTER TABLE public.idea_versions ENABLE ROW LEVEL SECURITY;

-- 読み取り：X版は誰でも、Y版は購入者のみ
-- 注意: このポリシーは20250127000009で再作成されるためコメントアウト
-- CREATE POLICY p_versions_read_public ON public.idea_versions
--     FOR SELECT USING (
--         type = 'X' AND is_public = true
--         OR auth.uid() = (SELECT author_id FROM public.ideas WHERE id = idea_id)
--         OR EXISTS (
--             SELECT 1 FROM public.purchases p 
--             WHERE p.buyer_id = auth.uid() 
--             AND p.idea_version_id = public.idea_versions.id 
--             AND p.status = 'succeeded'
--         )
--     );

-- 作成：認証済でアイデアの作者のみ
CREATE POLICY p_versions_insert_owner ON public.idea_versions
    FOR INSERT TO authenticated WITH CHECK (
        auth.uid() = (SELECT author_id FROM public.ideas WHERE id = idea_id)
    );

-- 更新：アイデアの作者のみ
-- 注意: このポリシーは20250127000009で再作成されるためコメントアウト
-- CREATE POLICY p_versions_update_owner ON public.idea_versions
--     FOR UPDATE USING (
--         auth.uid() = (SELECT author_id FROM public.ideas WHERE id = idea_id)
--     ) WITH CHECK (
--         auth.uid() = (SELECT author_id FROM public.ideas WHERE id = idea_id)
--     );

-- =================================================================
-- 6. purchases テーブルのRLS
-- =================================================================

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- 読み取り：購入者本人のみ
CREATE POLICY p_purchases_self_read ON public.purchases
    FOR SELECT USING (auth.uid() = buyer_id);

-- 作成：認証済のみ（ただし自分の購入のみ）
CREATE POLICY p_purchases_insert_self ON public.purchases
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);

-- 管理者ポリシーはprofilesテーブル参照により無限再帰を起こすため一時的に削除

-- =================================================================
-- 7. 管理系テーブルのRLS（ads, ad_metrics, pages, audit_logs）
-- =================================================================

-- ads テーブル
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- 読み取り：誰でも（広告表示のため）
CREATE POLICY p_ads_read_all ON public.ads 
    FOR SELECT USING (true);

-- 管理者ポリシーはprofilesテーブル参照により無限再帰を起こすため一時的に削除

-- ad_metrics テーブル
ALTER TABLE public.ad_metrics ENABLE ROW LEVEL SECURITY;

-- 作成：誰でも（計測のため）
CREATE POLICY p_ad_metrics_insert_all ON public.ad_metrics
    FOR INSERT WITH CHECK (true);

-- 管理者ポリシーはprofilesテーブル参照により無限再帰を起こすため一時的に削除

-- pages テーブル
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- 読み取り：公開済のみ（ドラフトは管理者のみだが無限再帰を避けるため一時的に非公開）
CREATE POLICY p_pages_read_all ON public.pages 
    FOR SELECT USING (NOT draft);

-- 管理者ポリシーはprofilesテーブル参照により無限再帰を起こすため一時的に削除

-- audit_logs テーブル
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 作成：システムのみ（セキュリティ関数から）
CREATE POLICY p_audit_logs_system_insert ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- 管理者ポリシーはprofilesテーブル参照により無限再帰を起こすため一時的に削除

-- cmt_counters テーブル
ALTER TABLE public.cmt_counters ENABLE ROW LEVEL SECURITY;

-- システム用：読み取り・更新をシステム関数のみに制限
CREATE POLICY p_cmt_counters_system ON public.cmt_counters
    FOR ALL USING (false) WITH CHECK (false);
