-- Migration: 20250127000009_fix_rls_infinite_recursion
-- Description: profilesテーブルのRLSポリシーで発生している無限再帰エラーを修正
-- Issue: profiles テーブルのRLSポリシー内でprofilesテーブル自体を参照することで無限再帰が発生

-- =================================================================
-- 1. 既存の問題のあるRLSポリシーを削除
-- =================================================================

-- profiles テーブルの既存ポリシーを削除
DROP POLICY IF EXISTS p_profiles_self_read ON public.profiles;
DROP POLICY IF EXISTS p_profiles_self_update ON public.profiles;

-- 他のテーブルの管理者権限チェックを含むポリシーも削除
DROP POLICY IF EXISTS p_ideas_update_owner_or_admin ON public.ideas;
DROP POLICY IF EXISTS p_comments_delete_owner_or_admin ON public.comments;
DROP POLICY IF EXISTS p_versions_read_public ON public.idea_versions;
DROP POLICY IF EXISTS p_versions_update_owner_or_admin ON public.idea_versions;
DROP POLICY IF EXISTS p_user_details_admin_read ON public.user_details;
DROP POLICY IF EXISTS p_purchases_admin_read ON public.purchases;
DROP POLICY IF EXISTS p_ads_admin_all ON public.ads;
DROP POLICY IF EXISTS p_ad_metrics_admin_read ON public.ad_metrics;
DROP POLICY IF EXISTS p_pages_read_all ON public.pages;
DROP POLICY IF EXISTS p_pages_admin_all ON public.pages;
DROP POLICY IF EXISTS p_audit_logs_admin_read ON public.audit_logs;

-- =================================================================
-- 2. 無限再帰を回避した新しいRLSポリシーを作成
-- =================================================================

-- profiles テーブル: 自分のプロファイルのみアクセス可能
CREATE POLICY p_profiles_self_read ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- profiles テーブル: プロファイル作成を許可（サインアップ時に必要）
-- 注意: このポリシーは20250127000010で改良版を作成するためコメントアウト
-- CREATE POLICY p_profiles_insert ON public.profiles
--     FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- profiles テーブル: 自分のプロファイルのみ更新可能
CREATE POLICY p_profiles_self_update ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ideas テーブル: 作者のみ更新可能（管理者権限チェックを削除）
CREATE POLICY p_ideas_update_owner ON public.ideas
    FOR UPDATE USING (auth.uid() = author_id) 
    WITH CHECK (auth.uid() = author_id);

-- comments テーブル: 作者のみ削除可能
CREATE POLICY p_comments_delete_owner ON public.comments 
    FOR DELETE USING (auth.uid() = author_id);

-- idea_versions テーブル: X版は誰でも、Y版は購入者のみ（管理者権限チェックを削除）
CREATE POLICY p_versions_read_public ON public.idea_versions
    FOR SELECT USING (
        type = 'X' AND is_public = true
        OR auth.uid() = (SELECT author_id FROM public.ideas WHERE id = idea_id)
        OR EXISTS (
            SELECT 1 FROM public.purchases p 
            WHERE p.buyer_id = auth.uid() 
            AND p.idea_version_id = public.idea_versions.id 
            AND p.status = 'succeeded'
        )
    );

-- idea_versions テーブル: アイデアの作者のみ更新可能
CREATE POLICY p_versions_update_owner ON public.idea_versions
    FOR UPDATE USING (
        auth.uid() = (SELECT author_id FROM public.ideas WHERE id = idea_id)
    ) WITH CHECK (
        auth.uid() = (SELECT author_id FROM public.ideas WHERE id = idea_id)
    );

-- pages テーブル: 公開済のみ読み取り可能（ドラフトへのアクセスは一時的に制限）
CREATE POLICY p_pages_read_all ON public.pages 
    FOR SELECT USING (NOT draft);

-- =================================================================
-- 3. 備考: 管理者機能について
-- =================================================================

-- 注意: 管理者権限をチェックするポリシーは profiles テーブルを参照するため
-- 無限再帰を避けるため一時的に削除しています。
-- 
-- 管理者機能が必要な場合は、以下の方法を検討してください：
-- 1. RLSを無効にしてアプリケーション層で制御
-- 2. 別のテーブル（admin_roles等）で管理者権限を管理
-- 3. Supabaseの認証メタデータを活用
-- 4. サービスロール（service_role）を使用

-- =================================================================
-- 完了
-- =================================================================
