import { createClient } from 'microcms-js-sdk';
import type { Blog, Category, MicroCMSListResponse } from '../types/microcms';

// 環境変数の詳細な検証
export function validateMicroCMSConfig() {
  const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
  const apiKey = process.env.MICROCMS_API_KEY;
  
  const errors: string[] = [];
  
  if (!serviceDomain) {
    errors.push('MICROCMS_SERVICE_DOMAIN が設定されていません');
  } else if (serviceDomain.includes('.')) {
    errors.push('MICROCMS_SERVICE_DOMAIN にはドメイン名（例: "ideamarket"）のみを設定してください。"https://" や ".microcms.io" は不要です');
  }
  
  if (!apiKey) {
    errors.push('MICROCMS_API_KEY が設定されていません');
  } else if (apiKey.length < 20) {
    errors.push('MICROCMS_API_KEY が短すぎます。正しいAPIキーを設定してください');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    config: {
      serviceDomain,
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey ? `${apiKey.substring(0, 8)}...` : null,
    }
  };
}

const configValidation = validateMicroCMSConfig();
if (!configValidation.isValid) {
  console.error('microCMS設定エラー:', configValidation.errors);
  throw new Error(
    `microCMS環境変数が正しく設定されていません:\n${configValidation.errors.join('\n')}`
  );
}

export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
  apiKey: process.env.MICROCMS_API_KEY!,
});

// 型定義の再エクスポート（互換性のため）
export type { Blog, Category } from '../types/microcms';

// microCMSの接続をテストする関数
export async function testMicroCMSConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('microCMS接続テスト開始...');
    console.log('設定情報:', {
      serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
      hasApiKey: !!process.env.MICROCMS_API_KEY,
    });

    // まずシンプルなAPIコールを試す
    const response = await client.get({
      endpoint: 'blogs',
      queries: {
        limit: 1,
      },
    });

    console.log('microCMS接続成功:', response);
    return { success: true };
  } catch (error: any) {
    console.error('microCMS接続テスト失敗:', error);
    
    let errorMessage = 'Unknown error';
    if (error.message?.includes('<!DOCTYPE')) {
      errorMessage = 'HTMLレスポンスが返されました。APIエンドポイントまたは認証情報が間違っている可能性があります。';
    } else if (error.status === 401) {
      errorMessage = 'APIキーが無効です。';
    } else if (error.status === 404) {
      errorMessage = 'エンドポイントが見つかりません。サービスドメインまたはエンドポイント名を確認してください。';
    } else {
      errorMessage = error.message || '接続に失敗しました。';
    }
    
    return { success: false, error: errorMessage };
  }
}

// モックデータ（開発・テスト用）
const mockBlogs: MicroCMSListResponse<Blog> = {
  contents: [
    {
      id: 'mock-1',
      title: 'サンプルブログ記事 1',
      content: '<p>これはサンプルのブログ記事です。microCMSに実際のデータがない場合に表示されます。</p>',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock-2',
      title: 'サンプルブログ記事 2',
      content: '<p>microCMSの設定を確認してください。blogsエンドポイントが作成されていない可能性があります。</p>',
      publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1日前
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  totalCount: 2,
  offset: 0,
  limit: 3,
};

const mockCategories: MicroCMSListResponse<Category> = {
  contents: [
    {
      id: 'mock-cat-1',
      name: '技術',
      description: 'プログラミングや開発に関する記事',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock-cat-2',
      name: 'ビジネス',
      description: 'ビジネスやマーケティングに関する記事',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  totalCount: 2,
  offset: 0,
  limit: 100,
};

// microCMSからブログ一覧を取得
export async function getBlogs(): Promise<MicroCMSListResponse<Blog>> {
  try {
    console.log('microCMS設定情報:', {
      serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
      hasApiKey: !!process.env.MICROCMS_API_KEY,
      apiKeyPrefix: process.env.MICROCMS_API_KEY?.substring(0, 8) + '...',
    });

    const response = await client.get({
      endpoint: 'blogs',
      queries: {
        orders: '-publishedAt',
        limit: 3,
      },
    });
    return response;
  } catch (error: any) {
    console.error('microCMSからのデータ取得に失敗しました:', {
      error: error.message,
      status: error.status,
      response: error.response,
      config: error.config,
    });
    
    // より具体的なエラーメッセージを提供
    if (error.message?.includes('<!DOCTYPE')) {
      console.warn('microCMSのblogsエンドポイントが見つかりません。モックデータを返します。');
      return mockBlogs;
    }
    
    if (error.status === 404) {
      console.warn('microCMSのblogsエンドポイントが存在しません。モックデータを返します。');
      return mockBlogs;
    }
    
    // その他のエラーの場合はモックデータを返す
    console.warn('microCMSエラーのため、モックデータを返します:', error.message);
    return mockBlogs;
  }
}

// microCMSからカテゴリ一覧を取得
export async function getCategories(): Promise<MicroCMSListResponse<Category>> {
  try {
    const response = await client.get({
      endpoint: 'categories',
      queries: {
        orders: 'name',
        limit: 100,
      },
    });
    return response;
  } catch (error: any) {
    console.error('microCMSからのカテゴリデータ取得に失敗しました:', error);
    
    // HTMLレスポンスやエンドポイント不存在の場合はモックデータを返す
    if (error.message?.includes('<!DOCTYPE') || error.status === 404) {
      console.warn('microCMSのcategoriesエンドポイントが見つかりません。モックデータを返します。');
      return mockCategories;
    }
    
    console.warn('microCMSエラーのため、カテゴリのモックデータを返します:', error.message);
    return mockCategories;
  }
}

// カテゴリごとのブログ記事を取得
export async function getBlogsByCategory(categoryId: string): Promise<MicroCMSListResponse<Blog>> {
  try {
    const response = await client.get({
      endpoint: 'blogs',
      queries: {
        filters: `category[equals]${categoryId}`,
        orders: '-publishedAt',
        limit: 100,
      },
    });
    return response;
  } catch (error: any) {
    console.error('microCMSからのブログデータ取得に失敗しました:', error);
    
    // HTMLレスポンスやエンドポイント不存在の場合はモックデータを返す
    if (error.message?.includes('<!DOCTYPE') || error.status === 404) {
      console.warn('microCMSのblogsエンドポイントが見つかりません。カテゴリ別モックデータを返します。');
      return {
        ...mockBlogs,
        contents: mockBlogs.contents.filter(() => Math.random() > 0.5), // ランダムに一部を返す
      };
    }
    
    console.warn('microCMSエラーのため、カテゴリ別モックデータを返します:', error.message);
    return {
      ...mockBlogs,
      contents: mockBlogs.contents.slice(0, 1), // 1件だけ返す
    };
  }
}

// microCMSから単一のブログ記事を取得
export async function getBlog(id: string): Promise<Blog> {
  try {
    const response = await client.get({
      endpoint: 'blogs',
      contentId: id,
    });
    return response;
  } catch (error: any) {
    console.error('microCMSからのデータ取得に失敗しました:', error);
    
    // HTMLレスポンスやエンドポイント不存在の場合はモックデータを返す
    if (error.message?.includes('<!DOCTYPE') || error.status === 404) {
      console.warn(`microCMSのblogsエンドポイントが見つかりません。ID: ${id} のモックデータを返します。`);
      
      // リクエストされたIDに基づいてモックデータを返す
      const mockBlog = mockBlogs.contents.find(blog => blog.id === id);
      if (mockBlog) {
        return mockBlog;
      }
      
      // IDが見つからない場合は最初のモックデータを返す
      return {
        ...mockBlogs.contents[0],
        id,
        title: `サンプル記事 (ID: ${id})`,
        content: '<p>これはモックデータです。microCMSでblogsエンドポイントを作成してください。</p>',
      };
    }
    
    console.warn('microCMSエラーのため、モックブログデータを返します:', error.message);
    return {
      ...mockBlogs.contents[0],
      id,
      title: `エラー時のサンプル記事 (ID: ${id})`,
      content: '<p>microCMSへの接続でエラーが発生しました。設定を確認してください。</p>',
    };
  }
}
