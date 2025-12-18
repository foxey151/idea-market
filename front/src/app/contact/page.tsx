'use client';

import { useState, useEffect } from 'react';
import { getPageContent } from '@/lib/supabase/ideas';

export default function ContactPage() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await getPageContent('contact');

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
        console.error('Error fetching contact content:', err);
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
    return `<h2>お問い合わせ</h2>
<p>アイデアマーケットへのお問い合わせは、下記の連絡先までお願いいたします。</p>

<h2>お問い合わせ先</h2>
<p><strong>メールアドレス：</strong>info@ideamarket.co.jp</p>
<p><strong>電話番号：</strong>03-1234-5678</p>
<p><strong>受付時間：</strong>平日 10:00〜18:00（土日祝日・年末年始を除く）</p>

<h2>お問い合わせの種類</h2>
<h3>サービスに関するお問い合わせ</h3>
<p>アイデアマーケットのサービス内容、利用方法に関するご質問はこちらからお願いいたします。</p>

<h3>アイデアの投稿・購入に関するお問い合わせ</h3>
<p>アイデアの投稿方法、購入手続き、決済に関するご質問はこちらからお願いいたします。</p>

<h3>技術的なお問い合わせ</h3>
<p>サイトの不具合、エラー等に関するご報告はこちらからお願いいたします。</p>

<h3>広告掲載に関するお問い合わせ</h3>
<p>広告掲載をご検討の企業様は、<a href="/advertising">広告掲載について</a>のページもご参照ください。</p>

<h3>その他のお問い合わせ</h3>
<p>上記以外のお問い合わせは、メールにてお願いいたします。</p>

<h2>お問い合わせの際のお願い</h2>
<ul>
<li>お問い合わせの際は、件名に問い合わせ内容の概要をご記入ください。</li>
<li>会員の方は、登録メールアドレスからお問い合わせいただくとスムーズに対応できます。</li>
<li>お問い合わせ内容によっては、回答までにお時間をいただく場合がございます。</li>
<li>土日祝日にいただいたお問い合わせは、翌営業日以降の対応となります。</li>
</ul>

<h2>所在地</h2>
<p>〒150-0001<br />
東京都渋谷区渋谷1-1-1<br />
渋谷ビル5F<br />
株式会社アイデアマーケット</p>`;
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
            <h1 className="text-3xl font-bold mb-8 text-gray-900">お問い合わせ</h1>

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
