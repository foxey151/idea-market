-- Migration: 20250127000006_search_indexes
-- Description: 検索用インデックスと検索関数の作成
-- Based on: documents/DB設計書.md

-- =================================================================
-- 1. 全文検索用インデックス
-- =================================================================

-- アイデアタイトル・サマリーの全文検索インデックス
CREATE INDEX idx_ideas_title_trgm ON public.ideas 
    USING GIN (title gin_trgm_ops);

CREATE INDEX idx_ideas_summary_trgm ON public.ideas 
    USING GIN (summary gin_trgm_ops);

-- コメント本文の全文検索インデックス
CREATE INDEX idx_comments_text_trgm ON public.comments 
    USING GIN (text gin_trgm_ops);

-- アイデアバージョンの本文検索インデックス（既に作成済みだが確認）
-- CREATE INDEX idx_versions_title_trgm ON public.idea_versions USING GIN (title gin_trgm_ops);
-- CREATE INDEX idx_versions_summary_trgm ON public.idea_versions USING GIN (summary gin_trgm_ops);

-- アイデアバージョンの本文検索インデックス
CREATE INDEX idx_versions_body_trgm ON public.idea_versions 
    USING GIN (body gin_trgm_ops);

-- =================================================================
-- 2. 検索関数の作成
-- =================================================================

-- キーワードによるアイデア検索関数（類似度付き）
CREATE OR REPLACE FUNCTION public.search_ideas_by_keyword(
    keyword_text TEXT,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    author_id UUID,
    cmt_no TEXT,
    title TEXT,
    summary TEXT,
    tags TEXT[],
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    similarity_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.author_id,
        i.cmt_no,
        i.title,
        i.summary,
        i.tags,
        i.status,
        i.created_at,
        i.updated_at,
        GREATEST(
            similarity(i.title, keyword_text),
            similarity(i.summary, keyword_text)
        ) AS similarity_score
    FROM public.ideas i
    WHERE 
        i.status = 'published'
        AND (
            i.title % keyword_text 
            OR i.summary % keyword_text
            OR keyword_text = ANY(i.tags)
        )
    ORDER BY similarity_score DESC, i.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CMT番号による完全一致検索関数
CREATE OR REPLACE FUNCTION public.search_idea_by_cmt_no(cmt_number TEXT)
RETURNS TABLE (
    id UUID,
    author_id UUID,
    cmt_no TEXT,
    title TEXT,
    summary TEXT,
    tags TEXT[],
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.author_id,
        i.cmt_no,
        i.title,
        i.summary,
        i.tags,
        i.status,
        i.created_at,
        i.updated_at
    FROM public.ideas i
    WHERE 
        i.cmt_no = cmt_number
        AND i.status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- アイデアバージョン検索関数（X版のみ公開）
CREATE OR REPLACE FUNCTION public.search_idea_versions_by_keyword(
    keyword_text TEXT,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    idea_id UUID,
    type public.version_type,
    title TEXT,
    summary TEXT,
    price INTEGER,
    purchase_count INTEGER,
    created_at TIMESTAMPTZ,
    similarity_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        iv.id,
        iv.idea_id,
        iv.type,
        iv.title,
        iv.summary,
        iv.price,
        iv.purchase_count,
        iv.created_at,
        GREATEST(
            similarity(iv.title, keyword_text),
            similarity(iv.summary, keyword_text),
            CASE WHEN iv.body IS NOT NULL 
                 THEN similarity(iv.body, keyword_text) 
                 ELSE 0 END
        ) AS similarity_score
    FROM public.idea_versions iv
    WHERE 
        iv.is_public = true
        AND iv.type = 'X'
        AND (
            iv.title % keyword_text 
            OR iv.summary % keyword_text
            OR (iv.body IS NOT NULL AND iv.body % keyword_text)
        )
    ORDER BY similarity_score DESC, iv.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 人気のアイデア取得関数（購入数順）
CREATE OR REPLACE FUNCTION public.get_popular_ideas(
    limit_count INTEGER DEFAULT 10,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    author_id UUID,
    cmt_no TEXT,
    title TEXT,
    summary TEXT,
    tags TEXT[],
    status TEXT,
    created_at TIMESTAMPTZ,
    total_purchases BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.author_id,
        i.cmt_no,
        i.title,
        i.summary,
        i.tags,
        i.status,
        i.created_at,
        COALESCE(SUM(iv.purchase_count), 0) AS total_purchases
    FROM public.ideas i
    LEFT JOIN public.idea_versions iv ON i.id = iv.idea_id
    WHERE i.status = 'published'
    GROUP BY i.id, i.author_id, i.cmt_no, i.title, i.summary, i.tags, i.status, i.created_at
    ORDER BY total_purchases DESC, i.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 3. 追加のパフォーマンス向上インデックス
-- =================================================================

-- 複合インデックス：ステータス + 作成日時
CREATE INDEX idx_ideas_status_created ON public.ideas(status, created_at DESC);

-- 複合インデックス：公開フラグ + タイプ + 作成日時
CREATE INDEX idx_versions_public_type_created ON public.idea_versions(is_public, type, created_at DESC);

-- 購入統計用インデックス
CREATE INDEX idx_versions_purchase_count ON public.idea_versions(purchase_count DESC);
