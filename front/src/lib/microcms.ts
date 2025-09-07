import { createClient } from 'microcms-js-sdk';

if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY) {
  throw new Error('microCMS環境変数が設定されていません。MICROCMS_SERVICE_DOMAINとMICROCMS_API_KEYを設定してください。');
}

export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

// ブログ記事の型定義
export type Blog = {
  id: string;
  title: string;
  content: string;
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