-- =================================================================
-- デモ用期限切れアイデア作成SQL
-- =================================================================

-- 注意: このSQLを実行する前に、有効なprofilesレコードが存在することを確認してください。
-- 以下のクエリで既存のプロファイルを確認できます:
-- SELECT id, display_name FROM public.profiles LIMIT 5;

DO $$
DECLARE
    demo_user_id UUID;
    idea_id_1 UUID;
    idea_id_2 UUID;
    idea_id_3 UUID;
BEGIN
    -- 既存のユーザーIDを取得（最初のユーザーを使用）
    SELECT id INTO demo_user_id 
    FROM public.profiles 
    WHERE display_name IS NOT NULL 
    LIMIT 1;
    
    -- ユーザーが存在しない場合はデモユーザーを作成
    IF demo_user_id IS NULL THEN
        -- 注意: 実際の環境では適切なauth.usersレコードも必要です
        demo_user_id := gen_random_uuid();
        INSERT INTO public.profiles (id, role, display_name, created_at, updated_at)
        VALUES (demo_user_id, 'member', 'デモユーザー', NOW(), NOW());
    END IF;
    
    -- 期限切れアイデア1: 締切が過去の日付
    INSERT INTO public.ideas (
        id,
        author_id,
        title,
        summary,
        deadline,
        status,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        demo_user_id,
        'AI搭載スマートホーム管理システム',
        'IoTデバイスとAIを組み合わせた次世代スマートホーム管理システムのアイデアです。音声認識、学習機能、省エネ最適化などを含む包括的なソリューションを提案します。',
        NOW() - INTERVAL '7 days', -- 7日前が締切
        'overdue',
        NOW() - INTERVAL '14 days', -- 14日前に作成
        NOW()
    );
    
    -- 期限切れアイデア2: 締切が過去の日付
    INSERT INTO public.ideas (
        id,
        author_id,
        title,
        summary,
        deadline,
        status,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        demo_user_id,
        'サステナブル配送ドローンサービス',
        '環境に優しい電動ドローンを使用した配送サービスのアイデアです。再生可能エネルギーで充電し、ラストワンマイル配送の効率化を図ります。',
        NOW() - INTERVAL '3 days', -- 3日前が締切
        'overdue',
        NOW() - INTERVAL '10 days', -- 10日前に作成
        NOW()
    );
    
    -- 期限切れアイデア3: 締切なし（NULL）で自動的に期限切れ扱い
    INSERT INTO public.ideas (
        id,
        author_id,
        title,
        summary,
        deadline,
        status,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        demo_user_id,
        'ブロックチェーン活用型フリーランサープラットフォーム',
        'ブロックチェーン技術を活用してフリーランサーとクライアント間の透明性と信頼性を向上させるプラットフォームのアイデア。スマートコントラクトによる自動決済機能も含みます。',
        NULL, -- 締切なし
        'overdue',
        NOW() - INTERVAL '20 days', -- 20日前に作成
        NOW()
    );
    
    RAISE NOTICE 'デモ用期限切れアイデアを3件作成しました。User ID: %', demo_user_id;
END $$;

-- 作成されたアイデアを確認するクエリ
SELECT 
    i.mmb_no,
    i.title,
    i.deadline,
    i.status,
    i.created_at,
    p.display_name as author_name
FROM public.ideas i
JOIN public.profiles p ON i.author_id = p.id
WHERE i.status = 'overdue'
ORDER BY i.created_at DESC;
