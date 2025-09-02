-- Migration: 20250902000001_extensions_and_enums
-- Description: PostgreSQL拡張機能とENUM型の初期設定（改善版）
-- 作成日: 2025-09-02

-- =================================================================
-- 1. PostgreSQL拡張機能の有効化
-- =================================================================

-- UUID生成
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 全文検索用
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GINインデックス用
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- UUID生成（オプション）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================
-- 2. ENUM型の定義
-- =================================================================

-- ユーザーロール
DO $$ BEGIN
    CREATE TYPE public.role AS ENUM ('member', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 購入ステータス
DO $$ BEGIN
    CREATE TYPE public.purchase_status AS ENUM ('succeeded', 'refunded', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 銀行口座種別
DO $$ BEGIN
    CREATE TYPE public.account_type_enum AS ENUM ('ordinary', 'current');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 性別
DO $$ BEGIN
    CREATE TYPE public.gender_enum AS ENUM ('male', 'female', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 都道府県
DO $$ BEGIN
    CREATE TYPE public.prefecture_enum AS ENUM (
        'hokkaido', 'aomori', 'iwate', 'miyagi', 'akita', 'yamagata', 'fukushima',
        'ibaraki', 'tochigi', 'gunma', 'saitama', 'chiba', 'tokyo', 'kanagawa',
        'niigata', 'toyama', 'ishikawa', 'fukui', 'yamanashi', 'nagano', 'gifu',
        'shizuoka', 'aichi', 'mie', 'shiga', 'kyoto', 'osaka', 'hyogo', 'nara',
        'wakayama', 'tottori', 'shimane', 'okayama', 'hiroshima', 'yamaguchi',
        'tokushima', 'kagawa', 'ehime', 'kochi', 'fukuoka', 'saga', 'nagasaki',
        'kumamoto', 'oita', 'miyazaki', 'kagoshima', 'okinawa'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =================================================================
-- 3. 汎用関数の定義
-- =================================================================

-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 新規ユーザー登録時のプロファイル作成関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role, display_name)
    VALUES (NEW.id, 'member', NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
