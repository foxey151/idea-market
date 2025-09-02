# 現在のMigrationファイルで作成されるテーブル一覧

**作成日**: 2025-01-28  
**対象**: Supabase PostgreSQL データベース  
**概要**: アイデアマーケットプレイスシステムのデータベース構造

---

## 目次

1. [概要](#概要)
2. [テーブル一覧](#テーブル一覧)
3. [ENUM型定義](#enum型定義)
4. [拡張機能](#拡張機能)
5. [関数・トリガー](#関数トリガー)
6. [インデックス戦略](#インデックス戦略)
7. [セキュリティ](#セキュリティ)

---

## 概要

このドキュメントは、`/front/supabase/migrations/`ディレクトリ内のmigrationファイルで作成されるデータベース構造をまとめたものです。アイデアマーケットプレイスシステムの基盤となるテーブル、ENUM型、拡張機能、関数、トリガーが含まれています。

---

## テーブル一覧

### 1. **profiles** テーブル
**目的**: ユーザーの基本プロファイル情報  
**ファイル**: `20250128000002_profiles_table.sql`

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| `id` | UUID | PRIMARY KEY, FK to auth.users | ユーザーID（認証テーブルと連携） |
| `role` | role ENUM | NOT NULL, DEFAULT 'member' | ユーザーロール（member/company/admin） |
| `display_name` | TEXT | - | 表示名 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス**: `idx_profiles_role`  
**トリガー**: 更新時刻自動更新、新規ユーザー登録時の自動プロファイル作成

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
| `deadline` | TIMESTAMPTZ | - | 募集締切日時 |
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

---

### 5. **idea_versions** テーブル
**目的**: アイデアのX版・Y版管理  
**ファイル**: `20250128000006_idea_versions_table.sql`

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | バージョンID |
| `idea_id` | UUID | NOT NULL, FK to ideas | アイデアID |
| `type` | version_type ENUM | NOT NULL | バージョン種別（X/Y） |
| `title` | TEXT | NOT NULL | タイトル |
| `summary` | TEXT | NOT NULL | 概要 |
| `body` | TEXT | - | 本文（Y版で必須） |
| `price` | INTEGER | CHECK (price >= 0) | 価格（Y版で必須） |
| `is_public` | BOOLEAN | NOT NULL, DEFAULT false | 公開フラグ（X=true, Y=false） |
| `purchase_count` | INTEGER | NOT NULL, DEFAULT 0 | 購入数 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

**制約**: `UNIQUE(idea_id, type)` - 1つのアイデアに対してX版、Y版それぞれ1つまで

**インデックス**: 
- `idx_versions_idea_type` - アイデアIDとタイプ
- `idx_versions_public` - 公開フラグ
- `idx_versions_created_at` - 作成日時（降順）
- `idx_versions_title_trgm` - タイトル全文検索
- `idx_versions_summary_trgm` - 概要全文検索

**トリガー**: 更新時刻自動更新

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
| `attachments` | TEXT[] | NOT NULL, DEFAULT '{}' | 添付ファイルパス配列 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス**: 
- `idx_comments_idea_time` - アイデアIDと作成日時
- `idx_comments_author` - 投稿者
- `idx_comments_created_at` - 作成日時（降順）

**トリガー**: 更新時刻自動更新

---

### 7. **purchases** テーブル
**目的**: アイデア購入履歴  
**ファイル**: `20250128000008_purchases_table.sql`

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 購入ID |
| `buyer_id` | UUID | NOT NULL, FK to profiles | 購入者ID |
| `idea_version_id` | UUID | NOT NULL, FK to idea_versions | 購入したアイデアバージョンID |
| `amount` | INTEGER | NOT NULL | 購入金額 |
| `invoice_url` | TEXT | - | 請求書URL |
| `status` | purchase_status ENUM | NOT NULL, DEFAULT 'succeeded' | 購入ステータス |
| `paid_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 支払い日時 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |

**制約**: `UNIQUE (buyer_id, idea_version_id)` - 同じユーザーが同じアイデアバージョンを重複購入できない

**インデックス**: 
- `idx_purchases_buyer` - 購入者と支払い日時
- `idx_purchases_idea_version` - アイデアバージョン
- `idx_purchases_status` - ステータス
- `idx_purchases_paid_at` - 支払い日時（降順）

**トリガー**: 購入数カウント更新（挿入・更新・削除時）

---

### 8. **pages** テーブル
**目的**: CMSページ管理  
**ファイル**: `20250128000011_pages_table.sql`

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| `slug` | TEXT | PRIMARY KEY | ページ識別子（legal/company/techなど） |
| `content` | JSONB | NOT NULL | WYSIWYG出力内容 |
| `draft` | BOOLEAN | NOT NULL, DEFAULT false | 下書きフラグ |
| `updated_by` | UUID | FK to profiles | 更新者ID |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス**: 
- `idx_pages_draft` - 下書きフラグ
- `idx_pages_updated_by` - 更新者

**トリガー**: 更新時刻自動更新

---

### 9. **audit_logs** テーブル
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

**パーティション**: 月次パーティション（2025年1月〜3月）  
**インデックス**: 各パーティションに時間・実行者インデックス

---

### 10. **広告関連テーブル（現在無効化）**
**ファイル**: `20250128000009_ads_table.sql`, `20250128000010_ad_metrics_table.sql`

- **ads** テーブル - 広告管理（コメントアウト）
- **ad_metrics** テーブル - 広告計測（コメントアウト）

---

## ENUM型定義

**ファイル**: `20250128000001_extensions_and_enums.sql`

| ENUM名 | 値 | 説明 |
|--------|----|------|
| `role` | member, company, admin | ユーザーロール |
| `version_type` | X, Y | アイデアバージョン種別 |
| `purchase_status` | succeeded, refunded, failed | 購入ステータス |
| `account_type_enum` | ordinary, current | 銀行口座種別 |
| `gender_enum` | male, female, other | 性別 |
| `prefecture_enum` | hokkaido〜okinawa | 都道府県（47都道府県） |

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
- **`update_purchase_count()`** - 購入数カウント更新

### 主要トリガー
- **更新時刻自動更新** - 全テーブルでupdated_atを自動更新
- **新規ユーザー登録時** - auth.usersテーブル挿入時に自動プロファイル作成
- **MMB番号自動生成** - アイデア作成時にMMB番号を自動設定
- **購入数カウント更新** - 購入・返金・削除時に購入数を自動更新

---

## インデックス戦略

### 全文検索対応
- アイデアのタイトル・概要
- アイデアバージョンのタイトル・概要

### パフォーマンス最適化
- 作成日時降順インデックス
- ステータス・公開フラグインデックス
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

## まとめ

現在のmigrationファイルにより、アイデアマーケットプレイスシステムの基盤となる以下の機能が実現されています：

1. **ユーザー管理** - プロファイル、詳細情報、ロール管理
2. **アイデア管理** - 投稿、バージョン管理（X版・Y版）、MMB番号採番
3. **コミュニケーション** - コメント機能
4. **決済・購入** - 購入履歴、購入数管理
5. **コンテンツ管理** - CMSページ管理
6. **監査・ログ** - 操作履歴の記録
7. **検索・パフォーマンス** - 全文検索、適切なインデックス

全テーブルに適切な制約、インデックス、トリガーが設定され、セキュリティとパフォーマンスの両立が図られています。
