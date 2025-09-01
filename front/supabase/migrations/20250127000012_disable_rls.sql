-- Migration: 20250127000012_disable_rls
-- Description: 全テーブルのRow Level Security (RLS)を無効化
-- Note: 開発環境での簡素化のため、RLSを削除します

-- =================================================================
-- 1. 全テーブルのRLSポリシーを削除
-- =================================================================

-- profiles テーブルのポリシーを削除
DROP POLICY IF EXISTS p_profiles_self_read ON public.profiles;
DROP POLICY IF EXISTS p_profiles_insert ON public.profiles;
DROP POLICY IF EXISTS p_profiles_self_update ON public.profiles;

-- user_details テーブルのポリシーを削除
DROP POLICY IF EXISTS p_user_details_self_read ON public.user_details;
DROP POLICY IF EXISTS p_user_details_self_insert ON public.user_details;
DROP POLICY IF EXISTS p_user_details_self_update ON public.user_details;

-- ideas テーブルのポリシーを削除
DROP POLICY IF EXISTS p_ideas_read_all ON public.ideas;
DROP POLICY IF EXISTS p_ideas_insert_owner ON public.ideas;
DROP POLICY IF EXISTS p_ideas_update_owner ON public.ideas;

-- comments テーブルのポリシーを削除
DROP POLICY IF EXISTS p_comments_read_all ON public.comments;
DROP POLICY IF EXISTS p_comments_insert_owner ON public.comments;
DROP POLICY IF EXISTS p_comments_update_owner ON public.comments;
DROP POLICY IF EXISTS p_comments_delete_owner ON public.comments;

-- idea_versions テーブルのポリシーを削除
DROP POLICY IF EXISTS p_versions_read_public ON public.idea_versions;
DROP POLICY IF EXISTS p_versions_insert_owner ON public.idea_versions;
DROP POLICY IF EXISTS p_versions_update_owner ON public.idea_versions;

-- purchases テーブルのポリシーを削除
DROP POLICY IF EXISTS p_purchases_self_read ON public.purchases;
DROP POLICY IF EXISTS p_purchases_insert_self ON public.purchases;

-- ads テーブルのポリシーを削除
DROP POLICY IF EXISTS p_ads_read_all ON public.ads;

-- ad_metrics テーブルのポリシーを削除
DROP POLICY IF EXISTS p_ad_metrics_insert_all ON public.ad_metrics;

-- pages テーブルのポリシーを削除
DROP POLICY IF EXISTS p_pages_read_all ON public.pages;

-- audit_logs テーブルのポリシーを削除
DROP POLICY IF EXISTS p_audit_logs_system_insert ON public.audit_logs;

-- cmt_counters テーブルのポリシーを削除
DROP POLICY IF EXISTS p_cmt_counters_system ON public.cmt_counters;

-- =================================================================
-- 2. 全テーブルのRLSを無効化
-- =================================================================

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cmt_counters DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- =================================================================
-- 3. 完了メッセージ
-- =================================================================

-- RLS無効化完了
SELECT 'RLS (Row Level Security) has been disabled for all tables' AS status;
