-- Migration: 20250128000019_setup_storage
-- Description: Supabase Storageのバケットとポリシーを設定
-- 作成日: 2025-01-28

-- =================================================================
-- Storage バケットの作成
-- =================================================================

-- attachments バケットを作成（存在しない場合のみ）
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- Storage RLS ポリシーの設定
-- =================================================================

-- 1. 認証されたユーザーはファイルをアップロード可能
CREATE POLICY "Authenticated users can upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'attachments' AND
  auth.role() = 'authenticated'
);

-- 2. 誰でもファイルを表示可能（パブリックバケット）
CREATE POLICY "Anyone can view files" ON storage.objects
FOR SELECT USING (bucket_id = 'attachments');

-- 3. ファイルの所有者は削除可能
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. ファイルの所有者は更新可能
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- =================================================================
-- ストレージの設定確認
-- =================================================================

-- バケットの確認
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets 
WHERE id = 'attachments';

-- ポリシーの確認  
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
