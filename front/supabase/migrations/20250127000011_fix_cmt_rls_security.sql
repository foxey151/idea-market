-- Migration: 20250127000011_fix_cmt_rls_security
-- Description: CMT番号生成関数のSECURITY DEFINER修正とポリシー競合の解決
-- Issue: cmt_countersテーブルのRLSポリシーがCMT番号生成を拒否している

-- =================================================================
-- 0. 既存ポリシーとの競合を回避
-- =================================================================

-- 既存のポリシーを削除（IF EXISTSで安全に削除）
-- 注意: p_profiles_insertは20250127000010で既に処理済みのため除外
DROP POLICY IF EXISTS p_user_details_self_insert ON public.user_details;
DROP POLICY IF EXISTS p_ideas_insert_owner ON public.ideas;
DROP POLICY IF EXISTS p_comments_insert_owner ON public.comments;

-- =================================================================
-- 1. CMT番号生成関数をSECURITY DEFINERで再作成
-- =================================================================

-- CMT番号生成関数（SECURITY DEFINERでRLSを回避）
CREATE OR REPLACE FUNCTION public.generate_cmt_no()
RETURNS TEXT AS $$
DECLARE 
    v_next INTEGER; 
    v_date TEXT; 
BEGIN
    -- RLSを回避してcmt_countersテーブルを操作
    INSERT INTO public.cmt_counters(seq_date, last_no)
        VALUES (CURRENT_DATE, 1)
    ON CONFLICT (seq_date)
        DO UPDATE SET 
            last_no = public.cmt_counters.last_no + 1,
            updated_at = NOW()
        RETURNING last_no INTO v_next;
    
    -- CMT-YYMMDD0001形式で番号を生成
    v_date := to_char(CURRENT_DATE, 'YYMMDD');
    RETURN 'CMT-' || v_date || lpad(v_next::text, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CMT番号設定トリガー関数（SECURITY DEFINERで再作成）
CREATE OR REPLACE FUNCTION public.set_cmt_no()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cmt_no IS NULL OR NEW.cmt_no = '' THEN
        NEW.cmt_no := public.generate_cmt_no();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- updated_at自動更新関数もSECURITY DEFINERで再作成
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 2. 関数の権限設定
-- =================================================================

-- authenticatedロールに実行権限を付与
GRANT EXECUTE ON FUNCTION public.generate_cmt_no() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_cmt_no() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO authenticated;

-- anonロールにも実行権限を付与（未ログインでの投稿がある場合）
GRANT EXECUTE ON FUNCTION public.generate_cmt_no() TO anon;
GRANT EXECUTE ON FUNCTION public.set_cmt_no() TO anon;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO anon;

-- =================================================================
-- 3. 必要なRLSポリシーを再作成
-- =================================================================

-- プロファイル作成ポリシー（20250127000010で既に処理済みのためスキップ）
-- CREATE POLICY p_profiles_insert ON public.profiles
--     FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ユーザー詳細情報作成ポリシー
CREATE POLICY p_user_details_self_insert ON public.user_details
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- アイデア作成ポリシー
CREATE POLICY p_ideas_insert_owner ON public.ideas
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- コメント作成ポリシー
CREATE POLICY p_comments_insert_owner ON public.comments
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- =================================================================
-- 4. テスト用：CMT番号生成の動作確認
-- =================================================================

-- 関数が正常に動作するかテスト（コメントアウト）
-- SELECT public.generate_cmt_no() AS test_cmt_no;
