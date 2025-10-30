import { Metadata } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Lightbulb, TrendingUp, Shield } from 'lucide-react';
import IdeaPurchaseFlow from '@/components/idea-purchase-flow';

export const metadata: Metadata = {
  title: 'サービス案内 | アイデアマーケット',
  description:
    'アイデアマーケットは、革新的なアイデアを売買できるプラットフォームです。',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto py-8">
        {/* ヒーローセクション */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              アイデアマーケット
            </span>
            <br />
            <span className="text-foreground">について</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            革新的なアイデアを価値に変える、新しいマーケットプラットフォーム
          </p>
        </div>

        {/* サービス概要 */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-primary" />
                アイデアの投稿
              </CardTitle>
              <CardDescription>
                あなたの革新的なアイデアを投稿し、コミュニティと共有しましょう。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• 技術、ビジネス、デザインなど幅広い分野に対応</li>
                <li>• コメント機能でアイデアをブラッシュアップ</li>
                <li>• X版（公開）とY版（有償）の2段階展開</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                収益化
              </CardTitle>
              <CardDescription>
                アイデアを実際の収益に変換できます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• 有償版（Y版）として詳細なアイデアを販売</li>
                <li>• 一定利益を公益に回すため、比率を公表しています</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 特徴 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            プラットフォームの特徴
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle>コミュニティ主導</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  ユーザー同士がアイデアを共有し、建設的なフィードバックを通じて共に成長する環境
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle>安全・安心</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  知的財産を保護し、安全な取引環境を提供するセキュリティ対策
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle>イノベーション</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  革新的なアイデアを発見し、新しいビジネスチャンスを創出するプラットフォーム
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 利用方法 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">利用方法</h2>
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Badge
                variant="outline"
                className="text-lg px-4 py-2 flex-shrink-0"
              >
                STEP 1
              </Badge>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">会員登録</h3>
                <p className="text-muted-foreground">
                  Google、Facebook、またはメールアドレスで簡単に会員登録ができます。
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <Badge
                variant="outline"
                className="text-lg px-4 py-2 flex-shrink-0"
              >
                STEP 2
              </Badge>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">アイデア投稿</h3>
                <p className="text-muted-foreground">
                  当初アイデアを投稿し、コミュニティからのフィードバックを受けましょう。
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <Badge
                variant="outline"
                className="text-lg px-4 py-2 flex-shrink-0"
              >
                STEP 3
              </Badge>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">最終版作成</h3>
                <p className="text-muted-foreground">
                  フィードバックを元にアイデアを練り上げ、X版（公開）とY版（有償）を作成します。
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <Badge
                variant="outline"
                className="text-lg px-4 py-2 flex-shrink-0"
              >
                STEP 4
              </Badge>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">収益化</h3>
                <p className="text-muted-foreground">
                  Y版の販売により、アイデアを実際の収益に変換できます。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* アイデア投稿還元と購入のフロー */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-6">
            アイデア投稿還元と購入のフロー
          </h2>
          <img className="mx-auto w-2/3" src="idea-purchase-flow.png" alt="アイデア投稿還元と購入のフロー" />
        </div>

        {/* 会社情報 */}
        <Card>
          <CardHeader>
            <CardTitle>運営会社</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">会社概要</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>会社名: 株式会社アイデアマーケット</p>
                  <p>設立: 2025年</p>
                  <p>事業内容: アイデア流通プラットフォームの運営</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">お問い合わせ</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Email: info@idea-market.net</p>
                  <p>営業時間: 平日 9:00-18:00</p>
                  <p>サポート: info@idea-market.net</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
