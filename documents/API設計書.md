# アイデアマーケット API設計 v1.0

## 概要

- **対象**: Wix→AWS 移行後のバックエンド API
- **目的**: 前提の要件定義/画面設計を満たすための REST 設計
- **ベース URL**: `https://{domain}/api/v1`
- **フォーマット**: `application/json`（一部 `multipart/form-data`/S3 署名 URL）

## 0. 共通仕様

### 認証・認可
- **認証**: Cognito JWT（Bearer）
- **ロール**: `member`（A/B）, `company`（K）, `admin`
- **認可**: RBAC + 所有権チェック（自分のリソースのみ編集可）

### バージョニング
- **バージョン**: URL に v1
- **将来互換不可変更**: v2 で提供

### その他
- **Idempotency**: 全書込 API で `Idempotency-Key` ヘッダ受理（重複送信抑止）
- **レート制限**: 未認証 60rpm、認証済 100rpm（429 Too Many Requests）
- **日時/タイムゾーン**: ISO8601（UTC）、表示はクライアントで JST
- **ページネーション**: cursor 方式（`?limit=50&cursor=xxxxx`）
- **並び替え**: `?sort=`（relevance|new|popular など）

### エラー形式

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "details": {"field": "reason"}
  },
  "request_id": "..."
}
```

### セキュリティ
- **監査ログ**: 作成/更新/削除/権限/決済は audit_logs に記録
- **CORS**: 許可オリジンのみ、Cookie 未使用（Bearer）



## 1. ユーザー/認証

### 1.1 サインアップ

**POST** `/signup`

**Body:**
```json
{
  "email": "string",
  "password": "string",
  "role": "member"|"company",
  "termsAgreedAt": "ISO8601"
}
```

**Response:** 201
```json
{
  "id": "uuid",
  "email": "string",
  "role": "string"
}
```
（メール検証は Cognito 側）

### 1.2 自分情報

- **GET** `/me` → ログインユーザー情報
- **PATCH** `/me` → 表示名・通知設定などの更新

## 2. 当初アイデア & コメント（LINE風）

### 2.1 当初アイデア作成

**POST** `/ideas`

**Purpose:** 当初アイデア（概要）を作成し `cmt_no` を採番

**Body:**
```json
{
  "title": "string",
  "summary": "string",
  "tags": ["string"],
  "attachments": ["string"]
}
```

**Response:** 201
```json
{
  "id": "uuid",
  "cmt_no": "string",
  "..."
}
```

**Rule:** `cmt_no = CMT-YYMMDD-####`（日別連番・トランザクション内排他）

### 2.2 当初アイデア取得/更新

- **GET** `/ideas/{id}` → `{ id, cmt_no, summary, tags, author, created_at, ... }`
- **PATCH** `/ideas/{id}` → 作成者のみ一定時間内に編集可（管理者は常時）

### 2.3 コメント

**POST** `/ideas/{id}/comments`

**Body:**
```json
{
  "body": "string",
  "attachments": ["string"]
}
```

**Response:** 201
```json
{
  "id": "uuid",
  "idea_id": "uuid",
  "body": "string",
  "created_at": "ISO8601"
}
```

- **GET** `/ideas/{id}/comments?limit&cursor` → 時系列（仮想化前提）
- **DELETE** `/comments/{id}` → 作成者/管理者



## 3. 最終アイデア（X/Y）

### 3.1 X/Y 作成

**POST** `/ideas/{id}/final`

**Body:**
```json
{
  "versions": [
    {
      "type": "X",
      "title": "...",
      "summary": "..."
    },
    {
      "type": "Y",
      "title": "...",
      "summary": "...",
      "body": "...",
      "price": 9800,
      "attachments": ["s3://..."]
    }
  ]
}
```

**Response:** 201
```json
{
  "versions": [
    {
      "id": "uuid",
      "type": "string",
      "is_public": "boolean"
    }
  ]
}
```

**Rule:** X は公開、Y は非公開（購入者/管理者のみ）

### 3.2 取得/一覧

- **GET** `/ideas/{id}/versions?type=X|Y` → 一覧
- **GET** `/idea-versions/{versionId}` → X は誰でも、Y は権限者のみ
- **PATCH** `/idea-versions/{versionId}` → 作成者（一定時間）/管理者

## 4. 検索

### 4.1 複合検索

**GET** `/search`

**Query Parameters:**
- `cmt_no=...` （完全一致 → 当該スレッド表示）
- `q=...&type=initial|thread|x|y&sort=relevance|new|popular`

**Response:**
```json
{
  "results": [
    {
      "type": "thread|x|y",
      "id": "...",
      "title": "...",
      "snippet": "..."
    }
  ],
  "ads": [
    {
      "id": "...",
      "title": "...",
      "image_url": "...",
      "link_url": "..."
    }
  ],
  "next_cursor": "..."
}
```

**備考:** P0 は pg_trgm、P1 で OpenSearch（kuromoji, 同義語辞書）



## 5. 広告（社内モジュール）

- **GET** `/ads?active=true&limit&cursor` → 公開中の広告一覧（/ads 画面用）
- **POST** `/ads`（admin）→ `{ title, image_url, link_url, target_keywords[], active_from, active_to, priority }`
- **PATCH** `/ads/{id}`（admin） / **DELETE** `/ads/{id}`（admin）

**マッチング:** 検索クエリをトークン化→ target_keywords に AND/OR マッチ

**計測:**
- **POST** `/ads/{id}/impression`
- **POST** `/ads/{id}/click`



## 6. ページ（規約・技術・会社情報／CMS）

- **GET** `/pages/{slug}` (legal|company|tech など)
- **PUT** `/pages/{slug}`（admin）→ WYSIWYG JSON で保存（下書き/公開フラグ）

## 7. 決済/購入（Stripe）

### 7.1 Checkout セッション作成

**POST** `/purchase/{versionId}`

**Precondition:** versionId は Y のみ

**Body:**
```json
{
  "success_url": "string",
  "cancel_url": "string"
}
```

**Response:** 200
```json
{
  "checkout_url": "string"
}
```

### 7.2 Webhook（冪等）

**POST** `/webhooks/stripe`

**イベント:** `checkout.session.completed`, `payment_intent.succeeded`

**動作:** 購入レコード作成 → Y 閲覧権付与 → 電子領収書 URL 保存

**セキュリティ:** 署名検証/再試行は DLQ 管理、冪等キーで重複防止

### 7.3 購入履歴/詳細

- **GET** `/me/purchases?limit&cursor`
- **GET** `/purchases/{id}` → 自分の購入のみ

## 8. ファイル

### 8.1 署名 URL 発行（アップロード）

**POST** `/files/sign`

**Body:**
```json
{
  "file_name": "string",
  "mime": "string",
  "size": "number"
}
```

**Response:** 200
```json
{
  "upload_url": "string",
  "key": "string"
}
```

**制限:** サイズ ≤ 20MB、MIME ホワイトリスト（pdf/png/jpg/webp/txt/md）

### 8.2 署名 URL 発行（ダウンロード）

**POST** `/files/download`

**Body:**
```json
{
  "key": "string"
}
```

**権限:** Y の添付は購入者/管理者のみ



## 9. 管理/監査ログ

- **GET** `/admin/logs?from=YYYY-MM-DD&to=YYYY-MM-DD&kind=create|update|delete|login|purchase|ad&format=csv|txt`
- **GET** `/admin/stats` → KPI（投稿数/購入数/検索ゼロ件率/広告 CTR など）

## 10. ヘルスチェック

**GET** `/healthz` → `{ status: "ok", version: "v1", time: "..." }`

## 11. スキーマ（抜粋）

### 11.1 Idea

```json
{
  "id": "uuid",
  "cmt_no": "CMT-250827-0001",
  "title": "...",
  "summary": "...",
  "tags": ["医療", "SaaS"],
  "author": {
    "id": "uuid",
    "display_name": "..."
  },
  "created_at": "2025-08-27T01:23:45Z",
  "updated_at": "2025-08-27T01:23:45Z"
}
```

### 11.2 Comment

```json
{
  "id": "uuid",
  "idea_id": "uuid",
  "author": {
    "id": "uuid",
    "display_name": "..."
  },
  "body": "...",
  "attachments": ["s3://..."],
  "created_at": "..."
}
```

### 11.3 IdeaVersion (X/Y)

```json
{
  "id": "uuid",
  "idea_id": "uuid",
  "type": "X|Y",
  "title": "...",
  "summary": "...",
  "body": "...",
  "price": 9800,
  "is_public": true,
  "purchased": false,
  "purchase_count": 12,
  "attachments": ["s3://..."],
  "created_at": "..."
}
```

### 11.4 Ad

```json
{
  "id": "uuid",
  "title": "...",
  "image_url": "https://...",
  "link_url": "https://...",
  "target_keywords": ["医療", "新規事業"],
  "active_from": "...",
  "active_to": "...",
  "priority": 10
}
```

### 11.5 Page (CMS)

```json
{
  "slug": "legal|company|tech",
  "content": {
    "type": "doc",
    "version": 1,
    "content": ["..."]
  },
  "draft": false,
  "updated_by": "uuid",
  "updated_at": "..."
}
```

### 11.6 Purchase

```json
{
  "id": "uuid",
  "buyer_id": "uuid",
  "idea_version_id": "uuid",
  "amount": 9800,
  "invoice_url": "https://stripe.com/...",
  "status": "succeeded|refunded",
  "paid_at": "2025-08-27T02:00:00Z"
}
```


## 12. ステータスコード指針

- **200 OK**: 取得/成功
- **201 Created**: 作成成功
- **204 No Content**: 削除/更新で返却ボディ不要
- **400 Bad Request**: フォーマット不正、バリデーション
- **401 Unauthorized**: 未認証
- **403 Forbidden**: 権限なし/未購入 Y 参照
- **404 Not Found**: 対象なし（CMT 未存在含む）
- **409 Conflict**: 冪等衝突/同時編集
- **422 Unprocessable Entity**: 事業ルール違反（例：Y に価格未設定）
- **429 Too Many Requests**: レート制限
- **500 Internal Server Error**: サーバエラー



## 13. セキュリティ/ガバナンス

- **入力検証**: サーバ側必須、ファイルは MIME/サイズ確認
- **CSP/ヘッダ**: CSP, HSTS, X-Frame-Options, Referrer-Policy
- **秘密情報**: Secrets Manager、KMS で暗号化
- **監査**: API ログは相関 ID 付与、CSV/TXT でエクスポート
- **個人情報**: PII マスキング、最小収集/最小保存

## 14. OpenAPI 配布

`/api/v1/openapi.json` を自動生成し配布（Swagger UI は admin のみ）

## 15. ユースケース別フロー（簡易）

- **Y 購入**: POST `/purchase/{versionId}` → Stripe → Webhook → 付与 → `/me/purchases` で可視
- **CMT 検索**: GET `/search?cmt_no=...` → スレッド詳細にディープリンク
- **広告表示**: GET `/search?q=...` → results + ads を返し、フロントで 1位/5位/末尾に配置

## 備考

P0 で必要な API を最小にまとめています。P1 以降：返金部分、請求書払い、OpenSearch 同期 API、広告レポート集計 API を追加予定。



