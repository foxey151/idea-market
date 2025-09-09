import { getBlogs, getCategories, Category, Blog } from '@/lib/microcms';
import { getBlogViewCounts, getPopularBlogs } from '@/lib/supabase/blog-views';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FolderOpen,
  ArrowRight,
  Calendar,
  Eye,
  TrendingUp,
  Plus,
} from 'lucide-react';

export default async function BlogPage() {
  const [{ contents: categories }, { contents: blogs }, popularBlogData] =
    await Promise.all([getCategories(), getBlogs(), getPopularBlogs(6)]);

  // 人気記事のIDリストを取得
  const popularBlogIds = popularBlogData.map((item: any) => item.blog_id);

  // 全ブログの閲覧数を取得
  const blogIds = blogs.map((blog: Blog) => blog.id);
  const blogViewCounts = await getBlogViewCounts(blogIds);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        {/* ヘッダーセクション */}
        <div className="mb-16">
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1"></div>
            <div className="text-center flex-1">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  ブログ
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                最新の記事や人気記事をチェックして、興味のあるトピックを深く学びましょう
              </p>
            </div>
            
            {/* 新規投稿ボタン */}
            <div className="flex-1 flex justify-end">
              <Button asChild>
                <Link href="/blog/new">
                  <Plus className="w-4 h-4 mr-2" />
                  新規投稿
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 人気記事セクション */}
        {popularBlogData.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">人気記事</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {popularBlogIds
                .map((id: string) => blogs.find((blog: Blog) => blog.id === id))
                .filter(
                  (blog: Blog | undefined): blog is Blog => blog !== undefined
                )
                .slice(0, 6)
                .map((blog: Blog) => {
                  const viewData = blogViewCounts.find(
                    item => item.blog_id === blog.id
                  );
                  return (
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
                          <div className="absolute top-3 left-3">
                            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              人気
                            </div>
                          </div>
                        </div>
                      )}

                      <CardHeader>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                          <Link
                            href={`/blog/${blog.id}`}
                            className="line-clamp-2"
                          >
                            {blog.title}
                          </Link>
                        </CardTitle>
                      </CardHeader>

                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(blog.publishedAt).toLocaleDateString(
                              'ja-JP'
                            )}
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {viewData?.view_count.toLocaleString() || 0}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="w-full"
                        >
                          <Link href={`/blog/${blog.id}`} className="group/btn">
                            読む
                            <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </section>
        )}

        {/* 最新記事セクション */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">最新記事</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.slice(0, 6).map((blog: Blog) => {
              const viewData = blogViewCounts.find(
                item => item.blog_id === blog.id
              );
              return (
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
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(blog.publishedAt).toLocaleDateString('ja-JP')}
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {viewData?.view_count.toLocaleString() || 0}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="w-full"
                    >
                      <Link href={`/blog/${blog.id}`} className="group/btn">
                        読む
                        <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* カテゴリ一覧 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">カテゴリ別に記事を探す</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category: Category) => (
              <Card
                key={category.id}
                className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
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
                    <Link
                      href={`/blog/category/${category.id}`}
                      className="line-clamp-2"
                    >
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
                    <Link
                      href={`/blog/category/${category.id}`}
                      className="group/btn"
                    >
                      記事を見る
                      <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* カテゴリの空の状態 */}
          {categories.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                まだカテゴリがありません
              </h3>
              <p className="text-muted-foreground">
                新しいカテゴリが追加されるまでお待ちください
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
