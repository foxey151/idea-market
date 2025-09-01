-- =================================================================
-- 代替案: publishedステータスでデモアイデアを作成し、後でoverdueに変更
-- =================================================================

-- 方法1: まずpublishedで作成してから更新
INSERT INTO public.ideas (
    author_id,
    title,
    summary,
    deadline,
    status
) VALUES (
    (SELECT id FROM public.profiles LIMIT 1),
    'AI搭載スマートホーム管理システム',
    'IoTデバイスとAIを組み合わせた次世代スマートホーム管理システムのアイデア。音声認識、学習機能、省エネ最適化を含む包括的なソリューション。',
    NOW() - INTERVAL '7 days', -- 7日前が締切
    'published' -- まずpublishedで作成
);

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
    'published'
);

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
    'published'
);

-- 制約修正後に実行: publishedからoverdueに更新
-- UPDATE public.ideas 
-- SET status = 'overdue' 
-- WHERE title IN (
--     'AI搭載スマートホーム管理システム',
--     'サステナブル配送ドローンサービス',
--     'ブロックチェーン活用型フリーランサープラットフォーム'
-- );

-- 結果確認
SELECT 
    mmb_no,
    title,
    deadline,
    status,
    created_at
FROM public.ideas 
WHERE title IN (
    'AI搭載スマートホーム管理システム',
    'サステナブル配送ドローンサービス',
    'ブロックチェーン活用型フリーランサープラットフォーム'
)
ORDER BY created_at DESC;
