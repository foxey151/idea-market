import { Metadata } from "next"
import Header from "@/components/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "利用規約 | アイデアマーケット",
  description: "アイデアマーケットの利用規約をご確認ください。",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                利用規約
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              アイデアマーケットの利用規約をご確認ください
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>アイデアマーケット利用規約</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">第1条（総則）</h2>
                <p className="text-muted-foreground leading-relaxed">
                  あああ、、、この規約はアイデアマーケット（以下「本サービス」といいます）の利用に関する条件を定めるものです。あああ、、、利用者は本規約に同意した上で本サービスを利用するものとします。
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">第2条（定義）</h2>
                <p className="text-muted-foreground leading-relaxed">
                  あああ、、、本規約において使用する用語の定義は以下のとおりです。あああ、、、
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-1 text-muted-foreground">
                  <li>「本サービス」とは、あああ、、、</li>
                  <li>「利用者」とは、あああ、、、</li>
                  <li>「アイデア」とは、あああ、、、</li>
                  <li>「コンテンツ」とは、あああ、、、</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">第3条（利用資格）</h2>
                <p className="text-muted-foreground leading-relaxed">
                  あああ、、、本サービスを利用できるのは、以下の条件を満たす方に限ります。あああ、、、
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-1 text-muted-foreground">
                  <li>あああ、、、満18歳以上の方</li>
                  <li>あああ、、、本規約に同意いただける方</li>
                  <li>あああ、、、法的能力を有する方</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">第4条（アカウント登録）</h2>
                <p className="text-muted-foreground leading-relaxed">
                  あああ、、、本サービスの利用にあたり、利用者は正確かつ最新の情報を提供してアカウントを登録するものとします。あああ、、、
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">第5条（アイデアの投稿）</h2>
                <p className="text-muted-foreground leading-relaxed">
                  あああ、、、利用者は本サービスにアイデアを投稿することができます。あああ、、、投稿されたアイデアは適切な審査を経て公開されます。
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">第6条（知的財産権）</h2>
                <p className="text-muted-foreground leading-relaxed">
                  あああ、、、投稿されたアイデアの知的財産権は投稿者に帰属します。あああ、、、ただし、本サービスの運営に必要な範囲での使用を許諾するものとします。
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">第7条（禁止事項）</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  あああ、、、利用者は以下の行為を行ってはなりません。
                </p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>あああ、、、法令に違反する行為</li>
                  <li>あああ、、、他者の権利を侵害する行為</li>
                  <li>あああ、、、虚偽の情報を投稿する行為</li>
                  <li>あああ、、、本サービスの運営を妨害する行為</li>
                  <li>あああ、、、その他当社が不適切と判断する行為</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">第8条（免責事項）</h2>
                <p className="text-muted-foreground leading-relaxed">
                  あああ、、、当社は本サービスの利用により生じた損害について、一切の責任を負いません。あああ、、、
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">第9条（規約の変更）</h2>
                <p className="text-muted-foreground leading-relaxed">
                  あああ、、、当社は必要に応じて本規約を変更することがあります。あああ、、、変更後の規約は本サービス上に掲載された時点で効力を生じるものとします。
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">第10条（準拠法・管轄）</h2>
                <p className="text-muted-foreground leading-relaxed">
                  あああ、、、本規約は日本法に準拠し、本サービスに関する紛争については東京地方裁判所を専属的合意管轄裁判所とします。あああ、、、
                </p>
              </section>

              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  制定日：2025年1月28日<br />
                  最終更新：2025年1月28日
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
