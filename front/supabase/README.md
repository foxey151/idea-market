# Supabase Migration Files

このディレクトリには、アイデアマーケットのSupabaseデータベース用のマイグレーションファイルが含まれています。

## 📋 マイグレーションファイル一覧

| ファイル名 | 説明 |
|-----------|------|
| `20250127000001_initial_extensions_and_enums.sql` | 拡張機能とENUM型の初期設定 |
| `20250127000002_core_tables.sql` | コアテーブル（profiles, ideas, comments, user_details） |
| `20250127000003_business_tables.sql` | ビジネステーブル（idea_versions, purchases, ads等） |
| `20250127000004_cmt_functions.sql` | CMT番号生成機能と関連トリガー |
| `20250127000005_rls_policies.sql` | Row Level Security (RLS) ポリシー |
| `20250127000006_search_indexes.sql` | 検索用インデックスと検索関数 |
| `20250127000007_sample_data.sql` | サンプルデータ（開発用） |

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
   - 001 → 002 → 003 → 004 → 005 → 006 → 007

## 📊 作成されるテーブル

### コアテーブル
- **`profiles`** - ユーザープロファイル
- **`user_details`** - ユーザー詳細情報（支払い・個人情報）
- **`ideas`** - 当初アイデア
- **`comments`** - コメント（LINE風）
- **`cmt_counters`** - CMT番号管理

### ビジネステーブル
- **`idea_versions`** - 最終アイデア（X版/Y版）
- **`purchases`** - 購入履歴
- **`ads`** - 広告管理
- **`ad_metrics`** - 広告計測
- **`pages`** - CMS（規約/技術/会社情報）
- **`audit_logs`** - 監査ログ

## 🔐 セキュリティ設定

### Row Level Security (RLS)
全テーブルでRLSが有効化され、以下のルールが適用されます：

- **公開コンテンツ**: ideas（published）、idea_versions（X版）、pages（published）
- **制限コンテンツ**: idea_versions（Y版）は購入者のみ
- **プライベート**: purchases（購入者のみ）、user_details（本人のみ）
- **管理者専用**: ads、ad_metrics、audit_logs

## 🔍 検索機能

### 利用可能な検索関数

```sql
-- キーワード検索（類似度付き）
SELECT * FROM public.search_ideas_by_keyword('AI 教育');

-- CMT番号による完全一致検索
SELECT * FROM public.search_idea_by_cmt_no('CMT-250127-0001');

-- アイデアバージョン検索（X版のみ）
SELECT * FROM public.search_idea_versions_by_keyword('機械学習');

-- 人気のアイデア取得（購入数順）
SELECT * FROM public.get_popular_ideas(10);
```

## ⚠️ 注意事項

### 実行前の確認
1. **実行順序**: 必ず001から007の順番で実行
2. **本番環境**: `007_sample_data.sql`は開発環境のみで実行
3. **バックアップ**: 本番環境での実行前は必ずバックアップを取得

### 環境変数の設定
```bash
# .env.local に以下を設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🛠️ トラブルシューティング

### よくあるエラー

**拡張機能エラー**
```
ERROR: extension "pg_trgm" is not available
```
→ Supabaseで自動的に利用可能な拡張機能です。

**RLSエラー**
```
ERROR: permission denied for table
```
→ Service Role Keyを使用してSQL Editorで実行してください。

**外部キー制約エラー**
```
ERROR: insert or update on table violates foreign key constraint
```
→ 参照先のテーブルにデータが存在するか確認してください。

## 📖 関連ドキュメント

- [DB設計書](../documents/DB設計書.md)
- [Supabaseドキュメント](https://supabase.com/docs)
- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/)
