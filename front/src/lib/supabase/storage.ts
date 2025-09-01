import { supabase } from './client'

// ファイルアップロード
export const uploadFile = async (
  file: File, 
  bucket: string = 'attachments',
  folder: string = 'ideas'
) => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('Supabase Storageアップロードエラー:', error)
      throw error
    }
    
    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)
    
    return { 
      data: { 
        path: data.path, 
        publicUrl: urlData.publicUrl 
      }, 
      error: null 
    }
  } catch (error) {
    console.error('ファイルアップロードエラー:', error)
    
    // エラーメッセージを取得
    let errorMessage = 'ファイルのアップロードに失敗しました'
    
    if (error && typeof error === 'object') {
      if ('message' in error) {
        errorMessage = String(error.message)
        
        // 特定のエラーメッセージを日本語化
        if (errorMessage.includes('row-level security') || errorMessage.includes('policy')) {
          errorMessage = 'Storageへのアクセス権限がありません。ログインしてから再度お試しください。'
        } else if (errorMessage.includes('413') || errorMessage.includes('too large') || errorMessage.includes('file size')) {
          errorMessage = 'ファイルサイズが大きすぎます。最大20MBまでのファイルを選択してください。'
        } else if (errorMessage.includes('Invalid bucket') || errorMessage.includes('not found')) {
          errorMessage = 'ストレージの設定に問題があります。管理者にお問い合わせください。'
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
        }
      }
    }
    
    return { data: null, error: errorMessage }
  }
}

// 複数ファイルアップロード
export const uploadFiles = async (
  files: File[], 
  bucket: string = 'attachments',
  folder: string = 'ideas'
) => {
  try {
    const uploadPromises = files.map(file => uploadFile(file, bucket, folder))
    const results = await Promise.all(uploadPromises)
    
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      const errorMessages = errors.map(result => result.error).join(', ')
      throw new Error(`${errors.length}/${files.length}件のファイルアップロードに失敗: ${errorMessages}`)
    }
    
    const uploadedFiles = results
      .filter(result => result.data)
      .map(result => result.data!)
    
    return { data: uploadedFiles, error: null }
  } catch (error) {
    console.error('複数ファイルアップロードエラー:', error)
    return { data: null, error: error instanceof Error ? error.message : '複数ファイルのアップロードに失敗しました' }
  }
}

// ファイル削除
export const deleteFile = async (
  filePath: string, 
  bucket: string = 'attachments'
) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath])
  
  return { error }
}

// ファイル一覧取得
export const listFiles = async (
  folder: string = 'ideas',
  bucket: string = 'attachments'
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder)
  
  return { data, error }
}

// ファイルURL取得
export const getFileUrl = async (
  filePath: string,
  bucket: string = 'attachments'
) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)
  
  return data.publicUrl
}

// 署名付きURL取得（プライベートファイル用）
export const getSignedUrl = async (
  filePath: string,
  expiresIn: number = 3600, // 1時間
  bucket: string = 'attachments'
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn)
  
  return { data, error }
}

// ファイルサイズとタイプのバリデーション
export const validateFile = (file: File, maxSize: number = 20 * 1024 * 1024) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'application/pdf'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'サポートされていないファイル形式です' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'ファイルサイズが大きすぎます（最大20MB）' }
  }
  
  return { valid: true, error: null }
}

// バッチファイルアップロード（進捗付き）
export const uploadFilesWithProgress = async (
  files: File[],
  onProgress: (progress: number) => void,
  bucket: string = 'attachments',
  folder: string = 'ideas'
) => {
  const results: Array<{ data: any; error: any }> = []
  let completed = 0
  
  for (const file of files) {
    const result = await uploadFile(file, bucket, folder)
    results.push(result)
    completed++
    onProgress((completed / files.length) * 100)
  }
  
  const errors = results.filter(result => result.error)
  if (errors.length > 0) {
    return { 
      data: null, 
      error: `${errors.length}/${files.length} files failed to upload` 
    }
  }
  
  const uploadedFiles = results
    .filter(result => result.data)
    .map(result => result.data)
  
  return { data: uploadedFiles, error: null }
}
