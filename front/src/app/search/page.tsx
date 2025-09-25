import { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchForm } from '@/components/search/SearchForm';
import { SearchResults } from '@/components/search/SearchResults';

export const metadata: Metadata = {
  title: '検索 | アイデアマーケット',
  description: 'アイデアを検索して、新しいインスピレーションを見つけましょう。',
};

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">アイデア検索</h1>
          <p className="text-muted-foreground">
            キーワードやCMT番号でアイデアを検索できます。
          </p>
        </div>

        <div className="space-y-8">
          <Suspense
            fallback={
              <div className="space-y-8">
                {/* 検索フォームのプレースホルダー */}
                <div className="p-4 border rounded-lg">
                  <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                {/* 検索結果のプレースホルダー */}
                <div className="p-4 border rounded-lg">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            }
          >
            <SearchForm />
            <SearchResults />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
