-- =================================================================
-- detailカラム追加のテスト用SQL
-- =================================================================

-- マイグレーション適用後の確認
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    col_description(pgc.oid, a.attnum) as column_comment
FROM information_schema.columns a
JOIN pg_class pgc ON pgc.relname = a.table_name
WHERE a.table_name = 'ideas' 
AND a.table_schema = 'public'
ORDER BY a.ordinal_position;

-- インデックスの確認
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'ideas' 
AND schemaname = 'public'
ORDER BY indexname;

-- テスト用データ更新（既存のアイデアにdetailを追加）
-- 注意: 実際のデータベースでは慎重に実行してください
/*
UPDATE public.ideas 
SET detail = 'これは詳細説明のテストです。最終アイデア作成時に使用される詳細な内容をここに記載します。技術仕様、実装方法、ビジネスモデル、収益予測などの詳細情報を含めることができます。'
WHERE title LIKE '%AI搭載%'
LIMIT 1;
*/

-- detailカラムが追加されたアイデアの確認
SELECT 
    mmb_no,
    title,
    LEFT(summary, 50) as summary_preview,
    LEFT(detail, 50) as detail_preview,
    status,
    created_at
FROM public.ideas 
ORDER BY created_at DESC 
LIMIT 5;
