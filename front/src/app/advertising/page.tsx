'use client';

import { useState, useEffect } from 'react';
import { getPageContent } from '@/lib/supabase/ideas';

export default function AdvertisingPage() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await getPageContent('advertising');

        if (error) {
          // データが存在しない場合はデフォルトコンテンツを表示
          if (error.code === 'PGRST116') {
            setContent(getDefaultContent());
            setUpdatedAt(null);
          } else {
            setError('コンテンツの取得に失敗しました');
          }
        } else {
          setContent(data?.content || getDefaultContent());
          setUpdatedAt(data?.updated_at ? new Date(data.updated_at) : null);
        }
      } catch (err) {
        console.error('Error fetching advertising content:', err);
        setError('コンテンツの取得に失敗しました');
        setContent(getDefaultContent());
        setUpdatedAt(null);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const getDefaultContent = () => {
    return `<h2>広告掲載について</h2>
<p>アイデアマーケットでは、企業様向けの広告掲載サービスを提供しております。当プラットフォームは、革新的なアイデアに関心の高いユーザーが集まる場であり、効果的なプロモーションが可能です。</p>

<h2>広告メニュー</h2>
<h3>バナー広告</h3>
<p>サイト内の目立つ位置にバナー広告を掲載いただけます。</p>
<ul>
<li>トップページバナー</li>
<li>アイデア一覧ページバナー</li>
<li>サイドバナー</li>
</ul>

<h3>記事広告</h3>
<p>御社の商品・サービスを紹介する記事形式の広告を掲載いただけます。</p>

<h3>メール広告</h3>
<p>会員向けメールマガジンへの広告掲載が可能です。</p>

<h2>料金について</h2>
<p>広告料金は掲載位置、期間、形式によって異なります。詳細はお問い合わせください。</p>

<h2>掲載までの流れ</h2>
<ol>
<li>お問い合わせフォームよりご連絡</li>
<li>担当者よりご連絡・ヒアリング</li>
<li>広告プランのご提案・お見積り</li>
<li>ご契約・入稿</li>
<li>掲載開始</li>
</ol>

<h2>お問い合わせ</h2>
<p>広告掲載に関するお問い合わせは、<a href="/contact">お問い合わせページ</a>よりご連絡ください。</p>
<p>メール：advertising@ideamarket.co.jp</p>`;
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
            <h1 className="text-3xl font-bold mb-8 text-gray-900">広告掲載について</h1>

            <div className="prose prose-sm max-w-none text-gray-700">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>

            <div className="mt-8 text-right text-sm text-gray-500">
              制定日：2024年1月1日
              <br />
              最終更新日：{updatedAt ? updatedAt.toLocaleDateString('ja-JP') : '2024年1月1日'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
