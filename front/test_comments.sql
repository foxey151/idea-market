-- =================================================================
-- コメント表示テスト用SQL
-- =================================================================

-- 既存のアイデアを確認
SELECT id, title, status, author_id FROM public.ideas ORDER BY created_at DESC LIMIT 5;

-- 既存のコメントを確認
SELECT 
    c.id,
    c.idea_id,
    c.text,
    c.created_at,
    p.display_name
FROM public.comments c
LEFT JOIN public.profiles p ON c.author_id = p.id
ORDER BY c.created_at DESC
LIMIT 10;

-- テスト用コメントを作成（最初のアイデアに対して）
DO $$
DECLARE
    test_idea_id UUID;
    test_user_id UUID;
BEGIN
    -- 最初のアイデアIDを取得
    SELECT id INTO test_idea_id FROM public.ideas ORDER BY created_at DESC LIMIT 1;
    
    -- 最初のユーザーIDを取得
    SELECT id INTO test_user_id FROM public.profiles LIMIT 1;
    
    -- テストコメントを挿入
    IF test_idea_id IS NOT NULL AND test_user_id IS NOT NULL THEN
        INSERT INTO public.comments (idea_id, author_id, text) VALUES
        (test_idea_id, test_user_id, 'これはテスト用のコメントです。コメント表示機能をテストしています。'),
        (test_idea_id, test_user_id, '2番目のテストコメントです。複数のコメントが正しく表示されるかを確認します。');
        
        RAISE NOTICE 'テストコメントを作成しました。Idea ID: %, User ID: %', test_idea_id, test_user_id;
    ELSE
        RAISE NOTICE 'アイデアまたはユーザーが見つかりません。';
    END IF;
END $$;

-- 作成されたコメントを確認
SELECT 
    c.id,
    c.idea_id,
    c.text,
    c.created_at,
    p.display_name,
    i.title as idea_title
FROM public.comments c
LEFT JOIN public.profiles p ON c.author_id = p.id
LEFT JOIN public.ideas i ON c.idea_id = i.id
ORDER BY c.created_at DESC
LIMIT 5;
