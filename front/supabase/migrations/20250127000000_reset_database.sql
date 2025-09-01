-- Migration: 20250127000000_reset_database
-- Description: データベースのリセット（既存テーブルと型の削除）
-- Note: この操作は元に戻せません。本番環境では実行しないでください。

-- =================================================================
-- 1. 既存テーブルの削除（依存関係を考慮した順序）
-- =================================================================

-- 外部キー制約のあるテーブルから削除
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.audit_logs_2025_01 CASCADE;
DROP TABLE IF EXISTS public.audit_logs_2025_02 CASCADE;
DROP TABLE IF EXISTS public.ad_metrics CASCADE;
DROP TABLE IF EXISTS public.purchases CASCADE;
DROP TABLE IF EXISTS public.idea_versions CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.ideas CASCADE;
DROP TABLE IF EXISTS public.user_details CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.ads CASCADE;
DROP TABLE IF EXISTS public.pages CASCADE;
DROP TABLE IF EXISTS public.cmt_counters CASCADE;

-- =================================================================
-- 2. 既存関数の削除
-- =================================================================

DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.generate_cmt_no() CASCADE;
DROP FUNCTION IF EXISTS public.set_cmt_no() CASCADE;
DROP FUNCTION IF EXISTS public.write_audit(uuid, text, text, uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.search_ideas_by_keyword(text, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS public.search_idea_by_cmt_no(text) CASCADE;
DROP FUNCTION IF EXISTS public.search_idea_versions_by_keyword(text, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_popular_ideas(integer, integer) CASCADE;

-- =================================================================
-- 3. 既存ENUM型の削除
-- =================================================================

DROP TYPE IF EXISTS public.role CASCADE;
DROP TYPE IF EXISTS public.version_type CASCADE;
DROP TYPE IF EXISTS public.purchase_status CASCADE;
DROP TYPE IF EXISTS public.account_type_enum CASCADE;
DROP TYPE IF EXISTS public.gender_enum CASCADE;
DROP TYPE IF EXISTS public.prefecture_enum CASCADE;

-- =================================================================
-- 4. トリガーの削除
-- =================================================================

-- auth.usersテーブルのトリガー（存在する場合）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Note: このマイグレーションは開発環境でのリセット用です
-- 本番環境では絶対に実行しないでください
