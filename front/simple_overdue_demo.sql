-- =================================================================
-- 簡単版: デモ用期限切れアイデア作成SQL
-- =================================================================

-- 注意: このSQLを実行する前に fix_status_constraint.sql を実行してください
-- ステータス制約にoverdueが含まれていない場合があります

-- 既存のユーザーIDを使用する場合（YOUR_USER_IDを実際のUUIDに置き換えてください）
-- SELECT id FROM public.profiles LIMIT 1; で取得できます

-- 期限切れアイデア1: 締切が過去
INSERT INTO public.ideas (
    author_id,
    title,
    summary,
    deadline,
    status
) VALUES (
    (SELECT id FROM public.profiles LIMIT 1), -- 最初のユーザーを使用
    'AI搭載スマートホーム管理システム',
    'IoTデバイスとAIを組み合わせた次世代スマートホーム管理システムのアイデア。音声認識、学習機能、省エネ最適化を含む包括的なソリューション。',
    NOW() - INTERVAL '7 days', -- 7日前が締切
    'overdue'
);

-- 期限切れアイデア2: 締切が過去
INSERT INTO public.ideas (
    author_id,
    title,
    summary,
    deadline,
    status
) VALUES (
    (SELECT id FROM public.profiles LIMIT 1),
    'サステナブル配送ドローンサービス',
    '環境に優しい電動ドローンを使用した配送サービス。再生可能エネルギーで充電し、ラストワンマイル配送の効率化を実現。',
    NOW() - INTERVAL '3 days', -- 3日前が締切
    'overdue'
);

-- 期限切れアイデア3: 締切なし（NULL）
INSERT INTO public.ideas (
    author_id,
    title,
    summary,
    deadline,
    status
) VALUES (
    (SELECT id FROM public.profiles LIMIT 1),
    'ブロックチェーン活用型フリーランサープラットフォーム',
    'ブロックチェーン技術を活用したフリーランサープラットフォーム。透明性と信頼性を向上させ、スマートコントラクトによる自動決済機能を提供。',
    NULL, -- 締切なし
    'overdue'
);

-- 結果確認
SELECT 
    mmb_no,
    title,
    deadline,
    status,
    created_at
FROM public.ideas 
WHERE status = 'overdue'
ORDER BY created_at DESC;
