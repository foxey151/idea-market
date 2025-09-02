-- Migration: 20250902000002_profiles_table
-- Description: プロファイルテーブルの作成（改善版）
-- 作成日: 2025-09-02

-- =================================================================
-- プロファイルテーブル
-- =================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.role NOT NULL DEFAULT 'member',
    display_name TEXT, -- NULL時はメールアドレス表示
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 更新時刻自動更新トリガー
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 新規ユーザー登録時の自動プロファイル作成トリガー
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
