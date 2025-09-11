'use client';

import { useState, useEffect } from 'react';
import { getPageContent } from '@/lib/supabase/ideas';

export default function TermsPage() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await getPageContent('terms');

        if (error) {
          // データが存在しない場合はデフォルトコンテンツを表示
          if (error.code === 'PGRST116') {
            setContent(getDefaultContent());
          } else {
            setError('コンテンツの取得に失敗しました');
          }
        } else {
          setContent(data?.content || getDefaultContent());
        }
      } catch (err) {
        console.error('Error fetching terms content:', err);
        setError('コンテンツの取得に失敗しました');
        setContent(getDefaultContent());
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const getDefaultContent = () => {
    return `<h2>第1条（適用範囲）</h2>
<p>このプライバシーポリシー（以下、「本ポリシー」といいます。）は、当サービス（以下、「本サービス」といいます。）における個人情報の取り扱いについて定めるものです。本サービスをご利用になる場合、本ポリシーに同意したものとみなされます。</p>

<h2>第2条（個人情報の収集）</h2>
<p>当サービスは、以下の方法により個人情報を収集します：アカウント登録時、サービス利用時、問い合わせ時などに提供いただく情報、アクセスログ、Cookieなどの自動収集情報。</p>

`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">読み込み中...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="text-center py-16">
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">利用規約</h1>

            <div className="prose prose-sm max-w-none text-gray-700">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>

            <div className="mt-8 text-right text-sm text-gray-500">
              制定日：2024年1月1日
              <br />
              最終更新日：{new Date().toLocaleDateString('ja-JP')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
