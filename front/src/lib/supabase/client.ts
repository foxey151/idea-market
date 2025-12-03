import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

export function createClient() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key || url.length < 10 || key.length < 10) {
      // 環境変数が不足している場合はダミークライアントを返す
      return {
        auth: {
          getSession: () =>
            Promise.resolve({
              data: { session: null },
              error: new Error('Supabase未設定'),
            }),
          getUser: () =>
            Promise.resolve({
              data: { user: null },
              error: new Error('Supabase未設定'),
            }),
          onAuthStateChange: () => ({
            data: { subscription: { unsubscribe: () => {} } },
          }),
        },
        from: () => ({
          select: () =>
            Promise.resolve({ data: null, error: new Error('Supabase未設定') }),
          insert: () =>
            Promise.resolve({ data: null, error: new Error('Supabase未設定') }),
          update: () =>
            Promise.resolve({ data: null, error: new Error('Supabase未設定') }),
          delete: () =>
            Promise.resolve({ data: null, error: new Error('Supabase未設定') }),
        }),
      } as any;
    }

    const client = createBrowserClient<Database>(url, key);
    return client;
  } catch (error) {
    throw error;
  }
}

// ブラウザ用のSupabaseクライアント（型付き）
export const supabase = createClient();
