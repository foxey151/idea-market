import { getCategories, Category } from '@/lib/microcms';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, ArrowRight } from 'lucide-react';

export default async function BlogPage() {
  const { contents: categories } = await getCategories();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        {/* ヘッダーセクション */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              ブログカテゴリ
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            カテゴリ別に記事を探して、興味のあるトピックを深く学びましょう
          </p>
        </div>

        {/* カテゴリ一覧 */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category: Category) => (
            <Card key={category.id} className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              {category.eyecatch ? (
                <div className="relative overflow-hidden">
                  <Image
                    src={category.eyecatch.url}
                    alt={category.name}
                    width={category.eyecatch.width}
                    height={category.eyecatch.height}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ) : category.image ? (
                <div className="relative overflow-hidden">
                  <Image
                    src={category.image.url}
                    alt={category.name}
                    width={category.image.width}
                    height={category.image.height}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                  <FolderOpen className="h-16 w-16 text-primary/40" />
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                  <Link href={`/blog/category/${category.id}`} className="line-clamp-2">
                    {category.name}
                  </Link>
                </CardTitle>
                {category.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {category.description}
                  </p>
                )}
              </CardHeader>

              <CardContent>
                <Button variant="ghost" size="sm" asChild className="w-full">
                  <Link href={`/blog/category/${category.id}`} className="group/btn">
                    記事を見る
                    <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 空の状態 */}
        {categories.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">まだカテゴリがありません</h3>
            <p className="text-muted-foreground">
              新しいカテゴリが追加されるまでお待ちください
            </p>
          </div>
        )}
      </div>
    </div>
  );
}