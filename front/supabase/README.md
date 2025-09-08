# Supabase Migration Files

このディレクトリには、アイデアマーケットのSupabaseデータベース用のマイグレーションファイルが含まれています。

## 📋 マイグレーションファイル一覧

テーブルごとに整理されたマイグレーション構造：

| ファイル名                                | 説明                                         |
| ----------------------------------------- | -------------------------------------------- |
| `20250128000001_extensions_and_enums.sql` | PostgreSQL拡張機能とENUM型の初期設定         |
| `20250128000002_profiles_table.sql`       | プロファイルテーブル                         |
| `20250128000003_user_details_table.sql`   | ユーザー詳細情報テーブル（支払い・個人情報） |
| `20250128000004_cmt_counters_table.sql`   | CMT番号管理テーブル                          |
| `20250128000005_ideas_table.sql`          | アイデアテーブル                             |
| `20250128000006_idea_versions_table.sql`  | アイデアバージョンテーブル（X版/Y版）        |
| `20250128000007_comments_table.sql`       | コメントテーブル                             |
| `20250128000008_purchases_table.sql`      | 購入履歴テーブル                             |
| `20250128000009_ads_table.sql`            | 広告管理テーブル                             |
| `20250128000010_ad_metrics_table.sql`     | 広告計測テーブル                             |
| `20250128000011_pages_table.sql`          | CMSページ管理テーブル                        |
| `20250128000012_audit_logs_table.sql`     | 監査ログテーブル（パーティション対応）       |
| `20250128000013_rls_policies.sql`         | Row Level Security (RLS) ポリシー            |
| `20250128000014_search_functions.sql`     | 検索機能とインデックス                       |

## 🏗️ テーブル構造概要

### コアテーブル

- **profiles**: ユーザープロファイル（基本情報）
- **user_details**: ユーザー詳細情報（支払い・個人情報）
- **ideas**: アイデア情報（当初版）
- **idea_versions**: アイデアの最終版（X版/Y版）
- **comments**: アイデアへのコメント

### ビジネステーブル

- **purchases**: 購入履歴
- **ads**: 広告管理
- **ad_metrics**: 広告効果測定
- **pages**: CMS ページ管理

### システムテーブル

- **cmt_counters**: CMT番号自動生成
- **audit_logs**: 監査ログ（パーティション対応）

## 🚀 使用方法

### 1. ローカル開発環境での使用

```bash
# Supabase CLIをインストール（まだの場合）
npm install -g supabase

# プロジェクトを初期化
supabase init

# ローカル環境を起動
supabase start

# マイグレーションを実行
supabase db reset
```

### 2. 本番環境での使用

```bash
# リモートプロジェクトにリンク
supabase link --project-ref YOUR_PROJECT_REF

# マイグレーションを本番環境にプッシュ
supabase db push
```

### 3. 手動実行（Supabaseダッシュボード）

1. [Supabase Dashboard](https://app.supabase.com) にアクセス
2. プロジェクトを選択 → **SQL Editor**
3. マイグレーションファイルを順番に実行：
   - 001 → 002 → 003 → ... → 014

## 🔒 セキュリティ

- Row Level Security (RLS) が有効化されています
- ユーザーは自分のデータのみアクセス可能
- 公開データは認証不要で閲覧可能
- 管理者権限は必要に応じて設定

## 🔍 検索機能

以下の検索関数が利用可能です：

- `search_ideas()`: アイデア検索
- `search_idea_versions()`: アイデアバージョン検索
- `get_popular_tags()`: 人気タグ取得

## 📊 パフォーマンス

- 全文検索用のGINインデックス設定済み
- 頻繁にアクセスされるカラムにインデックス設定
- 監査ログはパーティション化でスケーラビリティ確保

## 🔧 メンテナンス

### バックアップ

マイグレーション実行前のバックアップは `migrations_backup/` ディレクトリに保存されています。

### ロールバック

問題が発生した場合は、バックアップファイルを使用してロールバックできます。

## 🏷️ バージョン履歴

- **v2.0** (2025-01-28): テーブルごとの整理されたマイグレーション構造
- **v1.0** (2025-01-27): 初期マイグレーション
