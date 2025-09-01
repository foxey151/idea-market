-- Migration: 20250127000002_core_tables
-- Description: コアテーブルの作成（profiles, ideas, comments, user_details）
-- Based on: documents/DB設計書.md

-- =================================================================
-- 1. プロファイルテーブル
-- =================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.role NOT NULL DEFAULT 'member',
    display_name TEXT,
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

-- =================================================================
-- 2. ユーザー詳細情報テーブル（支払い・個人情報）
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

-- =================================================================
-- 3. CMT番号管理テーブル
-- =================================================================

CREATE TABLE IF NOT EXISTS public.cmt_counters (
    seq_date DATE PRIMARY KEY,
    last_no INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =================================================================
-- 4. 当初アイデアテーブル
-- =================================================================

CREATE TABLE IF NOT EXISTS public.ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    cmt_no TEXT NOT NULL UNIQUE, -- CMT-YYMMDD-0001
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    attachments TEXT[] NOT NULL DEFAULT '{}', -- ファイルパス配列
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_ideas_author ON public.ideas(author_id);
CREATE INDEX IF NOT EXISTS idx_ideas_cmt_no ON public.ideas(cmt_no);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON public.ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_tags ON public.ideas USING GIN (tags);

-- 更新時刻自動更新トリガー
DROP TRIGGER IF EXISTS trg_ideas_updated_at ON public.ideas;
CREATE TRIGGER trg_ideas_updated_at
    BEFORE UPDATE ON public.ideas
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =================================================================
-- 5. コメントテーブル
-- =================================================================

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    attachments TEXT[] NOT NULL DEFAULT '{}', -- ファイルパス配列
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_comments_idea_time ON public.comments(idea_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_author ON public.comments(author_id);

-- 更新時刻自動更新トリガー
DROP TRIGGER IF EXISTS trg_comments_updated_at ON public.comments;
CREATE TRIGGER trg_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
