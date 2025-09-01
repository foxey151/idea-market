import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, DollarSign, TrendingUp, Users, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "アイデア販売 | アイデアマーケット",
  description: "あなたのアイデアを収益に変えませんか？アイデア販売の方法をご紹介します。",
}

export default function SellPage() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto py-8">
        {/* ヒーローセクション */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              アイデアを
            </span>
            <br />
            <span className="text-foreground">収益に変えよう</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            あなたの革新的なアイデアをマネタイズし、新しい収入源を創出しましょう。
          </p>
          <Button size="lg" asChild>
            <Link href="/ideas/new">
              今すぐアイデアを投稿する
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* 収益化の仕組み */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">収益化の仕組み</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-xl">1</span>
                </div>
                <CardTitle>アイデア投稿</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  まずは当初アイデアを投稿し、コミュニティからフィードバックを集めましょう。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-xl">2</span>
                </div>
                <CardTitle>X版・Y版作成</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  X版（無料公開）でアピールし、Y版（有償版）で詳細なノウハウを提供します。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-xl">3</span>
                </div>
                <CardTitle>収益獲得</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Y版の購入により直接収益を獲得。透明性のある売上管理で安心です。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 売れるアイデアの特徴 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">売れるアイデアの特徴</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-primary" />
                  具体性と実用性
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 明確な問題解決策を提示</li>
                  <li>• 実装可能な具体的手順</li>
                  <li>• 検証済みの成功事例</li>
                  <li>• 市場ニーズとの適合性</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  差別化と独自性
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 他にない独創的なアプローチ</li>
                  <li>• 専門知識に基づく深い洞察</li>
                  <li>• 競合優位性の明確化</li>
                  <li>• 知的財産としての価値</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 価格設定のポイント */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">価格設定のポイント</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <Badge variant="outline" className="mb-3">
                    スタートアップ
                  </Badge>
                  <div className="text-2xl font-bold text-primary mb-2">¥1,000-5,000</div>
                  <p className="text-sm text-muted-foreground">
                    初期アイデア・コンセプト段階
                  </p>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="mb-3">
                    ビジネスモデル
                  </Badge>
                  <div className="text-2xl font-bold text-primary mb-2">¥5,000-20,000</div>
                  <p className="text-sm text-muted-foreground">
                    詳細な事業計画・戦略
                  </p>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="mb-3">
                    技術ソリューション
                  </Badge>
                  <div className="text-2xl font-bold text-primary mb-2">¥10,000-50,000</div>
                  <p className="text-sm text-muted-foreground">
                    実装可能な技術仕様
                  </p>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="mb-3">
                    完成システム
                  </Badge>
                  <div className="text-2xl font-bold text-primary mb-2">¥50,000+</div>
                  <p className="text-sm text-muted-foreground">
                    即実装可能な完成品
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 成功のコツ */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">販売成功のコツ</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  コミュニティエンゲージメント
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  積極的にコメントに返信し、フィードバックを受け入れてアイデアを改善しましょう。
                </p>
                <ul className="space-y-1 text-sm">
                  <li>• 質問には迅速に回答</li>
                  <li>• 建設的な議論を促進</li>
                  <li>• 改善点を積極的に取り入れ</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-primary" />
                  価値の明確化
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  X版で価値を示し、Y版でより深い価値を提供する構成にしましょう。
                </p>
                <ul className="space-y-1 text-sm">
                  <li>• X版：概要とメリットを明示</li>
                  <li>• Y版：実装手順と詳細資料</li>
                  <li>• 購入後のサポート体制</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <h3 className="text-2xl font-bold mb-4">
              今すぐアイデアの収益化を始めましょう
            </h3>
            <p className="text-muted-foreground mb-6">
              あなたの知識と経験を価値ある収入源に変換できます。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/ideas/new">
                  アイデアを投稿する
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/ideas">
                  成功事例を見る
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
