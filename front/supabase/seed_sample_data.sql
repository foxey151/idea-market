-- Seed file: サンプルデータの作成
-- 作成日: 2025-10-12
-- 説明: アイデアマーケットプレイスのサンプルデータ（購入可能、購入済み、期限切れなど様々なバリエーション）

-- =================================================================
-- 注意事項
-- =================================================================
-- このファイルを実行する前に、既存のユーザー（profiles）が存在することを確認してください。
-- 既存のユーザーIDを使用するか、以下のUUIDを既存のユーザーIDに置き換えてください。

-- =================================================================
-- 1. サンプルユーザーIDの定義（既存のユーザーIDに置き換えてください）
-- =================================================================

-- サンプル用のUUID（実際のユーザーIDに置き換える必要があります）
-- 既存のユーザーがいる場合は、そのIDを使用してください
DO $$
DECLARE
  -- 既存のユーザーを取得（いない場合は固定UUIDを使用）
  sample_author_1 UUID;
  sample_author_2 UUID;
  sample_author_3 UUID;
  sample_buyer_1 UUID;
  sample_buyer_2 UUID;
  sample_buyer_3 UUID;
BEGIN
  -- 既存のユーザーを取得（最初の3人を著者として使用、いない場合は同じユーザーを使用）
  SELECT id INTO sample_author_1 FROM public.profiles LIMIT 1 OFFSET 0;
  SELECT id INTO sample_author_2 FROM public.profiles LIMIT 1 OFFSET 1;
  SELECT id INTO sample_author_3 FROM public.profiles LIMIT 1 OFFSET 2;
  
  -- ユーザーが1人しかいない場合は、同じユーザーを使用
  IF sample_author_2 IS NULL THEN
    sample_author_2 := sample_author_1;
  END IF;
  IF sample_author_3 IS NULL THEN
    sample_author_3 := sample_author_1;
  END IF;
  
  -- 購入者として使用（著者と同じでも可）
  sample_buyer_1 := sample_author_1;
  sample_buyer_2 := COALESCE(sample_author_2, sample_author_1);
  sample_buyer_3 := COALESCE(sample_author_3, sample_author_1);
  
  -- ユーザーがいない場合は警告を出して終了
  IF sample_author_1 IS NULL THEN
    RAISE NOTICE '警告: profilesテーブルにユーザーが存在しません。先にユーザーを作成してください。';
    RETURN;
  END IF;

  -- =================================================================
  -- 2. アイデアのサンプルデータ作成
  -- =================================================================

  -- 1. 購入可能なアイデア（published, 独占契約なし、購入回数0）
  INSERT INTO public.ideas (
    author_id, mmb_no, title, summary, detail, attachments, deadline, status, price, special, is_exclusive, purchase_count
  ) VALUES
  (
    sample_author_1,
    'MMB-2510120001',
    'AIを活用した効率的な在庫管理システム',
    '機械学習を用いて需要予測を行い、最適な在庫量を自動調整するシステムです。',
    '詳細な技術仕様書、API設計、データベース設計を含む完全な実装ガイドを提供します。',
    ARRAY[]::TEXT[],
    NOW() + INTERVAL '30 days',
    'published',
    '10000'::public.price_enum,
    NULL,
    false,
    0
  ),
  (
    sample_author_1,
    'MMB-2510120002',
    'SNS連携型の顧客管理アプリ',
    'Instagram、Twitter、Facebookと連携し、顧客の行動を一元管理できるアプリケーションです。',
    'UI/UXデザイン、バックエンドAPI、フロントエンド実装の詳細なドキュメントを提供します。',
    ARRAY[]::TEXT[],
    NOW() + INTERVAL '45 days',
    'published',
    '5000'::public.price_enum,
    '早期購入特典あり',
    false,
    0
  ),
  (
    sample_author_2,
    'MMB-2510120003',
    'ブロックチェーンを使ったサプライチェーン管理',
    '透明性とトレーサビリティを実現する、食品業界向けのサプライチェーン管理システムです。',
    'スマートコントラクトの実装コード、システムアーキテクチャ、導入ガイドを含みます。',
    ARRAY[]::TEXT[],
    NOW() + INTERVAL '60 days',
    'published',
    '50000'::public.price_enum,
    NULL,
    false,
    0
  );

  -- 2. 購入可能なアイデア（closed, 完成済み）
  -- idea-buyページで表示されるため、購入回数を設定可能
  INSERT INTO public.ideas (
    author_id, mmb_no, title, summary, detail, attachments, deadline, status, price, special, is_exclusive, purchase_count
  ) VALUES
  (
    sample_author_2,
    'MMB-2510120004',
    'モバイル決済アプリの完全実装',
    'QRコード決済、NFC決済、ポイント還元機能を統合したモバイル決済アプリです。',
    '完全なソースコード、テストコード、デプロイ手順書を含むパッケージです。',
    ARRAY[]::TEXT[],
    NOW() - INTERVAL '10 days',
    'closed',
    '30000'::public.price_enum,
    '技術サポート3ヶ月付き',
    false,
    2  -- idea-buyページで表示されるため購入回数を設定
  ),
  (
    sample_author_3,
    'MMB-2510120005',
    'IoTデバイス向けのリアルタイム監視システム',
    'センサーデータを収集し、異常を検知してアラートを送信するシステムです。',
    'ハードウェア設計図、ファームウェアコード、クラウドインフラ設定を含みます。',
    ARRAY[]::TEXT[],
    NOW() - INTERVAL '5 days',
    'closed',
    '30000'::public.price_enum,
    NULL,
    false,
    1  -- idea-buyページで表示されるため購入回数を設定
  );

  -- 3. 独占契約で購入済み（is_exclusive=true, status=soldout）
  INSERT INTO public.ideas (
    author_id, mmb_no, title, summary, detail, attachments, deadline, status, price, special, is_exclusive, purchase_count
  ) VALUES
  (
    sample_author_1,
    'MMB-2510120006',
    '次世代ECプラットフォームの設計',
    'AIレコメンデーション、動的価格設定、パーソナライゼーション機能を持つECプラットフォームです。',
    'システム設計書、技術仕様書、実装ガイドを含む完全なドキュメントセットです。',
    ARRAY[]::TEXT[],
    NOW() + INTERVAL '20 days',
    'soldout',
    '50000'::public.price_enum,
    '独占契約',
    true,
    0
  ),
  (
    sample_author_2,
    'MMB-2510120007',
    '医療機関向け電子カルテシステム',
    'セキュリティと使いやすさを両立した、クラウドベースの電子カルテシステムです。',
    'HIPAA準拠の設計、セキュリティ実装ガイド、導入マニュアルを含みます。',
    ARRAY[]::TEXT[],
    NOW() + INTERVAL '15 days',
    'soldout',
    '50000'::public.price_enum,
    '独占契約・医療機関限定',
    true,
    0
  );

  -- 4. 通常購入のアイデア（is_exclusive=false, purchase_count=0）
  -- アイデア一覧（published）で表示されるアイデアは購入回数を0にする
  INSERT INTO public.ideas (
    author_id, mmb_no, title, summary, detail, attachments, deadline, status, price, special, is_exclusive, purchase_count
  ) VALUES
  (
    sample_author_3,
    'MMB-2510120008',
    'SaaS型プロジェクト管理ツール',
    'チームコラボレーションを強化する、直感的なプロジェクト管理ツールです。',
    'フロントエンド・バックエンドの完全な実装、デプロイ手順、運用マニュアルを含みます。',
    ARRAY[]::TEXT[],
    NOW() + INTERVAL '40 days',
    'published',
    '10000'::public.price_enum,
    '人気商品',
    false,
    0  -- アイデア一覧で表示されるため購入回数は0
  ),
  (
    sample_author_1,
    'MMB-2510120009',
    '動画配信プラットフォームの構築',
    'Netflixのような動画配信サービスを構築するための完全なソリューションです。',
    'CDN設定、動画エンコーディング、ストリーミング実装の詳細なガイドを含みます。',
    ARRAY[]::TEXT[],
    NOW() + INTERVAL '50 days',
    'published',
    '30000'::public.price_enum,
    NULL,
    false,
    0  -- アイデア一覧で表示されるため購入回数は0
  ),
  (
    sample_author_2,
    'MMB-2510120010',
    'チャットボット構築フレームワーク',
    '自然言語処理を活用した、カスタマイズ可能なチャットボット構築フレームワークです。',
    'NLPモデルの実装、学習データの準備方法、デプロイ手順を含みます。',
    ARRAY[]::TEXT[],
    NOW() + INTERVAL '35 days',
    'published',
    '5000'::public.price_enum,
    '初心者向け',
    false,
    0  -- アイデア一覧で表示されるため購入回数は0
  );

  -- 5. 期限切れアイデア（overdue）
  INSERT INTO public.ideas (
    author_id, mmb_no, title, summary, detail, attachments, deadline, status, price, special, is_exclusive, purchase_count
  ) VALUES
  (
    sample_author_3,
    'MMB-2510120011',
    'レガシーシステムのモダン化手法',
    '既存のCOBOLシステムをマイクロサービスアーキテクチャに移行する手法です。',
    '移行戦略、実装手順、リスク管理の詳細なドキュメントを含みます。',
    ARRAY[]::TEXT[],
    NOW() - INTERVAL '5 days',
    'overdue',
    '30000'::public.price_enum,
    NULL,
    false,
    0
  ),
  (
    sample_author_1,
    'MMB-2510120012',
    'クラウドネイティブアプリケーション設計',
    'Kubernetes、Docker、CI/CDパイプラインを活用したアプリケーション設計です。',
    'インフラ設計、デプロイ自動化、モニタリング設定の完全なガイドを含みます。',
    ARRAY[]::TEXT[],
    NOW() - INTERVAL '10 days',
    'overdue',
    '10000'::public.price_enum,
    NULL,
    false,
    0
  );

  -- 6. 様々な価格帯のアイデア
  INSERT INTO public.ideas (
    author_id, mmb_no, title, summary, detail, attachments, deadline, status, price, special, is_exclusive, purchase_count
  ) VALUES
  (
    sample_author_2,
    'MMB-2510120013',
    'シンプルなToDoアプリの実装',
    'ReactとNode.jsを使った基本的なToDoアプリケーションの実装です。',
    '初心者向けの詳細なコメント付きソースコードと実装ガイドを含みます。',
    ARRAY[]::TEXT[],
    NOW() + INTERVAL '25 days',
    'published',
    '3000'::public.price_enum,
    '初心者向け',
    false,
    0  -- アイデア一覧で表示されるため購入回数は0
  ),
  (
    sample_author_3,
    'MMB-2510120014',
    'エンタープライズ向けCRMシステム',
    '大規模企業向けのカスタマイズ可能なCRMシステムの設計と実装です。',
    'スケーラブルなアーキテクチャ設計、実装コード、テスト戦略を含む包括的なパッケージです。',
    ARRAY[]::TEXT[],
    NOW() + INTERVAL '55 days',
    'published',
    '50000'::public.price_enum,
    'エンタープライズ向け',
    false,
    0  -- アイデア一覧で表示されるため購入回数は0
  );

  -- =================================================================
  -- 3. 購入履歴（purchases）のサンプルデータ作成
  -- =================================================================

  -- 購入履歴を作成（複数回購入済みのアイデアに対して）
  INSERT INTO public.purchases (
    buyer_id, idea_id, amount, invoice_url, status, paid_at
  )
  SELECT 
    sample_buyer_1,
    id,
    CASE price::text
      WHEN '3000' THEN 3000
      WHEN '5000' THEN 5000
      WHEN '10000' THEN 10000
      WHEN '30000' THEN 30000
      WHEN '50000' THEN 50000
    END,
    'https://example.com/invoice/' || id::text,
    'succeeded'::public.purchase_status,
    NOW() - INTERVAL '10 days'
  FROM public.ideas
  WHERE mmb_no IN ('MMB-2510120008', 'MMB-2510120009', 'MMB-2510120010', 'MMB-2510120013', 'MMB-2510120014')
  LIMIT 5;

  -- =================================================================
  -- 4. 購入済みレコード（sold）のサンプルデータ作成
  -- =================================================================

  -- 独占契約で購入済みのアイデアのsoldレコード
  INSERT INTO public.sold (
    idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline
  )
  SELECT 
    i.id,
    sample_buyer_1,
    false,
    '09012345678',
    'サンプル株式会社',
    '山田太郎',
    NOW() + INTERVAL '5 days'
  FROM public.ideas i
  WHERE i.mmb_no = 'MMB-2510120006';

  INSERT INTO public.sold (
    idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline
  )
  SELECT 
    i.id,
    sample_buyer_2,
    true,
    '09087654321',
    'テスト医療法人',
    '佐藤花子',
    NOW() - INTERVAL '2 days'
  FROM public.ideas i
  WHERE i.mmb_no = 'MMB-2510120007';

  -- closedステータスのアイデアのsoldレコード（idea-buyページで購入回数を表示するため）
  INSERT INTO public.sold (
    idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline
  )
  SELECT 
    i.id,
    sample_buyer_1,
    true,
    '09044445555',
    '決済アプリ開発株式会社',
    '開発担当',
    NOW() - INTERVAL '8 days'
  FROM public.ideas i
  WHERE i.mmb_no = 'MMB-2510120004'
    AND NOT EXISTS (SELECT 1 FROM public.sold WHERE idea_id = i.id AND user_id = sample_buyer_1 AND phone_number = '09044445555');

  INSERT INTO public.sold (
    idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline
  )
  SELECT 
    i.id,
    sample_buyer_2,
    true,
    '09055556666',
    '決済アプリ開発株式会社',
    '開発担当2',
    NOW() - INTERVAL '6 days'
  FROM public.ideas i
  WHERE i.mmb_no = 'MMB-2510120004'
    AND NOT EXISTS (SELECT 1 FROM public.sold WHERE idea_id = i.id AND user_id = sample_buyer_2 AND phone_number = '09055556666');

  INSERT INTO public.sold (
    idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline
  )
  SELECT 
    i.id,
    sample_buyer_1,
    true,
    '09066667777',
    'IoT開発株式会社',
    'IoT担当',
    NOW() - INTERVAL '3 days'
  FROM public.ideas i
  WHERE i.mmb_no = 'MMB-2510120005'
    AND NOT EXISTS (SELECT 1 FROM public.sold WHERE idea_id = i.id AND user_id = sample_buyer_1 AND phone_number = '09066667777');

  -- 通常購入で複数回購入済みのアイデアのsoldレコード（複数件）
  INSERT INTO public.sold (
    idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline
  )
  SELECT 
    i.id,
    sample_buyer_1,
    true,
    '09011111111',
    '株式会社A',
    '鈴木一郎',
    NOW() - INTERVAL '15 days'
  FROM public.ideas i
  WHERE i.mmb_no = 'MMB-2510120008';

  INSERT INTO public.sold (
    idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline
  )
  SELECT 
    i.id,
    sample_buyer_2,
    false,
    '09022222222',
    '株式会社B',
    '高橋次郎',
    NOW() + INTERVAL '3 days'
  FROM public.ideas i
  WHERE i.mmb_no = 'MMB-2510120008';

  INSERT INTO public.sold (
    idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline
  )
  SELECT 
    i.id,
    sample_buyer_3,
    true,
    '09033333333',
    '株式会社C',
    '伊藤三郎',
    NOW() - INTERVAL '8 days'
  FROM public.ideas i
  WHERE i.mmb_no = 'MMB-2510120008';

  INSERT INTO public.sold (
    idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline
  )
  SELECT 
    i.id,
    sample_buyer_1,
    true,
    '09044444444',
    '株式会社D',
    '渡辺四郎',
    NOW() - INTERVAL '12 days'
  FROM public.ideas i
  WHERE i.mmb_no = 'MMB-2510120008';

  INSERT INTO public.sold (
    idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline
  )
  SELECT 
    i.id,
    sample_buyer_2,
    false,
    '09055555555',
    '株式会社E',
    '中村五郎',
    NOW() + INTERVAL '2 days'
  FROM public.ideas i
  WHERE i.mmb_no = 'MMB-2510120008';

  -- 他の複数回購入済みアイデアのsoldレコード
  INSERT INTO public.sold (
    idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline
  )
  SELECT 
    i.id,
    sample_buyer_1,
    true,
    '09066666666',
    '株式会社F',
    '小林六郎',
    NOW() - INTERVAL '20 days'
  FROM public.ideas i
  WHERE i.mmb_no = 'MMB-2510120009';

  INSERT INTO public.sold (
    idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline
  )
  SELECT 
    i.id,
    sample_buyer_2,
    true,
    '09077777777',
    '株式会社G',
    '加藤七郎',
    NOW() - INTERVAL '18 days'
  FROM public.ideas i
  WHERE i.mmb_no = 'MMB-2510120009';

  INSERT INTO public.sold (
    idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline
  )
  SELECT 
    i.id,
    sample_buyer_3,
    false,
    '09088888888',
    '株式会社H',
    '吉田八郎',
    NOW() + INTERVAL '1 day'
  FROM public.ideas i
  WHERE i.mmb_no = 'MMB-2510120009';

  -- MMB-2510120010のsoldレコード（8回購入済み）
  INSERT INTO public.sold (
    idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline
  )
  SELECT 
    i.id,
    sample_buyer_1,
    true,
    '09099999999',
    '株式会社I',
    '山本九郎',
    NOW() - INTERVAL '25 days'
  FROM public.ideas i
  WHERE i.mmb_no = 'MMB-2510120010';

  INSERT INTO public.sold (
    idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline
  )
  SELECT 
    i.id,
    sample_buyer_2,
    true,
    '09000000000',
    '株式会社J',
    '松本十郎',
    NOW() - INTERVAL '22 days'
  FROM public.ideas i
  WHERE i.mmb_no = 'MMB-2510120010';

  -- MMB-2510120013のsoldレコード（2回購入済み）
  INSERT INTO public.sold (
    idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline
  )
  SELECT 
    i.id,
    sample_buyer_1,
    true,
    '09011112222',
    '株式会社K',
    '井上十一郎',
    NOW() - INTERVAL '5 days'
  FROM public.ideas i
  WHERE i.mmb_no = 'MMB-2510120013';

  INSERT INTO public.sold (
    idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline
  )
  SELECT 
    i.id,
    sample_buyer_2,
    false,
    '09022223333',
    '株式会社L',
    '木村十二郎',
    NOW() + INTERVAL '4 days'
  FROM public.ideas i
  WHERE i.mmb_no = 'MMB-2510120013';

  -- MMB-2510120014のsoldレコード（1回購入済み）
  INSERT INTO public.sold (
    idea_id, user_id, is_paid, phone_number, company, manager, payment_deadline
  )
  SELECT 
    i.id,
    sample_buyer_1,
    true,
    '09033334444',
    'エンタープライズ株式会社',
    '社長',
    NOW() - INTERVAL '3 days'
  FROM public.ideas i
  WHERE i.mmb_no = 'MMB-2510120014';

  RAISE NOTICE 'サンプルデータの作成が完了しました。';
  RAISE NOTICE '作成されたアイデア数: 14件';
  RAISE NOTICE '  - 購入可能（published）: 7件';
  RAISE NOTICE '  - 完成済み（closed）: 2件';
  RAISE NOTICE '  - 独占契約で購入済み（soldout）: 2件';
  RAISE NOTICE '  - 期限切れ（overdue）: 2件';
  RAISE NOTICE '  - 複数回購入済み（purchase_count > 0）: 5件';

END $$;

