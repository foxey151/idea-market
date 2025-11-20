# Supabaseプロジェクト移行手順書

## 概要
本ドキュメントは、Supabaseプロジェクトの移行手順を記載しています。
本番データは移行せず、テーブル定義、RLSポリシー、Storage設定、Authentication設定のみを移行します。

## 現在のプロジェクト情報

### プロジェクト基本情報
- **プロジェクトID**: `imjqecithlgsjhhkbkbn`
- **プロジェクト名**: `ideaMarket`
- **リージョン**: `ap-northeast-1`
- **ステータス**: `ACTIVE_HEALTHY`
- **データベースバージョン**: PostgreSQL 17.4.1.074
- **API URL**: `https://imjqecithlgsjhhkbkbn.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltanFlY2l0aGxnc2poaGtia2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTkyMDgsImV4cCI6MjA3MTgzNTIwOH0.iRSgJTNlRJKjaf12VyjrF5NSxYPst1fbhZv3m_Z4XtU`

### 組織情報
- **組織ID**: `bijqmshejhpxfmdzrvkk`

---

## 移行手順

### ステップ1: 新しいプロジェクトの作成

1. Supabaseダッシュボードにログイン
2. 新しいプロジェクトを作成
   - プロジェクト名: 任意（例: `ideaMarket-production`）
   - リージョン: `ap-northeast-1`（既存と同じ）
   - データベースパスワード: 安全なパスワードを設定

### ステップ2: マイグレーションファイルの適用

既存のマイグレーションファイルを新しいプロジェクトに適用します。

#### マイグレーションファイル一覧（適用順）

1. `20250902000022_create_pages_content_table.sql`
2. `20250911000001_extensions_and_enums.sql`
3. `20250911000002_profiles_table.sql`
4. `20250911000003_user_details_table.sql`
5. `20250911000004_mmb_counters_table.sql`
6. `20250911000005_ideas_table.sql`
7. `20250911000006_idea_versions_table.sql`
8. `20250911000007_comments_table.sql`
9. `20250911000008_purchases_table.sql`
10. `20250911000009_audit_logs_table.sql`
11. `20250911000010_blog_views_tables.sql`
12. `20250911000011_storage_setup.sql`
13. `20250911000012_rls_policies.sql`
14. `20250911000013_search_functions.sql`
15. `20251012000014_sold_table_and_status.sql`
16. `20251012000015_admin_sold_policies.sql`
17. `20251012000016_admin_user_details_policies.sql`
18. `20251012000017_cancel_purchase_function.sql`
19. `20251012000018_add_payment_deadline_to_sold.sql`
20. `20251012000019_update_purchase_idea_with_deadline.sql`
21. `20251012000020_auto_cancel_overdue_purchases.sql`
21. `20251012000021_restore_idea_on_sold_delete.sql`

#### 適用方法

**方法1: Supabase CLIを使用（推奨）**

```bash
# 新しいプロジェクトのリモートURLを設定
supabase link --project-ref <新しいプロジェクトのref>

# マイグレーションを適用
supabase db push
```

**方法2: Supabaseダッシュボードを使用**

1. Supabaseダッシュボードの「SQL Editor」を開く
2. 各マイグレーションファイルの内容を順番に実行

### ステップ3: 拡張機能の確認

以下の拡張機能が有効になっていることを確認してください：

- `uuid-ossp` (extensionsスキーマ)
- `pgcrypto` (extensionsスキーマ)
- `pg_trgm` (publicスキーマ)
- `btree_gin` (publicスキーマ)
- `pg_stat_statements` (extensionsスキーマ)
- `pg_graphql` (graphqlスキーマ)
- `supabase_vault` (vaultスキーマ)

### ステップ4: Storageバケットの設定

以下のStorageバケットを作成します：

1. **ideas** バケット
   - Public: `true`
   - File size limit: なし（デフォルト）

2. **avatars** バケット
   - Public: `true`
   - File size limit: なし（デフォルト）

3. **attachments** バケット
   - Public: `true`
   - File size limit: なし（デフォルト）

Storageポリシーは `20250911000011_storage_setup.sql` で設定されます。

### ステップ5: Authentication設定の移行

#### 5.1 Email認証設定

Supabaseダッシュボードの「Authentication」→「Settings」で以下を設定：

- **Enable email signup**: `true`
- **Enable email confirmations**: `true`
- **Double confirm email changes**: `true`
- **Site URL**: 本番環境のURL（例: `https://yourdomain.com`）
- **Additional Redirect URLs**: 必要に応じて追加

#### 5.2 外部認証プロバイダー

現在のプロジェクトでは外部認証プロバイダーは無効になっています。
必要に応じて、新しいプロジェクトでも同様に設定してください。

#### 5.3 JWT設定

- **JWT expiry**: `3600` (1時間)
- **Refresh token rotation**: 有効（デフォルト）

### ステップ6: RLSポリシーの確認

すべてのテーブルでRLSが有効になっていることを確認してください。

#### RLSが有効なテーブル

- `profiles`
- `user_details`
- `ideas`
- `idea_versions`
- `comments`
- `audit_logs`
- `blog_views`
- `blog_view_counts`
- `sold`

RLSが無効なテーブル：
- `mmb_counters`
- `pages_content`

### ステップ7: カスタム関数の確認

以下のカスタム関数が作成されていることを確認してください：

1. `create_monthly_partition()` - 月次パーティション作成
2. `generate_mmb_no()` - MMB番号生成
3. `handle_new_user()` - 新規ユーザー作成時のトリガー関数
4. `purchase_idea()` - アイデア購入処理
5. `restore_idea_on_sold_delete()` - sold削除時のアイデア復元
6. `search_ideas()` - アイデア検索（全文検索）
7. `search_ideas_simple()` - アイデア検索（簡易版）
8. `search_users()` - ユーザー検索
9. `set_mmb_no()` - MMB番号設定トリガー
10. `set_updated_at()` - updated_at更新トリガー
11. `update_blog_view_count()` - ブログ閲覧数更新

### ステップ8: トリガーの確認

以下のトリガーが設定されていることを確認してください：

1. `trg_ideas_set_mmb_no` - ideasテーブルのINSERT時にMMB番号を設定
2. `trg_ideas_updated_at` - ideasテーブルのUPDATE時にupdated_atを更新
3. `trg_profiles_updated_at` - profilesテーブルのUPDATE時にupdated_atを更新
4. `trg_user_details_updated_at` - user_detailsテーブルのUPDATE時にupdated_atを更新
5. `trg_comments_updated_at` - commentsテーブルのUPDATE時にupdated_atを更新
6. `trg_versions_updated_at` - idea_versionsテーブルのUPDATE時にupdated_atを更新
7. `trg_sold_updated_at` - soldテーブルのUPDATE時にupdated_atを更新
8. `trg_pages_content_updated_at` - pages_contentテーブルのUPDATE時にupdated_atを更新
9. `trg_blog_view_counts_updated_at` - blog_view_countsテーブルのUPDATE時にupdated_atを更新
10. `trg_update_blog_view_count` - blog_viewsテーブルのINSERT時に閲覧数を更新
11. `trg_restore_idea_on_sold_delete` - soldテーブルのDELETE時にアイデアを復元

### ステップ9: 環境変数の更新

フロントエンドアプリケーションの環境変数を更新してください：

```env
NEXT_PUBLIC_SUPABASE_URL=https://<新しいプロジェクトのref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<新しいプロジェクトのanon key>
SUPABASE_SERVICE_ROLE_KEY=<新しいプロジェクトのservice role key>
```

### ステップ10: 動作確認

1. **データベース接続確認**
   - フロントエンドアプリケーションから新しいプロジェクトに接続できることを確認

2. **Authentication動作確認**
   - ユーザー登録が正常に動作することを確認
   - ログインが正常に動作することを確認
   - メール確認が正常に動作することを確認

3. **RLS動作確認**
   - 各テーブルへのアクセス権限が正しく設定されていることを確認
   - 管理者権限が正しく動作することを確認

4. **Storage動作確認**
   - ファイルのアップロードが正常に動作することを確認
   - ファイルのダウンロードが正常に動作することを確認

5. **関数動作確認**
   - カスタム関数が正常に動作することを確認
   - トリガーが正常に動作することを確認

---

## テーブル構造一覧

### profiles
- `id` (uuid, PK, FK → auth.users.id)
- `display_name` (text, nullable)
- `role` (role enum: 'member', 'admin', default: 'member')
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### user_details
- `id` (uuid, PK)
- `user_id` (uuid, unique, FK → profiles.id)
- `full_name` (text, nullable)
- `email` (text, nullable)
- `bank_name` (text, nullable)
- `branch_name` (text, nullable)
- `account_type` (account_type_enum: 'ordinary', 'current', nullable)
- `account_number` (text, nullable)
- `account_holder` (text, nullable)
- `gender` (gender_enum: 'male', 'female', 'other', nullable)
- `birth_date` (date, nullable)
- `prefecture` (prefecture_enum: 47都道府県, nullable)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### ideas
- `id` (uuid, PK)
- `author_id` (uuid, FK → profiles.id)
- `mmb_no` (text, unique)
- `title` (text)
- `summary` (text)
- `detail` (text, nullable)
- `deadline` (timestamptz)
- `price` (price_enum: '3000', '5000', '10000', '30000', '50000', nullable)
- `status` (text, default: 'published', check: 'overdue', 'published', 'closed', 'soldout')
- `attachments` (text[], default: '{}')
- `special` (text, nullable)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### idea_versions
- `id` (uuid, PK)
- `idea_id` (uuid, FK → ideas.id)
- `price` (integer, check: >= 0)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### comments
- `id` (uuid, PK)
- `idea_id` (uuid, FK → ideas.id)
- `author_id` (uuid, FK → profiles.id)
- `text` (text)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### sold
- `id` (uuid, PK)
- `idea_id` (uuid, unique, FK → ideas.id)
- `user_id` (uuid, FK → profiles.id)
- `phone_number` (text, check: 数字のみ)
- `company` (text, nullable)
- `manager` (text, nullable)
- `is_paid` (boolean, default: false)
- `payment_deadline` (timestamptz, nullable)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### audit_logs
- `id` (bigint, PK)
- `created_at` (timestamptz, PK)
- `actor_id` (uuid, nullable)
- `action` (text)
- `entity` (text)
- `entity_id` (uuid, nullable)
- `payload` (jsonb, nullable)

### blog_views
- `id` (uuid, PK)
- `blog_id` (text)
- `user_id` (uuid, nullable, FK → profiles.id)
- `session_id` (text, nullable)
- `ip_address` (inet, nullable)
- `user_agent` (text, nullable)
- `view_date` (date, default: CURRENT_DATE)
- `created_at` (timestamptz, default: now())

### blog_view_counts
- `blog_id` (text, PK)
- `view_count` (integer, default: 0)
- `unique_view_count` (integer, default: 0)
- `last_viewed_at` (timestamptz, nullable)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### pages_content
- `id` (integer, PK)
- `page_type` (text, unique)
- `content` (text, nullable)
- `updated_by` (uuid, nullable, FK → profiles.id)
- `updated_at` (timestamptz, default: now())

### mmb_counters
- `seq_date` (date, PK)
- `last_no` (integer, default: 0)
- `updated_at` (timestamptz, default: now())

---

## RLSポリシー一覧

### profiles
- **Anyone can view profiles**: 全ユーザーが閲覧可能
- **Users can insert own profile**: 自分のプロファイルのみ挿入可能
- **Users can update own profile**: 自分のプロファイルのみ更新可能

### user_details
- **Users can view own details**: 自分の詳細情報のみ閲覧可能
- **Users can insert own details**: 自分の詳細情報のみ挿入可能
- **Users can update own details**: 自分の詳細情報のみ更新可能
- **Users can delete own details**: 自分の詳細情報のみ削除可能
- **Admins can view all user_details**: 管理者は全ユーザーの詳細情報を閲覧可能
- **Admins can update all user_details**: 管理者は全ユーザーの詳細情報を更新可能

### ideas
- **Anyone can view ideas**: 全ユーザーが閲覧可能
- **Authenticated users can create ideas**: 認証済みユーザーのみ作成可能
- **Authors can update own ideas**: 作成者のみ自分のアイデアを更新可能
- **Authors can delete own ideas**: 作成者のみ自分のアイデアを削除可能
- **Admins can update all ideas**: 管理者は全アイデアを更新可能
- **Admins can delete all ideas**: 管理者は全アイデアを削除可能

### idea_versions
- **Anyone can view idea versions**: 全ユーザーが閲覧可能
- **Authenticated users can create idea versions**: 認証済みユーザーのみ作成可能
- **Authors can update own idea versions**: 作成者のみ自分のアイデアバージョンを更新可能
- **Authors can delete own idea versions**: 作成者のみ自分のアイデアバージョンを削除可能

### comments
- **Anyone can view comments**: 全ユーザーが閲覧可能
- **Authenticated users can create comments**: 認証済みユーザーのみ作成可能
- **Authors can update own comments**: 投稿者のみ自分のコメントを更新可能
- **Authors can delete own comments**: 投稿者のみ自分のコメントを削除可能

### sold
- **Users can view own sold records**: 自分のsoldレコードのみ閲覧可能
- **Users can insert own sold**: 自分のsoldレコードのみ挿入可能
- **Users can update own sold**: 自分のsoldレコードのみ更新可能
- **Admins can view all sold**: 管理者は全soldレコードを閲覧可能
- **Admins can update all sold**: 管理者は全soldレコードを更新可能
- **Admins can delete all sold**: 管理者は全soldレコードを削除可能

### audit_logs
- **Admins can view audit logs**: 管理者のみ閲覧可能
- **System can insert audit logs**: システムのみ挿入可能

### blog_views
- **blog_views_select_policy**: 全ユーザーが閲覧可能
- **blog_views_insert_policy**: 全ユーザーが挿入可能

### blog_view_counts
- **blog_view_counts_select_policy**: 全ユーザーが閲覧可能
- **blog_view_counts_insert_policy**: 全ユーザーが挿入可能
- **blog_view_counts_update_policy**: 全ユーザーが更新可能

### pages_content
- **Anyone can view pages content**: 全ユーザーが閲覧可能
- **Admins can insert pages content**: 管理者のみ挿入可能
- **Admins can update pages content**: 管理者のみ更新可能
- **Admins can delete pages content**: 管理者のみ削除可能

### Storage (storage.objects)
- **Ideas Public Access**: ideasバケットのファイルは全ユーザーが閲覧可能
- **Authenticated users can upload**: 認証済みユーザーのみideasバケットにアップロード可能
- **Users can update own files**: 自分のファイルのみ更新可能（ideasバケット）
- **Users can delete own files**: 自分のファイルのみ削除可能（ideasバケット）
- **Avatars Public Access**: avatarsバケットのファイルは全ユーザーが閲覧可能
- **Authenticated users can upload avatars**: 認証済みユーザーのみavatarsバケットにアップロード可能
- **Users can update own avatar**: 自分のアバターのみ更新可能（avatarsバケット）
- **Users can delete own avatar**: 自分のアバターのみ削除可能（avatarsバケット）

---

## 注意事項

1. **データ移行は行わない**: 本番データは移行しません。テストデータのみが含まれます。

2. **環境変数の更新**: フロントエンドアプリケーションの環境変数を必ず更新してください。

3. **認証設定の確認**: Authentication設定（特にメール設定）は新しいプロジェクトで再度設定する必要があります。

4. **Storageファイルの移行**: Storageに保存されているファイルは手動で移行する必要があります（本移行手順では含まれていません）。

5. **バックアップ**: 移行前に既存プロジェクトのバックアップを取得することを推奨します。

6. **段階的な移行**: 可能であれば、ステージング環境で移行をテストしてから本番環境に適用してください。

---

## トラブルシューティング

### マイグレーションエラーが発生した場合

1. エラーメッセージを確認
2. 該当するマイグレーションファイルを確認
3. SQL Editorで直接実行してエラー内容を確認
4. 必要に応じてマイグレーションファイルを修正

### RLSポリシーが正しく動作しない場合

1. 各テーブルでRLSが有効になっているか確認
2. ポリシーが正しく作成されているか確認
3. ユーザーの認証状態を確認

### Storageアクセスエラーが発生した場合

1. バケットが正しく作成されているか確認
2. Storageポリシーが正しく設定されているか確認
3. ファイルパスの形式を確認

---

## 参考情報

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Supabase Migration Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Policies](https://supabase.com/docs/guides/storage/policies)

