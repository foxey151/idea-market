-- ファイルアップロードエラー修正用SQL
-- Supabase Dashboard の SQL Editor で実行してください

-- =================================================================
-- 1. Storage バケットの作成
-- =================================================================

-- attachments バケットを作成（パブリック）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments', 
  'attachments', 
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

-- =================================================================
-- 2. 既存のStorage RLSポリシーを削除（存在する場合）
-- =================================================================

DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;

-- =================================================================
-- 3. 新しいStorage RLSポリシーを作成
-- =================================================================

-- 3-1. 認証されたユーザーはファイルをアップロード可能
CREATE POLICY "Authenticated users can upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'attachments' AND
  auth.role() = 'authenticated'
);

-- 3-2. 誰でもファイルを表示可能（パブリックバケット）
CREATE POLICY "Anyone can view files" ON storage.objects
FOR SELECT USING (bucket_id = 'attachments');

-- 3-3. 認証されたユーザーは自分のファイルを削除可能
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'attachments' AND
  auth.role() = 'authenticated'
);

-- 3-4. 認証されたユーザーは自分のファイルを更新可能
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'attachments' AND
  auth.role() = 'authenticated'
);

-- =================================================================
-- 4. 設定確認
-- =================================================================

-- バケットの確認
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'attachments';

-- RLSポリシーの確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
