-- Migration: 20250127000007_sample_data
-- Description: サンプルデータの投入（開発用）
-- Based on: documents/DB設計書.md

-- =================================================================
-- 1. CMSページのサンプルデータ
-- =================================================================

-- 利用規約ページ
INSERT INTO public.pages (slug, content, draft) VALUES (
    'terms',
    '{
        "title": "利用規約",
        "content": "<h1>利用規約</h1><p>アイデアマーケットの利用規約をここに記載します。</p><h2>第1条 目的</h2><p>本規約は、当サービスの利用条件を定めるものです。</p>",
        "last_updated": "2025-01-27"
    }',
    false
);

-- プライバシーポリシー
INSERT INTO public.pages (slug, content, draft) VALUES (
    'privacy',
    '{
        "title": "プライバシーポリシー",
        "content": "<h1>プライバシーポリシー</h1><p>個人情報の取り扱いについて説明します。</p><h2>収集する情報</h2><p>当サービスでは以下の情報を収集します。</p>",
        "last_updated": "2025-01-27"
    }',
    false
);

-- 会社情報
INSERT INTO public.pages (slug, content, draft) VALUES (
    'company',
    '{
        "title": "会社情報",
        "content": "<h1>会社情報</h1><p>株式会社アイデアマーケット</p><p>所在地：東京都...</p><p>設立：2025年</p>",
        "last_updated": "2025-01-27"
    }',
    false
);

-- 技術情報
INSERT INTO public.pages (slug, content, draft) VALUES (
    'tech',
    '{
        "title": "技術情報",
        "content": "<h1>技術情報</h1><p>当サービスで使用している技術スタック</p><ul><li>Frontend: Next.js</li><li>Backend: Supabase</li><li>Database: PostgreSQL</li></ul>",
        "last_updated": "2025-01-27"
    }',
    false
);

-- =================================================================
-- 2. サンプル広告データ
-- =================================================================

-- 広告サンプル1
INSERT INTO public.ads (
    title, 
    image_url, 
    link_url, 
    target_keywords, 
    active_from, 
    active_to, 
    priority
) VALUES (
    'AI開発ツール特集',
    '/images/ads/ai-tools.jpg',
    'https://example.com/ai-tools',
    ARRAY['AI', '人工知能', '機械学習', 'ツール'],
    '2025-01-01 00:00:00+00',
    '2025-12-31 23:59:59+00',
    1
);

-- 広告サンプル2
INSERT INTO public.ads (
    title, 
    image_url, 
    link_url, 
    target_keywords, 
    active_from, 
    active_to, 
    priority
) VALUES (
    'スタートアップ支援プログラム',
    '/images/ads/startup.jpg',
    'https://example.com/startup-support',
    ARRAY['スタートアップ', '起業', 'ビジネス', '投資'],
    '2025-01-01 00:00:00+00',
    '2025-12-31 23:59:59+00',
    2
);

-- 広告サンプル3
INSERT INTO public.ads (
    title, 
    image_url, 
    link_url, 
    target_keywords, 
    active_from, 
    active_to, 
    priority
) VALUES (
    'プログラミング学習サービス',
    '/images/ads/programming.jpg',
    'https://example.com/programming-course',
    ARRAY['プログラミング', '学習', '教育', 'コース'],
    '2025-01-01 00:00:00+00',
    '2025-12-31 23:59:59+00',
    3
);

-- =================================================================
-- 3. 初期設定関数
-- =================================================================

-- pg_trgm 拡張の設定確認
DO $$
BEGIN
    -- 類似度の閾値を設定（デフォルト0.3 -> 0.2に下げて検索しやすくする）
    PERFORM set_limit(0.2);
    
    -- 確認用
    RAISE NOTICE 'pg_trgm similarity limit set to: %', show_limit();
END $$;

-- =================================================================
-- 注意事項
-- =================================================================

-- 実際のアプリケーションでサンプルデータを使用する場合は、
-- 以下の点にご注意ください：
--
-- 1. 実際のauth.usersテーブルにユーザーが存在する必要があります
-- 2. ファイルパス（image_url等）は実際のアセットに更新してください
-- 3. 本番環境では、このサンプルデータは実行しないでください
-- 4. CMSページの内容は実際の規約・ポリシーに更新してください
