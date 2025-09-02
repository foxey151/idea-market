-- Migration: 20250128000014_search_functions
-- Description: 検索機能とインデックスの作成
-- 作成日: 2025-01-28

-- =================================================================
-- 検索機能
-- =================================================================

-- アイデア検索関数
CREATE OR REPLACE FUNCTION public.search_ideas(
    search_query TEXT DEFAULT '',
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    summary TEXT,
    author_name TEXT,
    created_at TIMESTAMPTZ,
    mmb_no TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.title,
        i.summary,
        p.display_name as author_name,
        i.created_at,
        i.mmb_no
    FROM public.ideas i
    JOIN public.profiles p ON i.author_id = p.id
    WHERE 
        i.status = 'published'
        AND (
            search_query = '' OR
            i.title ILIKE '%' || search_query || '%' OR
            i.summary ILIKE '%' || search_query || '%' OR
            similarity(i.title, search_query) > 0.3 OR
            similarity(i.summary, search_query) > 0.3
        )
    ORDER BY 
        CASE 
            WHEN search_query != '' THEN 
                GREATEST(
                    similarity(i.title, search_query),
                    similarity(i.summary, search_query)
                )
            ELSE 0
        END DESC,
        i.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- アイデアバージョン検索関数
CREATE OR REPLACE FUNCTION public.search_idea_versions(
    search_query TEXT DEFAULT '',
    version_type public.version_type DEFAULT NULL,
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
    mmb_no TEXT
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
        i.mmb_no
    FROM public.idea_versions iv
    JOIN public.ideas i ON iv.idea_id = i.id
    WHERE 
        iv.is_public = true
        AND i.status = 'published'
        AND (
            search_query = '' OR
            iv.title ILIKE '%' || search_query || '%' OR
            iv.summary ILIKE '%' || search_query || '%' OR
            similarity(iv.title, search_query) > 0.3 OR
            similarity(iv.summary, search_query) > 0.3
        )
        AND (
            version_type IS NULL OR
            iv.type = version_type
        )
    ORDER BY 
        CASE 
            WHEN search_query != '' THEN 
                GREATEST(
                    similarity(iv.title, search_query),
                    similarity(iv.summary, search_query)
                )
            ELSE 0
        END DESC,
        iv.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;


