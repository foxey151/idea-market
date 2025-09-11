'use client';

import { useState, useEffect } from 'react';
import { getPageContent } from '@/lib/supabase/ideas';

export default function CompanyInfoPage() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await getPageContent('company');

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
        console.error('Error fetching company content:', err);
        setError('コンテンツの取得に失敗しました');
        setContent(getDefaultContent());
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const getDefaultContent = () => {
    return `<h2>会社概要</h2>
<p>当社は、革新的なアイデアを共有し、社会に貢献することを目的としたプラットフォームを提供しています。</p>

<h2>会社名</h2>
<p>株式会社アイデアマーケット</p>

<h2>代表取締役</h2>
<p>山田太郎</p>

<h2>設立年月日</h2>
<p>2024年1月1日</p>

<h2>資本金</h2>
<p>10,000,000円</p>

<h2>従業員数</h2>
<p>5名</p>

<h2>事業内容</h2>
<p>インターネットによる情報提供サービス<br />
ソフトウェア開発・販売<br />
コンサルティング業務</p>

<h2>所在地</h2>
<p>東京都渋谷区渋谷1-1-1<br />
渋谷ビル5F</p>

<h2>連絡先</h2>
<p>電話：03-1234-5678<br />
メール：info@ideamarket.co.jp</p>`;
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
            <h1 className="text-3xl font-bold mb-8 text-gray-900">会社情報</h1>

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
