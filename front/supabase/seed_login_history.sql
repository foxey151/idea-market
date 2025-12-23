-- Seed file: ログイン履歴のサンプルデータ作成
-- 作成日: 2025-12-20
-- 説明: login_historyテーブルにサンプルデータを挿入

-- =================================================================
-- 注意事項
-- =================================================================
-- このファイルを実行する前に、既存のユーザー（profiles）が存在することを確認してください。
-- 既存のユーザーIDを使用してログイン履歴を作成します。

-- =================================================================
-- ログイン履歴のサンプルデータ作成
-- =================================================================

DO $$
DECLARE
  -- 既存のユーザーを取得
  sample_user_1 UUID;
  sample_user_2 UUID;
  sample_user_3 UUID;
  sample_admin UUID;
BEGIN
  -- 既存のユーザーを取得
  SELECT id INTO sample_user_1 FROM public.profiles LIMIT 1 OFFSET 0;
  SELECT id INTO sample_user_2 FROM public.profiles LIMIT 1 OFFSET 1;
  SELECT id INTO sample_user_3 FROM public.profiles LIMIT 1 OFFSET 2;
  
  -- 管理者ユーザーを取得
  SELECT id INTO sample_admin FROM public.profiles WHERE role = 'admin' LIMIT 1;
  
  -- ユーザーがいない場合は警告を出して終了
  IF sample_user_1 IS NULL THEN
    RAISE NOTICE '警告: profilesテーブルにユーザーが存在しません。先にユーザーを作成してください。';
    RETURN;
  END IF;
  
  -- ユーザーが1人しかいない場合は、同じユーザーを使用
  IF sample_user_2 IS NULL THEN
    sample_user_2 := sample_user_1;
  END IF;
  IF sample_user_3 IS NULL THEN
    sample_user_3 := sample_user_1;
  END IF;
  IF sample_admin IS NULL THEN
    sample_admin := sample_user_1;
  END IF;

  -- =================================================================
  -- 1. 成功したログイン履歴（最近30日間）
  -- =================================================================

  -- ユーザー1のログイン履歴（複数回）
  INSERT INTO public.login_history (
    user_id, login_status, ip_address, user_agent, login_at, logout_at, created_at
  ) VALUES
  -- 今日のログイン
  (
    sample_user_1,
    'success',
    '192.168.1.100'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '2 hours'
  ),
  -- 昨日のログイン
  (
    sample_user_1,
    'success',
    '192.168.1.100'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    NOW() - INTERVAL '1 day 3 hours',
    NOW() - INTERVAL '1 day 1 hour',
    NOW() - INTERVAL '1 day 3 hours'
  ),
  -- 3日前のログイン
  (
    sample_user_1,
    'success',
    '192.168.1.105'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    NOW() - INTERVAL '3 days 5 hours',
    NOW() - INTERVAL '3 days 2 hours',
    NOW() - INTERVAL '3 days 5 hours'
  ),
  -- 5日前のログイン（ログアウトしていない）
  (
    sample_user_1,
    'success',
    '192.168.1.100'::INET,
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    NOW() - INTERVAL '5 days 8 hours',
    NULL,
    NOW() - INTERVAL '5 days 8 hours'
  ),
  -- 7日前のログイン
  (
    sample_user_1,
    'success',
    '203.0.113.45'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    NOW() - INTERVAL '7 days 10 hours',
    NOW() - INTERVAL '7 days 8 hours',
    NOW() - INTERVAL '7 days 10 hours'
  ),
  -- 10日前のログイン
  (
    sample_user_1,
    'success',
    '192.168.1.100'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    NOW() - INTERVAL '10 days 12 hours',
    NOW() - INTERVAL '10 days 10 hours',
    NOW() - INTERVAL '10 days 12 hours'
  ),
  -- 14日前のログイン
  (
    sample_user_1,
    'success',
    '198.51.100.23'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    NOW() - INTERVAL '14 days 15 hours',
    NOW() - INTERVAL '14 days 13 hours',
    NOW() - INTERVAL '14 days 15 hours'
  ),
  -- 20日前のログイン
  (
    sample_user_1,
    'success',
    '192.168.1.100'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    NOW() - INTERVAL '20 days 18 hours',
    NOW() - INTERVAL '20 days 16 hours',
    NOW() - INTERVAL '20 days 18 hours'
  ),
  -- 25日前のログイン
  (
    sample_user_1,
    'success',
    '203.0.113.45'::INET,
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    NOW() - INTERVAL '25 days 20 hours',
    NOW() - INTERVAL '25 days 18 hours',
    NOW() - INTERVAL '25 days 20 hours'
  ),
  -- 30日前のログイン
  (
    sample_user_1,
    'success',
    '192.168.1.100'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    NOW() - INTERVAL '30 days 22 hours',
    NOW() - INTERVAL '30 days 20 hours',
    NOW() - INTERVAL '30 days 22 hours'
  );

  -- ユーザー2のログイン履歴
  INSERT INTO public.login_history (
    user_id, login_status, ip_address, user_agent, login_at, logout_at, created_at
  ) VALUES
  -- 今日のログイン
  (
    sample_user_2,
    'success',
    '10.0.0.50'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    NOW() - INTERVAL '4 hours',
    NULL,
    NOW() - INTERVAL '4 hours'
  ),
  -- 2日前のログイン
  (
    sample_user_2,
    'success',
    '10.0.0.50'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    NOW() - INTERVAL '2 days 6 hours',
    NOW() - INTERVAL '2 days 4 hours',
    NOW() - INTERVAL '2 days 6 hours'
  ),
  -- 6日前のログイン
  (
    sample_user_2,
    'success',
    '172.16.0.25'::INET,
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    NOW() - INTERVAL '6 days 9 hours',
    NOW() - INTERVAL '6 days 7 hours',
    NOW() - INTERVAL '6 days 9 hours'
  ),
  -- 12日前のログイン
  (
    sample_user_2,
    'success',
    '10.0.0.50'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    NOW() - INTERVAL '12 days 11 hours',
    NOW() - INTERVAL '12 days 9 hours',
    NOW() - INTERVAL '12 days 11 hours'
  ),
  -- 18日前のログイン
  (
    sample_user_2,
    'success',
    '198.51.100.67'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    NOW() - INTERVAL '18 days 14 hours',
    NOW() - INTERVAL '18 days 12 hours',
    NOW() - INTERVAL '18 days 14 hours'
  ),
  -- 24日前のログイン
  (
    sample_user_2,
    'success',
    '10.0.0.50'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    NOW() - INTERVAL '24 days 16 hours',
    NOW() - INTERVAL '24 days 14 hours',
    NOW() - INTERVAL '24 days 16 hours'
  );

  -- ユーザー3のログイン履歴
  INSERT INTO public.login_history (
    user_id, login_status, ip_address, user_agent, login_at, logout_at, created_at
  ) VALUES
  -- 昨日のログイン
  (
    sample_user_3,
    'success',
    '192.168.0.200'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    NOW() - INTERVAL '1 day 7 hours',
    NOW() - INTERVAL '1 day 5 hours',
    NOW() - INTERVAL '1 day 7 hours'
  ),
  -- 4日前のログイン
  (
    sample_user_3,
    'success',
    '192.168.0.200'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    NOW() - INTERVAL '4 days 13 hours',
    NOW() - INTERVAL '4 days 11 hours',
    NOW() - INTERVAL '4 days 13 hours'
  ),
  -- 8日前のログイン
  (
    sample_user_3,
    'success',
    '203.0.113.78'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    NOW() - INTERVAL '8 days 17 hours',
    NOW() - INTERVAL '8 days 15 hours',
    NOW() - INTERVAL '8 days 17 hours'
  ),
  -- 15日前のログイン
  (
    sample_user_3,
    'success',
    '192.168.0.200'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    NOW() - INTERVAL '15 days 19 hours',
    NOW() - INTERVAL '15 days 17 hours',
    NOW() - INTERVAL '15 days 19 hours'
  ),
  -- 22日前のログイン
  (
    sample_user_3,
    'success',
    '198.51.100.89'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    NOW() - INTERVAL '22 days 21 hours',
    NOW() - INTERVAL '22 days 19 hours',
    NOW() - INTERVAL '22 days 21 hours'
  );

  -- 管理者のログイン履歴
  INSERT INTO public.login_history (
    user_id, login_status, ip_address, user_agent, login_at, logout_at, created_at
  ) VALUES
  -- 今日のログイン
  (
    sample_admin,
    'success',
    '192.168.1.1'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    NOW() - INTERVAL '1 hour',
    NULL,
    NOW() - INTERVAL '1 hour'
  ),
  -- 昨日のログイン
  (
    sample_admin,
    'success',
    '192.168.1.1'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    NOW() - INTERVAL '1 day 2 hours',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day 2 hours'
  ),
  -- 3日前のログイン
  (
    sample_admin,
    'success',
    '10.0.0.1'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    NOW() - INTERVAL '3 days 4 hours',
    NOW() - INTERVAL '3 days 2 hours',
    NOW() - INTERVAL '3 days 4 hours'
  ),
  -- 7日前のログイン
  (
    sample_admin,
    'success',
    '192.168.1.1'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    NOW() - INTERVAL '7 days 6 hours',
    NOW() - INTERVAL '7 days 4 hours',
    NOW() - INTERVAL '7 days 6 hours'
  ),
  -- 14日前のログイン
  (
    sample_admin,
    'success',
    '10.0.0.1'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    NOW() - INTERVAL '14 days 8 hours',
    NOW() - INTERVAL '14 days 6 hours',
    NOW() - INTERVAL '14 days 8 hours'
  ),
  -- 21日前のログイン
  (
    sample_admin,
    'success',
    '192.168.1.1'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    NOW() - INTERVAL '21 days 10 hours',
    NOW() - INTERVAL '21 days 8 hours',
    NOW() - INTERVAL '21 days 10 hours'
  );

  -- =================================================================
  -- 2. 失敗したログイン履歴
  -- =================================================================

  INSERT INTO public.login_history (
    user_id, login_status, ip_address, user_agent, failure_reason, login_at, created_at
  ) VALUES
  -- ユーザー1の失敗ログイン（パスワード間違い）
  (
    sample_user_1,
    'failed',
    '192.168.1.100'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Invalid password',
    NOW() - INTERVAL '1 day 1 hour',
    NOW() - INTERVAL '1 day 1 hour'
  ),
  -- ユーザー1の失敗ログイン（存在しないユーザー）
  (
    NULL,
    'failed',
    '203.0.113.100'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'User not found',
    NOW() - INTERVAL '2 days 3 hours',
    NOW() - INTERVAL '2 days 3 hours'
  ),
  -- ユーザー2の失敗ログイン（パスワード間違い）
  (
    sample_user_2,
    'failed',
    '10.0.0.50'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Invalid password',
    NOW() - INTERVAL '3 days 5 hours',
    NOW() - INTERVAL '3 days 5 hours'
  ),
  -- ユーザー2の失敗ログイン（アカウントロック）
  (
    sample_user_2,
    'failed',
    '10.0.0.50'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Account temporarily locked',
    NOW() - INTERVAL '3 days 4 hours 50 minutes',
    NOW() - INTERVAL '3 days 4 hours 50 minutes'
  ),
  -- ユーザー3の失敗ログイン（パスワード間違い）
  (
    sample_user_3,
    'failed',
    '192.168.0.200'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Invalid password',
    NOW() - INTERVAL '5 days 7 hours',
    NOW() - INTERVAL '5 days 7 hours'
  ),
  -- 匿名ユーザーの失敗ログイン（存在しないメールアドレス）
  (
    NULL,
    'failed',
    '198.51.100.150'::INET,
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Email not found',
    NOW() - INTERVAL '6 days 9 hours',
    NOW() - INTERVAL '6 days 9 hours'
  ),
  -- 管理者の失敗ログイン（2FA認証失敗）
  (
    sample_admin,
    'failed',
    '192.168.1.1'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    '2FA verification failed',
    NOW() - INTERVAL '8 days 11 hours',
    NOW() - INTERVAL '8 days 11 hours'
  ),
  -- ユーザー1の失敗ログイン（セッションタイムアウト）
  (
    sample_user_1,
    'failed',
    '192.168.1.100'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Session expired',
    NOW() - INTERVAL '11 days 13 hours',
    NOW() - INTERVAL '11 days 13 hours'
  ),
  -- ユーザー2の失敗ログイン（パスワード間違い）
  (
    sample_user_2,
    'failed',
    '172.16.0.25'::INET,
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Invalid password',
    NOW() - INTERVAL '13 days 15 hours',
    NOW() - INTERVAL '13 days 15 hours'
  ),
  -- 匿名ユーザーの失敗ログイン（不正なリクエスト）
  (
    NULL,
    'failed',
    '203.0.113.200'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Invalid request format',
    NOW() - INTERVAL '16 days 17 hours',
    NOW() - INTERVAL '16 days 17 hours'
  );

  -- =================================================================
  -- 3. ログアウト履歴
  -- =================================================================

  INSERT INTO public.login_history (
    user_id, login_status, ip_address, user_agent, login_at, logout_at, created_at
  ) VALUES
  -- ユーザー1のログアウト
  (
    sample_user_1,
    'logout',
    '192.168.1.100'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    NOW() - INTERVAL '1 day 5 hours',
    NOW() - INTERVAL '1 day 4 hours 30 minutes',
    NOW() - INTERVAL '1 day 5 hours'
  ),
  -- ユーザー2のログアウト
  (
    sample_user_2,
    'logout',
    '10.0.0.50'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    NOW() - INTERVAL '2 days 8 hours',
    NOW() - INTERVAL '2 days 7 hours 45 minutes',
    NOW() - INTERVAL '2 days 8 hours'
  ),
  -- ユーザー3のログアウト
  (
    sample_user_3,
    'logout',
    '192.168.0.200'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    NOW() - INTERVAL '4 days 10 hours',
    NOW() - INTERVAL '4 days 9 hours 20 minutes',
    NOW() - INTERVAL '4 days 10 hours'
  ),
  -- 管理者のログアウト
  (
    sample_admin,
    'logout',
    '192.168.1.1'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    NOW() - INTERVAL '5 days 12 hours',
    NOW() - INTERVAL '5 days 11 hours 15 minutes',
    NOW() - INTERVAL '5 days 12 hours'
  ),
  -- ユーザー1のログアウト（別のセッション）
  (
    sample_user_1,
    'logout',
    '203.0.113.45'::INET,
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    NOW() - INTERVAL '9 days 14 hours',
    NOW() - INTERVAL '9 days 13 hours 30 minutes',
    NOW() - INTERVAL '9 days 14 hours'
  ),
  -- ユーザー2のログアウト
  (
    sample_user_2,
    'logout',
    '198.51.100.67'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    NOW() - INTERVAL '11 days 16 hours',
    NOW() - INTERVAL '11 days 15 hours 45 minutes',
    NOW() - INTERVAL '11 days 16 hours'
  ),
  -- ユーザー3のログアウト
  (
    sample_user_3,
    'logout',
    '192.168.0.200'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    NOW() - INTERVAL '17 days 18 hours',
    NOW() - INTERVAL '17 days 17 hours 10 minutes',
    NOW() - INTERVAL '17 days 18 hours'
  ),
  -- 管理者のログアウト
  (
    sample_admin,
    'logout',
    '10.0.0.1'::INET,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    NOW() - INTERVAL '19 days 20 hours',
    NOW() - INTERVAL '19 days 19 hours 25 minutes',
    NOW() - INTERVAL '19 days 20 hours'
  );

  RAISE NOTICE 'ログイン履歴のサンプルデータの作成が完了しました。';
  RAISE NOTICE '作成されたログイン履歴数:';
  RAISE NOTICE '  - 成功したログイン: 約30件';
  RAISE NOTICE '  - 失敗したログイン: 10件';
  RAISE NOTICE '  - ログアウト: 8件';
  RAISE NOTICE '  - 合計: 約48件';

END $$;

