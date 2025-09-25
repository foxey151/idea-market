import { getBlog } from '@/lib/microcms';
import { notFound } from 'next/navigation';
import BlogEditForm from '@/components/forms/BlogEditForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BlogDetailPageProps } from '@/types/blog';

export default async function BlogEditPage({ params }: BlogDetailPageProps) {
  try {
    const { id } = await params;
    const blog = await getBlog(id);

    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-6">
              <Link href={`/blog/${id}`} className="group">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                記事詳細に戻る
              </Link>
            </Button>

            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  記事編集
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                ブログ記事の内容を編集・更新できます
              </p>
            </div>
          </div>

          {/* 編集フォーム */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8 md:p-12 shadow-soft">
              <BlogEditForm blog={blog} />
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}

// メタデータ生成
export async function generateMetadata({ params }: BlogDetailPageProps) {
  try {
    const { id } = await params;
    const blog = await getBlog(id);

    return {
      title: `編集: ${blog.title} | アイデアマーケット ブログ`,
      description: `${blog.title}の編集ページです。`,
      robots: 'noindex, nofollow', // 編集ページは検索エンジンにインデックスさせない
    };
  } catch {
    return {
      title: '記事編集 | アイデアマーケット',
      robots: 'noindex, nofollow',
    };
  }
}
