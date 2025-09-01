import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('Supabase設定チェック:', {
      url: url ? '設定済み' : '未設定',
      key: key ? '設定済み' : '未設定',
      urlLength: url?.length || 0,
      keyLength: key?.length || 0
    })
    
      if (!url || !key || url.length < 10 || key.length < 10) {
    const error = 'Supabaseの環境変数が設定されていません。.env.localファイルにNEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEYを設定してください。'
    console.error(error)
    console.error('現在の値:', { url: url?.substring(0, 20) + '...', key: key?.substring(0, 20) + '...' })
    
    // 環境変数が不足している場合はダミークライアントを返す
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase未設定') }),
        getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase未設定') }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        select: () => Promise.resolve({ data: null, error: new Error('Supabase未設定') }),
        insert: () => Promise.resolve({ data: null, error: new Error('Supabase未設定') }),
        update: () => Promise.resolve({ data: null, error: new Error('Supabase未設定') }),
        delete: () => Promise.resolve({ data: null, error: new Error('Supabase未設定') })
      })
    } as any
  }
    
    console.log('Supabaseクライアント作成中...')
    const client = createBrowserClient<Database>(url, key)
    console.log('Supabaseクライアント作成完了')
    return client
  } catch (error) {
    console.error('Supabaseクライアント作成エラー:', error)
    throw error
  }
}

// ブラウザ用のSupabaseクライアント（型付き）
export const supabase = createClient()
