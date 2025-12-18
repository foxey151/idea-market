-- Migration: 20251012000027_restore_affected_ideas
-- Description: 購入取消によってpublishedに戻されてしまったclosedアイデアを復活させる
-- 作成日: 2025-10-12

-- =================================================================
-- 影響を受けたアイデアを復活させる
-- =================================================================

-- 購入取消によってpublishedに戻されてしまったアイデアをclosedに戻す
-- 条件: status = 'published' かつ soldテーブルにレコードが存在しない（購入取消された）
-- ただし、これは推測に基づくため、管理者が手動で確認する必要がある

-- 注意: このクエリは、購入取消によって誤ってpublishedに戻されたアイデアを復活させます
-- ただし、元々publishedだったアイデアも含まれる可能性があるため、慎重に実行してください

-- まず、影響を受けた可能性のあるアイデアを確認
-- SELECT id, title, status, created_at, updated_at
-- FROM public.ideas
-- WHERE status = 'published'
--   AND id NOT IN (SELECT DISTINCT idea_id FROM public.sold)
--   AND updated_at > '2025-10-12'::timestamp  -- 購入取消機能が追加された日以降
-- ORDER BY updated_at DESC;

-- 上記のクエリで確認後、必要に応じて以下のクエリを実行して復活させる
-- UPDATE public.ideas
-- SET status = 'closed', updated_at = NOW()
-- WHERE status = 'published'
--   AND id NOT IN (SELECT DISTINCT idea_id FROM public.sold WHERE idea_id IS NOT NULL)
--   AND updated_at > '2025-10-12'::timestamp  -- 購入取消機能が追加された日以降
--   AND id IN (
--     -- ここに復活させるアイデアのIDを指定
--     -- 例: '00000000-0000-0000-0000-000000000001'::uuid
--   );

-- 注意: 上記のクエリは手動で実行する必要があります
-- 自動実行は危険なため、コメントアウトしています
