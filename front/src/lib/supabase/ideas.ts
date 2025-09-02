import { supabase } from './client'
import { Database } from './types'

type Idea = Database['public']['Tables']['ideas']['Row']
type IdeaInsert = Database['public']['Tables']['ideas']['Insert']
type IdeaUpdate = Database['public']['Tables']['ideas']['Update']

// コメント数取得用のヘルパー関数
export const getCommentCount = async (ideaId: string) => {
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('idea_id', ideaId)
  
  return { count: count || 0, error }
}

// アイデア作成
export const createIdea = async (ideaData: Omit<IdeaInsert, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('ideas')
    .insert([ideaData])
    .select(`
      *,
      profiles(display_name, role)
    `)
    .single()
  
  return { data, error }
}

// アイデア一覧取得（公開中と完成済みを取得）
export const getIdeas = async (limit = 20, offset = 0) => {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      profiles(display_name, role)
    `)
    .in('status', ['published', 'closed'])
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  return { data, error }
}

// アイデア詳細取得
export const getIdeaById = async (id: string) => {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      profiles(display_name, role)
    `)
    .eq('id', id)
    .single()
  
  return { data, error }
}

// アイデアのコメント一覧取得
export const getCommentsByIdeaId = async (ideaId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles(display_name)
    `)
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: true })
  
  return { data, error }
}

// CMT番号でアイデア検索
export const getIdeaByCmtNo = async (cmtNo: string) => {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      profiles(display_name, role)
    `)
    .eq('mmb_no', cmtNo)
    .eq('status', 'published')
    .single()
  
  return { data, error }
}

// キーワードでアイデア検索（title, summaryの部分一致）
export const searchIdeas = async (keyword: string, limit = 20, offset = 0) => {
  if (!keyword.trim()) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      profiles(display_name, role)
    `)
    .or(`title.ilike.%${keyword}%,summary.ilike.%${keyword}%`)
    .in('status', ['published', 'closed'])
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  return { data, error }
}



// ユーザーのアイデア一覧取得
export const getUserIdeas = async (userId: string, limit = 20, offset = 0) => {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      profiles(display_name, role)
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  return { data, error }
}

// アイデア更新（セキュリティ強化版）
export const updateIdea = async (id: string, updates: IdeaUpdate) => {
  try {
    // 現在のユーザーを確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { data: null, error: { message: '認証が必要です' } }
    }

    // アイデアの所有者確認
    const { data: ideaCheck, error: checkError } = await supabase
      .from('ideas')
      .select('author_id')
      .eq('id', id)
      .single()

    if (checkError) {
      return { data: null, error: checkError }
    }

    if (!ideaCheck || ideaCheck.author_id !== user.id) {
      return { data: null, error: { message: '権限がありません' } }
    }

    // 更新実行
    const { data, error } = await supabase
      .from('ideas')
      .update(updates)
      .eq('id', id)
      .eq('author_id', user.id) // 二重チェック
      .select(`
        *,
        profiles(display_name, role)
      `)
      .single()
    
    return { data, error }
  } catch (error) {
    console.error('updateIdea セキュリティエラー:', error)
    return { data: null, error }
  }
}

// アイデア削除（セキュリティ強化版）
export const deleteIdea = async (id: string) => {
  try {
    // 現在のユーザーを確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: { message: '認証が必要です' } }
    }

    // アイデアの所有者確認
    const { data: ideaCheck, error: checkError } = await supabase
      .from('ideas')
      .select('author_id')
      .eq('id', id)
      .single()

    if (checkError) {
      return { error: checkError }
    }

    if (!ideaCheck || ideaCheck.author_id !== user.id) {
      return { error: { message: '権限がありません' } }
    }

    // 削除実行
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id)
      .eq('author_id', user.id) // 二重チェック
    
    return { error }
  } catch (error) {
    console.error('deleteIdea セキュリティエラー:', error)
    return { error }
  }
}

// 人気のアイデア取得（コメント数順）
export const getPopularIdeas = async (limit = 10) => {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      profiles(display_name, role)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false }) // TODO: コメント数でソート
    .limit(limit)
  
  return { data, error }
}

// 最新のアイデア取得
export const getLatestIdeas = async (limit = 10) => {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      profiles(display_name, role)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  return { data, error }
}

// コメント投稿
export const createComment = async (ideaId: string, text: string, authorId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      idea_id: ideaId,
      text: text,
      author_id: authorId
    }])
    .select(`
      *,
      profiles(display_name)
    `)
    .single()
  
  return { data, error }
}

// 期限切れアイデアを検出してステータスを更新
export const updateOverdueIdeas = async (userId: string) => {
  const now = new Date().toISOString()
  
  // 期限切れのアイデアを取得（締切があって過ぎているもの、または締切がないもの）
  const { data: overdueIdeas, error: fetchError } = await supabase
    .from('ideas')
    .select('id, deadline')
    .eq('author_id', userId)
    .eq('status', 'published')
    .or(`deadline.lt.${now},deadline.is.null`)
  
  if (fetchError) {
    console.error('期限切れアイデア取得エラー:', fetchError)
    return { error: fetchError }
  }

  if (overdueIdeas && overdueIdeas.length > 0) {
    const ideaIds = overdueIdeas.map((idea: any) => idea.id)
    
    // ステータスをoverdueに更新
    const { error: updateError } = await supabase
      .from('ideas')
      .update({ status: 'overdue' })
      .in('id', ideaIds)
    
    if (updateError) {
      console.error('ステータス更新エラー:', updateError)
      return { error: updateError }
    }
  }
  
  return { data: overdueIdeas }
}
