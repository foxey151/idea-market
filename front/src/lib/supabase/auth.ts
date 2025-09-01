import { supabase } from './client'
import { Database } from './types'

type Profile = Database['public']['Tables']['profiles']['Row']

// サインアップ
export const signUp = async (
  email: string, 
  password: string, 
  role: 'member' | 'company' = 'member'
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role }
    }
  })
  return { data, error }
}

// サインイン
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

// ソーシャルログイン
export const signInWithProvider = async (provider: 'google' | 'facebook') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })
  return { data, error }
}

// サインアウト
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// 現在のユーザー情報を取得
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// プロファイル情報を取得
export const getProfile = async (userId: string): Promise<{ data: Profile | null, error: any }> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data, error }
}

// プロファイル情報を更新
export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

// プロファイル情報を作成（サインアップ後のトリガー用）
export const createProfile = async (userId: string, role: 'member' | 'company' = 'member') => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      id: userId,
      role,
      display_name: null
    }])
    .select()
    .single()
  
  return { data, error }
}

// パスワードリセット
export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })
  return { error }
}

// パスワード更新
export const updatePassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({ password })
  return { error }
}