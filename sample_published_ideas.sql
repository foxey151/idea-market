-- =====================================================
-- サンプルアイデア（status: published）作成SQL
-- 作成日: 2025-01-28
-- =====================================================

-- 注意: 
-- 1. author_idは実際に存在するユーザーIDに変更してください
-- 2. mmb_noは自動生成されるため、NULLまたは空文字列にしてください
-- 3. 実行前に適切なユーザーが存在することを確認してください

-- サンプルユーザーの確認（実行前に確認）
-- SELECT id, display_name FROM public.profiles LIMIT 5;

-- 1. テクノロジー関連のアイデア
INSERT INTO public.ideas (
    author_id,
    mmb_no,
    title,
    summary,
    detail,
    attachments,
    deadline,
    status,
    created_at,
    updated_at
) VALUES (
    'a4f9ab92-985c-4a50-9007-83d4e5fbb052', -- 実際のauthor_idに変更
    '', -- 自動生成
    'AIを活用した個人学習支援アプリ',
    '個人の学習進度と理解度を分析し、最適な学習コンテンツを提案するAIアプリのアイデアです。機械学習アルゴリズムを使用して、ユーザーの弱点を特定し、効率的な学習パスを自動生成します。',
    NULL, -- 詳細は後で追加（完成時）
    '{}', -- 添付ファイルなし
    NOW() + INTERVAL '30 days', -- 30日後の締切
    'published',
    NOW(),
    NOW()
);

-- 2. ビジネス関連のアイデア
INSERT INTO public.ideas (
    author_id,
    mmb_no,
    title,
    summary,
    detail,
    attachments,
    deadline,
    status,
    created_at,
    updated_at
) VALUES (
    'a4f9ab92-985c-4a50-9007-83d4e5fbb052', -- 実際のauthor_idに変更
    '', -- 自動生成
    'サステナブルな食品配送サービス',
    '環境に優しい包装材料を使用し、フードロス削減に貢献する食品配送サービスです。地域の農家と直接提携し、新鮮な野菜を消費者に届けながら、配送容器は100%リサイクル可能な素材を使用します。',
    NULL,
    '{}',
    NOW() + INTERVAL '45 days', -- 45日後の締切
    'published',
    NOW() - INTERVAL '5 days', -- 5日前に投稿
    NOW() - INTERVAL '5 days'
);

-- 3. エンターテインメント関連のアイデア
INSERT INTO public.ideas (
    author_id,
    mmb_no,
    title,
    summary,
    detail,
    attachments,
    deadline,
    status,
    created_at,
    updated_at
) VALUES (
    'a4f9ab92-985c-4a50-9007-83d4e5fbb052', -- 実際のauthor_idに変更
    '', -- 自動生成
     'バーチャル音楽コラボレーションプラットフォーム',
    '世界中のミュージシャンがリアルタイムでオンライン演奏できるプラットフォームです。低遅延通信技術を活用し、地理的制約を超えて音楽セッションを楽しめる環境を提供します。',
    NULL,
    '{}',
    NOW() + INTERVAL '60 days', -- 60日後の締切
    'published',
    NOW() - INTERVAL '10 days', -- 10日前に投稿
    NOW() - INTERVAL '10 days'
);

-- 4. ヘルスケア関連のアイデア
INSERT INTO public.ideas (
    author_id,
    mmb_no,
    title,
    summary,
    detail,
    attachments,
    deadline,
    status,
    created_at,
    updated_at
) VALUES (
    '97a2407a-2a3d-42b0-8288-c5105f34c953', -- 実際のauthor_idに変更
    '', -- 自動生成
    'スマートウォッチ連携睡眠改善アプリ',
    'スマートウォッチのデータを活用して、個人の睡眠パターンを分析し、質の高い睡眠を実現するためのパーソナライズされたアドバイスを提供するアプリです。',
    NULL,
    '{}',
    NOW() + INTERVAL '25 days', -- 25日後の締切
    'published',
    NOW() - INTERVAL '3 days', -- 3日前に投稿
    NOW() - INTERVAL '3 days'
);

-- 5. 教育関連のアイデア
INSERT INTO public.ideas (
    author_id,
    mmb_no,
    title,
    summary,
    detail,
    attachments,
    deadline,
    status,
    created_at,
    updated_at
) VALUES (
    '97a2407a-2a3d-42b0-8288-c5105f34c953', -- 実際のauthor_idに変更
    '', -- 自動生成
    'AR技術を使った歴史学習アプリ',
    'AR（拡張現実）技術を活用して、歴史的建造物や遺跡を3Dで再現し、没入感のある歴史学習体験を提供するモバイルアプリのアイデアです。',
    NULL,
    '{}',
    NOW() + INTERVAL '40 days', -- 40日後の締切
    'published',
    NOW() - INTERVAL '7 days', -- 7日前に投稿
    NOW() - INTERVAL '7 days'
);

-- 6. 環境・エコ関連のアイデア
INSERT INTO public.ideas (
    author_id,
    mmb_no,
    title,
    summary,
    detail,
    attachments,
    deadline,
    status,
    created_at,
    updated_at
) VALUES (
    '97a2407a-2a3d-42b0-8288-c5105f34c953', -- 実際のauthor_idに変更
    '', -- 自動生成
    'コミュニティ型カーボンオフセットプラットフォーム',
    '個人や企業のカーボンフットプリントを可視化し、地域の環境保護プロジェクトに投資することでカーボンオフセットを実現するプラットフォームです。',
    NULL,
    '{}',
    NOW() + INTERVAL '35 days', -- 35日後の締切
    'published',
    NOW() - INTERVAL '12 days', -- 12日前に投稿
    NOW() - INTERVAL '12 days'
);

-- 7. フィンテック関連のアイデア
INSERT INTO public.ideas (
    author_id,
    mmb_no,
    title,
    summary,
    detail,
    attachments,
    deadline,
    status,
    created_at,
    updated_at
) VALUES (
    '97a2407a-2a3d-42b0-8288-c5105f34c953', -- 実際のauthor_idに変更
    '', -- 自動生成
    '投資初心者向けマイクロ投資アプリ',
    '少額から始められる投資アプリで、AI が推奨する分散投資ポートフォリオを自動構築し、投資の基礎知識も学べる教育機能を備えたサービスです。',
    NULL,
    '{}',
    NOW() + INTERVAL '50 days', -- 50日後の締切
    'published',
    NOW() - INTERVAL '1 day', -- 1日前に投稿
    NOW() - INTERVAL '1 day'
);

-- 8. ソーシャル関連のアイデア
INSERT INTO public.ideas (
    author_id,
    mmb_no,
    title,
    summary,
    detail,
    attachments,
    deadline,
    status,
    created_at,
    updated_at
) VALUES (
    '58df210b-3f0c-438b-8b80-9c15169b098a', -- 実際のauthor_idに変更
    '', -- 自動生成
    '地域コミュニティ支援マッチングアプリ',
    '地域住民同士でスキルや知識を共有し、互いに助け合えるコミュニティプラットフォームです。高齢者のデジタル支援から子育て相談まで、幅広いサポートをマッチングします。',
    NULL,
    '{}',
    NOW() + INTERVAL '20 days', -- 20日後の締切
    'published',
    NOW() - INTERVAL '15 days', -- 15日前に投稿
    NOW() - INTERVAL '15 days'
);

-- =====================================================
-- 実行後の確認クエリ
-- =====================================================

-- 作成されたアイデアの確認
-- SELECT 
--     mmb_no,
--     title,
--     LEFT(summary, 50) || '...' as summary_excerpt,
--     status,
--     deadline,
--     created_at
-- FROM public.ideas 
-- WHERE status = 'published'
-- ORDER BY created_at DESC;

-- アイデア数の確認
-- SELECT status, COUNT(*) as count
-- FROM public.ideas 
-- GROUP BY status;
