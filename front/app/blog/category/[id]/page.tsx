import {
  getBlogsByCategory,
  Blog,
  getCategories,
  Category,
} from '@/lib/microcms';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { BlogCategoryPageProps } from '@/types/blog';

export default async function CategoryBlogPage({
  params,
}: BlogCategoryPageProps) {
  const { id } = await params;
  const { contents: blogs } = await getBlogsByCategory(id);
  const { contents: categories } = await getCategories();
  const currentCategory = categories.find((cat: Category) => cat.id === id);

  if (!currentCategory) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        {/* ヘッダーセクション */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/blog" className="group">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                カテゴリ一覧に戻る
              </Link>
            </Button>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {currentCategory.name}
            </span>
          </h1>

          {currentCategory.description && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {currentCategory.description}
            </p>
          )}
        </div>

        {/* ブログ記事一覧 */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog: Blog) => (
            <Card
              key={blog.id}
              className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {blog.image && (
                <div className="relative overflow-hidden">
                  <Image
                    src={blog.image.url}
                    alt={blog.title}
                    width={blog.image.width}
                    height={blog.image.height}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                  <Link href={`/blog/${blog.id}`} className="line-clamp-2">
                    {blog.title}
                  </Link>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(blog.publishedAt).toLocaleDateString('ja-JP')}
                  </div>

                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/blog/${blog.id}`} className="group/btn">
                      読む
                      <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 空の状態 */}
        {blogs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              このカテゴリには記事がありません
            </h3>
            <p className="text-muted-foreground mb-6">
              新しい記事が公開されるまでお待ちください
            </p>
            <Button variant="outline" asChild>
              <Link href="/blog">他のカテゴリを見る</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// 静的パスの生成（オプション）
export async function generateStaticParams() {
  try {
    const { contents: categories } = await getCategories();
    return categories.map((category: Category) => ({
      id: category.id,
    }));
  } catch (error) {
    console.error('カテゴリの取得に失敗しました:', error);
    return [];
  }
}

// メタデータの生成
export async function generateMetadata({ params }: BlogCategoryPageProps) {
  try {
    const { id } = await params;
    const { contents: categories } = await getCategories();
    const category = categories.find((cat: Category) => cat.id === id);

    if (!category) {
      return {
        title: 'カテゴリが見つかりません',
      };
    }

    return {
      title: `${category.name} - ブログ | アイデアマーケット`,
      description: category.description || `${category.name}に関する記事一覧`,
    };
  } catch {
    return {
      title: 'ブログカテゴリ | アイデアマーケット',
      description: 'カテゴリ別ブログ記事一覧',
    };
  }
}
