import { createClient } from 'microcms-js-sdk';

if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY) {
  throw new Error('microCMS環境変数が設定されていません。MICROCMS_SERVICE_DOMAINとMICROCMS_API_KEYを設定してください。');
}

export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

// カテゴリの型定義
export type Category = {
  id: string;
  name: string;
  description?: string;
  image?: {
    url: string;
    width: number;
    height: number;
  };
  eyecatch?: {
    url: string;
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
};

// ブログ記事の型定義
export type Blog = {
  id: string;
  title: string;
  content: string;
  category?: Category;
  image?: {
    url: string;
    width: number;
    height: number;
  };
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

// microCMSからブログ一覧を取得
export async function getBlogs() {
  try {
    const response = await client.get({
      endpoint: 'blogs',
      queries: {
        orders: '-publishedAt',
        limit: 12,
      },
    });
    return response;
  } catch (error) {
    console.error('microCMSからのデータ取得に失敗しました:', error);
    throw new Error('ブログデータの取得に失敗しました。microCMSの設定を確認してください。');
  }
}

// microCMSからカテゴリ一覧を取得
export async function getCategories() {
  try {
    const response = await client.get({
      endpoint: 'categories',
      queries: {
        orders: 'name',
        limit: 100,
      },
    });
    return response;
  } catch (error) {
    console.error('microCMSからのカテゴリデータ取得に失敗しました:', error);
    throw new Error('カテゴリデータの取得に失敗しました。microCMSの設定を確認してください。');
  }
}

// カテゴリごとのブログ記事を取得
export async function getBlogsByCategory(categoryId: string) {
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
  } catch (error) {
    console.error('microCMSからのブログデータ取得に失敗しました:', error);
    throw new Error('ブログデータの取得に失敗しました。microCMSの設定を確認してください。');
  }
}

// microCMSから単一のブログ記事を取得
export async function getBlog(id: string) {
  try {
    const response = await client.get({
      endpoint: 'blogs',
      contentId: id,
    });
    return response;
  } catch (error) {
    console.error('microCMSからのデータ取得に失敗しました:', error);
    throw new Error('ブログ記事の取得に失敗しました。記事が存在しないか、microCMSの設定を確認してください。');
  }
}