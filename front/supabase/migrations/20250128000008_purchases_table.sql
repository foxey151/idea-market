-- Migration: 20250128000008_purchases_table
-- Description: 購入履歴テーブルの作成
-- 作成日: 2025-01-28

-- =================================================================
-- 購入履歴テーブル
-- =================================================================

CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    idea_version_id UUID NOT NULL REFERENCES public.idea_versions(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    invoice_url TEXT,
    status public.purchase_status NOT NULL DEFAULT 'succeeded',
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 制約: 同じユーザーが同じアイデアバージョンを重複購入できない
    UNIQUE (buyer_id, idea_version_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON public.purchases(buyer_id, paid_at);
CREATE INDEX IF NOT EXISTS idx_purchases_idea_version ON public.purchases(idea_version_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_paid_at ON public.purchases(paid_at DESC);

-- 購入数カウント更新トリガー
CREATE OR REPLACE FUNCTION public.update_purchase_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 購入が成功した場合のみカウントを増加
        IF NEW.status = 'succeeded' THEN
            UPDATE public.idea_versions 
            SET purchase_count = purchase_count + 1
            WHERE id = NEW.idea_version_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- ステータスが変更された場合の処理
        IF OLD.status != NEW.status THEN
            IF OLD.status = 'succeeded' AND NEW.status != 'succeeded' THEN
                -- 成功→失敗/返金の場合、カウントを減少
                UPDATE public.idea_versions 
                SET purchase_count = purchase_count - 1
                WHERE id = NEW.idea_version_id;
            ELSIF OLD.status != 'succeeded' AND NEW.status = 'succeeded' THEN
                -- 失敗/返金→成功の場合、カウントを増加
                UPDATE public.idea_versions 
                SET purchase_count = purchase_count + 1
                WHERE id = NEW.idea_version_id;
            END IF;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 削除時、成功していた場合はカウントを減少
        IF OLD.status = 'succeeded' THEN
            UPDATE public.idea_versions 
            SET purchase_count = purchase_count - 1
            WHERE id = OLD.idea_version_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_purchase_count ON public.purchases;
CREATE TRIGGER trg_update_purchase_count
    AFTER INSERT OR UPDATE OR DELETE ON public.purchases
    FOR EACH ROW EXECUTE FUNCTION public.update_purchase_count();
