-- Migration: 20250902000012_search_functions
-- Description: 検索機能の実装
-- 作成日: 2025-09-02

-- =================================================================
-- 検索機能の実装
-- =================================================================

-- アイデア検索関数
CREATE OR REPLACE FUNCTION public.search_ideas(
    search_query TEXT DEFAULT '',
    status_filter TEXT DEFAULT NULL,
    author_filter UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    author_id UUID,
    mmb_no TEXT,
    title TEXT,
    summary TEXT,
    deadline TIMESTAMPTZ,
    status TEXT,
    created_at TIMESTAMPTZ,
    author_display_name TEXT,
    search_rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.author_id,
        i.mmb_no,
        i.title,
        i.summary,
        i.deadline,
        i.status,
        i.created_at,
        COALESCE(p.display_name, u.email) as author_display_name,
        ts_rank(
            to_tsvector('japanese', i.title || ' ' || i.summary),
            plainto_tsquery('japanese', search_query)
        ) as search_rank
    FROM public.ideas i
    JOIN public.profiles p ON i.author_id = p.id
    JOIN auth.users u ON p.id = u.id
    WHERE 
        (search_query = '' OR 
         to_tsvector('japanese', i.title || ' ' || i.summary) @@ plainto_tsquery('japanese', search_query))
        AND (status_filter IS NULL OR i.status = status_filter)
        AND (author_filter IS NULL OR i.author_id = author_filter)
    ORDER BY 
        CASE WHEN search_query != '' THEN search_rank END DESC NULLS LAST,
        i.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- アイデア検索（簡易版）
CREATE OR REPLACE FUNCTION public.search_ideas_simple(search_query TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    summary TEXT,
    mmb_no TEXT,
    author_display_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.title,
        i.summary,
        i.mmb_no,
        COALESCE(p.display_name, u.email) as author_display_name
    FROM public.ideas i
    JOIN public.profiles p ON i.author_id = p.id
    JOIN auth.users u ON p.id = u.id
    WHERE 
        i.title ILIKE '%' || search_query || '%'
        OR i.summary ILIKE '%' || search_query || '%'
        OR i.mmb_no ILIKE '%' || search_query || '%'
    ORDER BY i.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ユーザー検索関数
CREATE OR REPLACE FUNCTION public.search_users(search_query TEXT)
RETURNS TABLE (
    id UUID,
    display_name TEXT,
    email TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        COALESCE(p.display_name, u.email) as display_name,
        u.email
    FROM public.profiles p
    JOIN auth.users u ON p.id = u.id
    WHERE 
        COALESCE(p.display_name, u.email) ILIKE '%' || search_query || '%'
        OR u.email ILIKE '%' || search_query || '%'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
