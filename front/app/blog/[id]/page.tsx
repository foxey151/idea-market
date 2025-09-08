import { getBlog, getBlogs, Blog } from '@/lib/microcms';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, Eye } from 'lucide-react';
import { getBlogViewCount } from '@/lib/supabase/blog-views';
import { BlogViewTracker } from '@/components/BlogViewTracker';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BlogDetailPage({ params }: Props) {
  try {
    const { id } = await params;
    const blog = await getBlog(id);
    const viewCount = await getBlogViewCount(id);

    // 読了時間の計算（簡易版）
    const readingTime = Math.ceil(
      blog.content.replace(/<[^>]*>/g, '').length / 400
    );

    return (
      <div className="min-h-screen bg-gradient-subtle">
        {/* 閲覧数記録コンポーネント */}
        <BlogViewTracker blogId={id} />

        <div className="container mx-auto px-4 py-8">
          {/* 戻るボタン */}
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link href="/blog" className="group">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                ブログ一覧に戻る
              </Link>
            </Button>
          </div>

          <article className="max-w-4xl mx-auto">
            {/* ヘッダー */}
            <header className="mb-12 text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                {blog.title}
              </h1>

              <div className="flex items-center justify-center gap-6 text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <time dateTime={blog.publishedAt}>
                    {new Date(blog.publishedAt).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>

                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />約{readingTime}分で読めます
                </div>

                {/* 閲覧数を追加 */}
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  {viewCount.view_count.toLocaleString()}回閲覧
                </div>
              </div>
            </header>

            {/* アイキャッチ画像 */}
            {blog.image && (
              <div className="mb-12 rounded-2xl overflow-hidden shadow-elegant">
                <Image
                  src={blog.image.url}
                  alt={blog.title}
                  width={blog.image.width}
                  height={blog.image.height}
                  className="w-full h-64 md:h-96 object-cover"
                  priority
                />
              </div>
            )}

            {/* 記事本文 */}
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8 md:p-12 shadow-soft">
              <div
                className="prose prose-lg max-w-none 
                  prose-headings:text-foreground 
                  prose-p:text-foreground/90 
                  prose-a:text-primary 
                  prose-strong:text-foreground
                  prose-code:text-primary
                  prose-pre:bg-muted
                  prose-blockquote:border-primary
                  prose-img:rounded-lg
                  prose-img:shadow-soft"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>

            {/* フッター */}
            <footer className="mt-16 pt-8 border-t border-border/50 text-center">
              <Button variant="hero" size="lg" asChild>
                <Link href="/blog">
                  他の記事も読む
                  <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
                </Link>
              </Button>
            </footer>
          </article>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}

// 静的生成のためのパス生成
export async function generateStaticParams() {
  try {
    const { contents: blogs } = await getBlogs();

    return blogs.map((blog: Blog) => ({
      id: blog.id,
    }));
  } catch {
    return [];
  }
}

// メタデータ生成
export async function generateMetadata({ params }: Props) {
  try {
    const { id } = await params;
    const blog = await getBlog(id);

    return {
      title: `${blog.title} | アイデアマーケット ブログ`,
      description: blog.content.replace(/<[^>]*>/g, '').substring(0, 160),
      openGraph: {
        title: blog.title,
        description: blog.content.replace(/<[^>]*>/g, '').substring(0, 160),
        images: blog.image ? [blog.image.url] : [],
        type: 'article',
        publishedTime: blog.publishedAt,
      },
    };
  } catch {
    return {
      title: 'ブログ記事が見つかりません | アイデアマーケット',
    };
  }
}
