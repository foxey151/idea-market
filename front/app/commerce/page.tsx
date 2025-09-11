'use client';

import { useState, useEffect } from 'react';
import { getPageContent } from '@/lib/supabase/ideas';

export default function CommerceLawPage() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await getPageContent('commerce');

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
        console.error('Error fetching commerce content:', err);
        setError('コンテンツの取得に失敗しました');
        setContent(getDefaultContent());
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const getDefaultContent = () => {
    return `<h2>販売業者</h2>
<p>株式会社アイデアマーケット<br />
代表取締役：山田太郎<br />
所在地：東京都渋谷区渋谷1-1-1<br />
電話番号：03-1234-5678<br />
メールアドレス：info@ideamarket.co.jp</p>

<h2>運営統括責任者</h2>
<p>山田太郎</p>

<h2>商品等の販売価格・料金</h2>
<p>各商品・サービスの価格は、商品詳細ページに表示されます。表示価格には消費税が含まれます。</p>

<h2>商品等の代金支払時期及び支払方法</h2>
<p>商品購入時にクレジットカード決済によりお支払いいただきます。商品の提供は決済完了後となります。</p>

<h2>商品等の引渡時期</h2>
<p>商品の提供は決済完了後、即時または指定された期日に行われます。</p>

<h2>返品・交換について</h2>
<p>デジタルコンテンツの性質上、原則として返品・交換は承っておりません。ただし、商品に重大な欠陥がある場合は返品・交換を検討いたします。</p>

<h2>お問い合わせ</h2>
<p>ご質問等ございましたら、下記までお問い合わせください：<br />
メール：support@ideamarket.co.jp<br />
電話：03-1234-5678（平日10:00-18:00）</p>`;
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
            <h1 className="text-3xl font-bold mb-8 text-gray-900">
              特定商取引法に基づく表記
            </h1>

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
