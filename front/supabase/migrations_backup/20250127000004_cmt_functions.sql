-- Migration: 20250127000004_cmt_functions
-- Description: CMT番号生成機能と関連トリガーの実装
-- Based on: documents/DB設計書.md

-- =================================================================
-- 1. CMT番号生成関数
-- =================================================================

-- CMT番号生成関数（CMT-YYMMDD-0001形式）
CREATE OR REPLACE FUNCTION public.generate_cmt_no()
RETURNS TEXT AS $$
DECLARE 
    v_next INTEGER; 
    v_date TEXT; 
BEGIN
    INSERT INTO public.cmt_counters(seq_date, last_no)
        VALUES (CURRENT_DATE, 1)
    ON CONFLICT (seq_date)
        DO UPDATE SET 
            last_no = public.cmt_counters.last_no + 1,
            updated_at = NOW()
        RETURNING last_no INTO v_next;
    
    v_date := to_char(CURRENT_DATE, 'YYMMDD');
    RETURN 'CMT-' || v_date || lpad(v_next::text, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CMT番号設定トリガー関数
CREATE OR REPLACE FUNCTION public.set_cmt_no()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cmt_no IS NULL OR NEW.cmt_no = '' THEN
        NEW.cmt_no := public.generate_cmt_no();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- アイデア作成時のCMT番号自動設定トリガー
CREATE TRIGGER trg_ideas_set_cmt
    BEFORE INSERT ON public.ideas
    FOR EACH ROW WHEN (NEW.cmt_no IS NULL OR NEW.cmt_no = '')
    EXECUTE FUNCTION public.set_cmt_no();

-- =================================================================
-- 2. 監査ログ書込関数
-- =================================================================

-- 監査ログ書込関数（アプリ/DBトリガから呼ぶ）
CREATE OR REPLACE FUNCTION public.write_audit(
    _actor UUID, 
    _action TEXT, 
    _entity TEXT, 
    _entity_id UUID, 
    _payload JSONB
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.audit_logs(actor_id, action, entity, entity_id, payload)
    VALUES (_actor, _action, _entity, _entity_id, _payload);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 3. 新規ユーザー登録時のプロファイル作成トリガー
-- =================================================================

-- auth.usersテーブルへのトリガー（新規ユーザー登録時）
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
