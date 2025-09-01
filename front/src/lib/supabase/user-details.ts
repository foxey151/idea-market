import { supabase } from './client'
import type { Database } from './types'

// ユーザ詳細情報の型エイリアス
export type UserDetails = Database['public']['Tables']['user_details']['Row']
export type UserDetailsInsert = Database['public']['Tables']['user_details']['Insert']
export type UserDetailsUpdate = Database['public']['Tables']['user_details']['Update']

// 口座種別の型
export type AccountType = Database['public']['Enums']['account_type_enum']
// 性別の型
export type Gender = Database['public']['Enums']['gender_enum']
// 都道府県の型
export type Prefecture = Database['public']['Enums']['prefecture_enum']

// =================================================================
// ユーザ詳細情報の取得
// =================================================================

/**
 * 指定されたユーザーIDのユーザ詳細情報を取得する
 * @param userId ユーザーID
 * @returns ユーザ詳細情報またはnull
 */
export async function getUserDetails(userId: string) {
  const { data, error } = await supabase
    .from('user_details')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = No rows found (レコードが存在しない場合)
    console.error('ユーザ詳細情報の取得に失敗:', error)
    return { data: null, error }
  }

  return { data: error?.code === 'PGRST116' ? null : data, error: null }
}

/**
 * 現在のログインユーザーのユーザ詳細情報を取得する
 * @returns ユーザ詳細情報またはnull
 */
export async function getCurrentUserDetails() {
  try {
    const { data: user, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('認証エラー:', authError)
      return { data: null, error: authError }
    }
    
    if (!user.user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('ユーザーがログインしていません')
      }
      return { data: null, error: { message: 'ユーザーがログインしていません' } }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('現在のユーザー:', user.user.id)
    }
    return getUserDetails(user.user.id)
  } catch (error) {
    console.error('getCurrentUserDetailsでエラー:', error)
    return { data: null, error }
  }
}

// =================================================================
// プロフィール存在確認・作成
// =================================================================

/**
 * 指定されたユーザーIDのプロフィールが存在することを確認し、
 * 存在しない場合は作成する
 * @param userId ユーザーID
 */
async function ensureProfileExists(userId: string) {
  // まずプロフィールの存在確認
  const { data: profile, error: selectError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (selectError && selectError.code !== 'PGRST116') {
    // PGRST116以外のエラーは実際のエラー
    console.error('プロフィール確認エラー:', selectError)
    throw selectError
  }

  if (!profile) {
    // プロフィールが存在しない場合は作成
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        role: 'member',
        display_name: 'ユーザー'
      })

    if (insertError) {
      console.error('プロフィール作成エラー:', insertError)
      throw insertError
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('プロフィールを作成しました:', userId)
    }
  }
}

// =================================================================
// ユーザ詳細情報の作成・更新
// =================================================================

/**
 * ユーザ詳細情報を作成・更新する（upsert）
 * @param userDetails ユーザ詳細情報
 * @returns 作成・更新されたユーザ詳細情報
 */
export async function upsertUserDetails(userDetails: UserDetailsInsert) {
  // まず、profilesテーブルにレコードが存在することを確認
  await ensureProfileExists(userDetails.user_id)
  
  const { data, error } = await supabase
    .from('user_details')
    .upsert(userDetails, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    console.error('ユーザ詳細情報の保存に失敗:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * ユーザ詳細情報を作成する
 * @param userDetails ユーザ詳細情報
 * @returns 作成されたユーザ詳細情報
 */
export async function createUserDetails(userDetails: UserDetailsInsert) {
  // まず、profilesテーブルにレコードが存在することを確認
  await ensureProfileExists(userDetails.user_id)
  
  const { data, error } = await supabase
    .from('user_details')
    .insert(userDetails)
    .select()
    .single()

  if (error) {
    console.error('ユーザ詳細情報の作成に失敗:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * ユーザ詳細情報を更新する
 * @param userId ユーザーID
 * @param updates 更新データ
 * @returns 更新されたユーザ詳細情報
 */
export async function updateUserDetails(userId: string, updates: UserDetailsUpdate) {
  const { data, error } = await supabase
    .from('user_details')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('ユーザ詳細情報の更新に失敗:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * 現在のログインユーザーのユーザ詳細情報を更新する
 * @param updates 更新データ
 * @returns 更新されたユーザ詳細情報
 */
export async function updateCurrentUserDetails(updates: UserDetailsUpdate) {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) {
    return { data: null, error: { message: 'ユーザーがログインしていません' } }
  }

  return updateUserDetails(user.user.id, updates)
}

// =================================================================
// ユーザ詳細情報の削除
// =================================================================

/**
 * ユーザ詳細情報を削除する
 * @param userId ユーザーID
 * @returns 削除結果
 */
export async function deleteUserDetails(userId: string) {
  const { error } = await supabase
    .from('user_details')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('ユーザ詳細情報の削除に失敗:', error)
    return { error }
  }

  return { error: null }
}

// =================================================================
// プロファイルとユーザ詳細情報の結合取得
// =================================================================

/**
 * プロファイルとユーザ詳細情報を結合して取得する
 * @param userId ユーザーID
 * @returns プロファイルとユーザ詳細情報
 */
export async function getProfileWithDetails(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user_details (*)
    `)
    .eq('id', userId)
    .single()

  if (error) {
    console.error('プロファイルの取得に失敗:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * 現在のログインユーザーのプロファイルとユーザ詳細情報を取得する
 * @returns プロファイルとユーザ詳細情報
 */
export async function getCurrentProfileWithDetails() {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) {
    return { data: null, error: { message: 'ユーザーがログインしていません' } }
  }

  return getProfileWithDetails(user.user.id)
}

// =================================================================
// バリデーション関数
// =================================================================

/**
 * メールアドレスの形式をバリデーションする
 * @param email メールアドレス
 * @returns バリデーション結果
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 口座番号の形式をバリデーションする（7-8桁の数字）
 * @param accountNumber 口座番号
 * @returns バリデーション結果
 */
export function validateAccountNumber(accountNumber: string): boolean {
  const accountRegex = /^\d{7,8}$/
  return accountRegex.test(accountNumber)
}

/**
 * 生年月日の形式をバリデーションする（YYYY-MM-DD）
 * @param birthDate 生年月日
 * @returns バリデーション結果
 */
export function validateBirthDate(birthDate: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(birthDate)) {
    return false
  }

  const date = new Date(birthDate)
  const today = new Date()
  
  // 有効な日付かつ今日より前の日付であることを確認
  return date instanceof Date && !isNaN(date.getTime()) && date <= today
}

// =================================================================
// 選択肢データ
// =================================================================

/**
 * 口座種別の選択肢
 */
export const ACCOUNT_TYPE_OPTIONS = [
  { value: 'ordinary' as AccountType, label: '普通預金' },
  { value: 'current' as AccountType, label: '当座預金' }
] as const

/**
 * 性別の選択肢
 */
export const GENDER_OPTIONS = [
  { value: 'male' as Gender, label: '男性' },
  { value: 'female' as Gender, label: '女性' },
  { value: 'other' as Gender, label: 'その他' }
] as const

/**
 * 都道府県の選択肢
 */
export const PREFECTURE_OPTIONS = [
  { value: 'hokkaido' as Prefecture, label: '北海道' },
  { value: 'aomori' as Prefecture, label: '青森県' },
  { value: 'iwate' as Prefecture, label: '岩手県' },
  { value: 'miyagi' as Prefecture, label: '宮城県' },
  { value: 'akita' as Prefecture, label: '秋田県' },
  { value: 'yamagata' as Prefecture, label: '山形県' },
  { value: 'fukushima' as Prefecture, label: '福島県' },
  { value: 'ibaraki' as Prefecture, label: '茨城県' },
  { value: 'tochigi' as Prefecture, label: '栃木県' },
  { value: 'gunma' as Prefecture, label: '群馬県' },
  { value: 'saitama' as Prefecture, label: '埼玉県' },
  { value: 'chiba' as Prefecture, label: '千葉県' },
  { value: 'tokyo' as Prefecture, label: '東京都' },
  { value: 'kanagawa' as Prefecture, label: '神奈川県' },
  { value: 'niigata' as Prefecture, label: '新潟県' },
  { value: 'toyama' as Prefecture, label: '富山県' },
  { value: 'ishikawa' as Prefecture, label: '石川県' },
  { value: 'fukui' as Prefecture, label: '福井県' },
  { value: 'yamanashi' as Prefecture, label: '山梨県' },
  { value: 'nagano' as Prefecture, label: '長野県' },
  { value: 'gifu' as Prefecture, label: '岐阜県' },
  { value: 'shizuoka' as Prefecture, label: '静岡県' },
  { value: 'aichi' as Prefecture, label: '愛知県' },
  { value: 'mie' as Prefecture, label: '三重県' },
  { value: 'shiga' as Prefecture, label: '滋賀県' },
  { value: 'kyoto' as Prefecture, label: '京都府' },
  { value: 'osaka' as Prefecture, label: '大阪府' },
  { value: 'hyogo' as Prefecture, label: '兵庫県' },
  { value: 'nara' as Prefecture, label: '奈良県' },
  { value: 'wakayama' as Prefecture, label: '和歌山県' },
  { value: 'tottori' as Prefecture, label: '鳥取県' },
  { value: 'shimane' as Prefecture, label: '島根県' },
  { value: 'okayama' as Prefecture, label: '岡山県' },
  { value: 'hiroshima' as Prefecture, label: '広島県' },
  { value: 'yamaguchi' as Prefecture, label: '山口県' },
  { value: 'tokushima' as Prefecture, label: '徳島県' },
  { value: 'kagawa' as Prefecture, label: '香川県' },
  { value: 'ehime' as Prefecture, label: '愛媛県' },
  { value: 'kochi' as Prefecture, label: '高知県' },
  { value: 'fukuoka' as Prefecture, label: '福岡県' },
  { value: 'saga' as Prefecture, label: '佐賀県' },
  { value: 'nagasaki' as Prefecture, label: '長崎県' },
  { value: 'kumamoto' as Prefecture, label: '熊本県' },
  { value: 'oita' as Prefecture, label: '大分県' },
  { value: 'miyazaki' as Prefecture, label: '宮崎県' },
  { value: 'kagoshima' as Prefecture, label: '鹿児島県' },
  { value: 'okinawa' as Prefecture, label: '沖縄県' }
] as const
