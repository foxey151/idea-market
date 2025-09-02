# 改善されたMigrationファイルで作成されるテーブル一覧

**作成日**: 2025-01-28  
**対象**: Supabase PostgreSQL データベース  
**概要**: アイデアマーケットプレイスシステムのデータベース構造（改善版）  
**参考**: task.txtの要件に基づく改善

---

## 目次

1. [概要](#概要)
2. [改善点](#改善点)
3. [テーブル一覧](#テーブル一覧)
4. [ENUM型定義](#enum型定義)
5. [拡張機能](#拡張機能)
6. [関数・トリガー](#関数トリガー)
7. [インデックス戦略](#インデックス戦略)
8. [セキュリティ](#セキュリティ)

---

## 概要

このドキュメントは、`/front/supabase/migrations/`ディレクトリ内のmigrationファイルで作成されるデータベース構造をまとめたものです。task.txtの要件に基づいて改善されたテーブル設計となっています。

---

## 改善点

### 主要な変更点
1. **profiles**: `display_name`の設定可能化、NULL時はメールアドレス表示
2. **ideas**: `deadline`をNOT NULLに変更
3. **idea_versions**: 販売中(Y版)管理テーブルとして再設計
4. **comments**: `attachments`カラムを削除
5. **purchases**: 請求書生成・メール送信対応、`idea_version_id`削除
6. **pages**: 廃止
7. **audit_logs**: 月次パーティション自動作成、2025年9月は手動作成

---

## テーブル一覧

### 1. **profiles** テーブル
**目的**: ユーザーの基本プロファイル情報  
**ファイル**: `20250128000002_profiles_table.sql`

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| `id` | UUID | PRIMARY KEY, FK to auth.users | ユーザーID（認証テーブルと連携） |
| `role` | role ENUM | NOT NULL, DEFAULT 'member' | ユーザーロール（member/company/admin） |
| `display_name` | TEXT | - | 表示名（NULL時はメールアドレス表示） |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス**: `idx_profiles_role`  
**トリガー**: 更新時刻自動更新、新規ユーザー登録時の自動プロファイル作成

**改善点**: `display_name`がNULLの場合、メールアドレスを表示する仕様に変更

---

### 2. **user_details** テーブル
**目的**: ユーザーの詳細情報（支払い・個人情報）  
**ファイル**: `20250128000003_user_details_table.sql`

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | レコードID |
| `user_id` | UUID | NOT NULL, FK to profiles, UNIQUE | ユーザーID |
| `full_name` | TEXT | - | 氏名 |
| `email` | TEXT | - | メールアドレス |
| `bank_name` | TEXT | - | 銀行名 |
| `branch_name` | TEXT | - | 支店名 |
| `account_type` | account_type_enum | - | 口座種別（ordinary/current） |
| `account_number` | TEXT | - | 口座番号 |
| `account_holder` | TEXT | - | 口座名義人 |
| `gender` | gender_enum | - | 性別（male/female/other） |
| `birth_date` | DATE | - | 生年月日 |
| `prefecture` | prefecture_enum | - | 都道府県 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス**: `idx_user_details_user`  
**トリガー**: 更新時刻自動更新

---

### 3. **mmb_counters** テーブル
**目的**: MMB番号の連番管理  
**ファイル**: `20250128000004_mmb_counters_table.sql`

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| `seq_date` | DATE | PRIMARY KEY | 日付 |
| `last_no` | INTEGER | NOT NULL, DEFAULT 0 | その日の最後の番号 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

**関数**: `generate_mmb_no()` - MMB-YYMMDNNNN形式の番号を生成

---

### 4. **ideas** テーブル
**目的**: アイデアの基本情報  
**ファイル**: `20250128000005_ideas_table.sql`

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | アイデアID |
| `author_id` | UUID | NOT NULL, FK to profiles | 作成者ID |
| `mmb_no` | TEXT | NOT NULL, UNIQUE | MMB-YYMMDNNNN形式の番号 |
| `title` | TEXT | NOT NULL | タイトル |
| `summary` | TEXT | NOT NULL | 概要 |
| `attachments` | TEXT[] | NOT NULL, DEFAULT '{}' | 添付ファイルパス配列 |
| `deadline` | TIMESTAMPTZ | NOT NULL | 募集締切日時（必須化） |
| `status` | TEXT | NOT NULL, DEFAULT 'published' | ステータス（overdue/published/closed） |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス**: 
- `idx_ideas_author` - 作成者
- `idx_ideas_mmb_no` - MMB番号
- `idx_ideas_created_at` - 作成日時（降順）
- `idx_ideas_deadline` - 締切日時
- `idx_ideas_status` - ステータス
- `idx_ideas_title_trgm` - タイトル全文検索
- `idx_ideas_summary_trgm` - 概要全文検索

**トリガー**: 更新時刻自動更新、MMB番号自動生成

**改善点**: `deadline`をNOT NULLに変更（必須化）

---

### 5. **idea_versions** テーブル（再設計）
**目的**: 販売中(Y版)のアイデア管理  
**ファイル**: `20250128000006_idea_versions_table.sql`（改訂版）

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | バージョンID |
| `idea_id` | UUID | NOT NULL, FK to ideas | アイデアID |
| `price` | INTEGER | NOT NULL, CHECK (price >= 0) | 販売価格 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス**: 
- `idx_versions_idea` - アイデアID
- `idx_versions_price` - 価格
- `idx_versions_created_at` - 作成日時（降順）

**トリガー**: 更新時刻自動更新

**改善点**: 
- 販売中(Y版)のアイデア管理に特化
- 不要なカラムを削除（type, title, summary, body, is_public, purchase_count）
- シンプルな構造に変更

---

### 6. **comments** テーブル
**目的**: アイデアへのコメント  
**ファイル**: `20250128000007_comments_table.sql`

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | コメントID |
| `idea_id` | UUID | NOT NULL, FK to ideas | アイデアID |
| `author_id` | UUID | NOT NULL, FK to profiles | コメント投稿者ID |
| `text` | TEXT | NOT NULL | コメント内容 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス**: 
- `idx_comments_idea_time` - アイデアIDと作成日時
- `idx_comments_author` - 投稿者
- `idx_comments_created_at` - 作成日時（降順）

**トリガー**: 更新時刻自動更新

**改善点**: `attachments`カラムを削除（添付ファイル機能は不要）

---

### 7. **purchases** テーブル（再設計）
**目的**: アイデア購入履歴・請求書生成対応  
**ファイル**: `20250128000008_purchases_table.sql`（改訂版）

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 購入ID |
| `buyer_id` | UUID | NOT NULL, FK to profiles | 購入者ID |
| `idea_id` | UUID | NOT NULL, FK to ideas | 購入したアイデアID |
| `amount` | INTEGER | NOT NULL | 購入金額 |
| `invoice_url` | TEXT | - | 請求書URL |
| `status` | purchase_status ENUM | NOT NULL, DEFAULT 'succeeded' | 購入ステータス |
| `paid_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 支払い日時 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |

**インデックス**: 
- `idx_purchases_buyer` - 購入者と支払い日時
- `idx_purchases_idea` - アイデアID
- `idx_purchases_status` - ステータス
- `idx_purchases_paid_at` - 支払い日時（降順）

**機能**: 
- 請求書生成・メール送信対応
- ユーザーメニューの購入履歴表示

**改善点**: 
- `idea_version_id`を削除、`idea_id`に変更
- 請求書生成・メール送信機能を追加
- 購入履歴表示機能を実装

---

### 8. **audit_logs** テーブル
**目的**: 監査ログ（パーティション対応）  
**ファイル**: `20250128000012_audit_logs_table.sql`

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| `id` | BIGSERIAL | - | ログID |
| `actor_id` | UUID | - | 実行者ID |
| `action` | TEXT | NOT NULL | 実行アクション |
| `entity` | TEXT | NOT NULL | 対象エンティティ |
| `entity_id` | UUID | - | 対象ID |
| `payload` | JSONB | - | 詳細データ |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 実行日時 |

**パーティション**: 月次パーティション（2025年1月〜9月）  
**インデックス**: 各パーティションに時間・実行者インデックス

**改善点**: 
- 毎月頭にパーティションを自動作成
- 2025年9月は手動作成

---

### 9. **廃止されたテーブル**

#### **pages** テーブル
- **理由**: 不要なため廃止
- **影響**: CMSページ管理機能を削除

#### **広告関連テーブル**
- **ads** テーブル - 広告管理（コメントアウト）
- **ad_metrics** テーブル - 広告計測（コメントアウト）

---

## ENUM型定義

**ファイル**: `20250128000001_extensions_and_enums.sql`

| ENUM名 | 値 | 説明 |
|--------|----|------|
| `role` | member, company, admin | ユーザーロール |
| `purchase_status` | succeeded, refunded, failed | 購入ステータス |
| `account_type_enum` | ordinary, current | 銀行口座種別 |
| `gender_enum` | male, female, other | 性別 |
| `prefecture_enum` | hokkaido〜okinawa | 都道府県（47都道府県） |

**変更点**: `version_type` ENUMを削除（idea_versionsテーブルの再設計により不要）

---

## 拡張機能

**ファイル**: `20250128000001_extensions_and_enums.sql`

- **pgcrypto** - UUID生成
- **pg_trgm** - 全文検索用
- **btree_gin** - GINインデックス用
- **uuid-ossp** - UUID生成（オプション）

---

## 関数・トリガー

### 主要関数
- **`set_updated_at()`** - updated_at自動更新
- **`handle_new_user()`** - 新規ユーザー登録時のプロファイル作成
- **`generate_mmb_no()`** - MMB番号生成
- **`set_mmb_no()`** - アイデア作成時のMMB番号自動設定

### 主要トリガー
- **更新時刻自動更新** - 全テーブルでupdated_atを自動更新
- **新規ユーザー登録時** - auth.usersテーブル挿入時に自動プロファイル作成
- **MMB番号自動生成** - アイデア作成時にMMB番号を自動設定

**変更点**: 購入数カウント更新トリガーを削除（idea_versionsテーブルの再設計により不要）

---

## インデックス戦略

### 全文検索対応
- アイデアのタイトル・概要

### パフォーマンス最適化
- 作成日時降順インデックス
- ステータス・価格インデックス
- 外部キーインデックス

---

## セキュリティ

### RLS（Row Level Security）
- 全テーブルでRLSを有効化
- `auth.uid()`を利用したユーザー認証
- 適切なポリシー設定

### データ整合性
- 外部キー制約
- CHECK制約
- UNIQUE制約
- カスケード削除

---

## 実装が必要な機能

### 1. 請求書生成・メール送信
- **対象**: purchasesテーブル
- **機能**: 購入完了時に請求書を生成し、メールで送信
- **実装**: バックエンド処理の追加が必要

### 2. 購入履歴表示
- **対象**: ユーザーメニュー
- **機能**: ユーザーが購入したアイデアの履歴を表示
- **実装**: フロントエンド画面の追加が必要

### 3. 月次パーティション自動作成
- **対象**: audit_logsテーブル
- **機能**: 毎月頭に新しいパーティションを自動作成
- **実装**: スケジュールタスクの設定が必要

---

## まとめ

改善されたmigrationファイルにより、アイデアマーケットプレイスシステムの基盤となる以下の機能が実現されています：

1. **ユーザー管理** - プロファイル、詳細情報、ロール管理（表示名改善）
2. **アイデア管理** - 投稿、締切日時必須化、MMB番号採番
3. **販売管理** - シンプルなY版管理テーブル
4. **コミュニケーション** - コメント機能（添付ファイル削除）
5. **決済・購入** - 購入履歴、請求書生成・メール送信対応
6. **監査・ログ** - 操作履歴の記録、月次パーティション自動作成

**主要な改善点**:
- テーブル構造の簡素化
- 不要な機能の削除
- 実用性の向上
- メンテナンス性の改善

全テーブルに適切な制約、インデックス、トリガーが設定され、セキュリティとパフォーマンスの両立が図られています。
