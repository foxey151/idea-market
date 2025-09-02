-- Migration: 20250902000003_user_details_table
-- Description: ユーザー詳細情報テーブルの作成（支払い・個人情報）
-- 作成日: 2025-09-02

-- =================================================================
-- ユーザー詳細情報テーブル（支払い・個人情報）
-- =================================================================

CREATE TABLE IF NOT EXISTS public.user_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    -- 基本情報
    full_name TEXT,
    email TEXT,
    -- 銀行情報（支払い用）
    bank_name TEXT,
    branch_name TEXT,
    account_type public.account_type_enum,
    account_number TEXT,
    account_holder TEXT,
    -- 個人情報
    gender public.gender_enum,
    birth_date DATE,
    prefecture public.prefecture_enum,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_user_details_user ON public.user_details(user_id);

-- 更新時刻自動更新トリガー
DROP TRIGGER IF EXISTS trg_user_details_updated_at ON public.user_details;
CREATE TRIGGER trg_user_details_updated_at
    BEFORE UPDATE ON public.user_details
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
