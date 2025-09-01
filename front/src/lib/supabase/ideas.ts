import { supabase } from './client'
import { Database } from './types'

type Idea = Database['public']['Tables']['ideas']['Row']
type IdeaInsert = Database['public']['Tables']['ideas']['Insert']
type IdeaUpdate = Database['public']['Tables']['ideas']['Update']

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
      profiles(display_name, role),
      comments(count)
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
      profiles(display_name, role),
      comments(
        *,
        profiles(display_name)
      ),
      idea_versions(
        id,
        type,
        title,
        summary,
        price,
        is_published,
        purchase_count
      )
    `)
    .eq('id', id)
    .single()
  
  return { data, error }
}

// CMT番号でアイデア検索
export const getIdeaByCmtNo = async (cmtNo: string) => {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      profiles(display_name, role),
      comments(count)
    `)
    .eq('cmt_no', cmtNo)
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

// タグでアイデア検索
export const getIdeasByTag = async (tag: string, limit = 20, offset = 0) => {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      profiles(display_name, role),
      comments(count)
    `)
    .contains('tags', [tag])
    .eq('status', 'published')
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
      profiles(display_name, role),
      comments(count),
      idea_versions(count)
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
      profiles(display_name, role),
      comments(count)
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
      profiles(display_name, role),
      comments(count)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  return { data, error }
}
