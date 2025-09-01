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

// アイデア一覧取得
export const getIdeas = async (limit = 20, offset = 0) => {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      profiles(display_name, role)
    `)
    .eq('status', 'published')
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

// キーワードでアイデア検索
export const searchIdeas = async (keyword: string, limit = 20, offset = 0) => {
  const { data, error } = await supabase
    .rpc('search_ideas_by_keyword', {
      search_term: keyword,
      limit_count: limit,
      offset_count: offset
    })
  
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

// アイデア更新
export const updateIdea = async (id: string, updates: IdeaUpdate) => {
  const { data, error } = await supabase
    .from('ideas')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      profiles(display_name, role)
    `)
    .single()
  
  return { data, error }
}

// アイデア削除
export const deleteIdea = async (id: string) => {
  const { error } = await supabase
    .from('ideas')
    .delete()
    .eq('id', id)
  
  return { error }
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
