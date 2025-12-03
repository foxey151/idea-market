import { supabase } from './supabase/client';
import { getAuthors } from './microcms';

/**
 * 著者情報の型定義
 */
export interface AuthorInfo {
  id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  isRegistered: boolean;
}

/**
 * モック著者データ（著者登録がない場合）
 */
const MOCK_AUTHOR: AuthorInfo = {
  id: 'unknown',
  display_name: '著者登録なし',
  avatar_url: undefined,
  bio: 'この記事の著者は登録されていません',
  isRegistered: false,
};

/**
 * ブログ記事のuser_idから著者情報を取得する
 * @param blogUserId ブログ記事のuser_idフィールド（著者のcontentId）
 * @returns 著者情報またはモックデータ
 */
export async function getAuthorByBlogUserId(blogUserId: string | undefined): Promise<AuthorInfo> {
  try {
    // user_idが未設定の場合はモックデータを返す
    if (!blogUserId) {
      return MOCK_AUTHOR;
    }

    // 1. microCMSから著者のcontentIdでSupabaseのuser_idを取得
    const authorsResponse = await getAuthors();
    const author = authorsResponse.contents.find(author => author.id === blogUserId);

    if (!author) {
      return MOCK_AUTHOR;
    }

    const supabaseUserId = author.user_id;

    // 2. Supabaseのprofileテーブルから著者情報を取得
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .eq('id', supabaseUserId)
      .single();

    if (error || !profile) {
      // プロフィールが見つからない場合でも基本情報は返す
      return {
        id: supabaseUserId,
        display_name: 'ユーザー',
        avatar_url: undefined,
        bio: undefined,
        isRegistered: true,
      };
    }

    return {
      id: profile.id,
      display_name: profile.display_name || 'ユーザー',
      avatar_url: profile.avatar_url || undefined,
      bio: undefined,
      isRegistered: true,
    };

  } catch (error) {
    return MOCK_AUTHOR;
  }
}

/**
 * 複数のブログ記事の著者情報を一括取得する（パフォーマンス向上のため）
 * @param blogUserIds ブログ記事のuser_idフィールドの配列
 * @returns 著者情報のマップ（key: blogUserId, value: AuthorInfo）
 */
export async function getAuthorsByBlogUserIds(
  blogUserIds: (string | undefined)[]
): Promise<Map<string, AuthorInfo>> {
  const authorMap = new Map<string, AuthorInfo>();

  try {
    // 有効なuser_idのみを抽出
    const validUserIds = blogUserIds.filter((id): id is string => !!id);
    
    if (validUserIds.length === 0) {
      return authorMap;
    }

    // 1. microCMSから著者情報を一括取得
    const authorsResponse = await getAuthors();
    const authors = authorsResponse.contents.filter(author => 
      validUserIds.includes(author.id)
    );

    // 2. Supabaseから対応するプロフィール情報を一括取得
    const supabaseUserIds = authors.map(author => author.user_id);
    
    if (supabaseUserIds.length > 0) {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', supabaseUserIds);

      // 3. データをマップに格納
      for (const author of authors) {
        const profile = profiles?.find((p: any) => p.id === author.user_id);
        
        authorMap.set(author.id, {
          id: author.user_id,
          display_name: profile?.display_name || 'ユーザー',
          avatar_url: profile?.avatar_url || undefined,
          bio: undefined,
          isRegistered: true,
        });
      }
    }

    // 4. 見つからなかったuser_idにはモックデータを設定
    for (const userId of validUserIds) {
      if (!authorMap.has(userId)) {
        authorMap.set(userId, MOCK_AUTHOR);
      }
    }

  } catch (error) {
    // エラー時はすべてモックデータで埋める
    for (const userId of blogUserIds) {
      if (userId) {
        authorMap.set(userId, MOCK_AUTHOR);
      }
    }
  }

  return authorMap;
}
