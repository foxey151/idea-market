import { Metadata } from "next"
import { Suspense } from "react"
import { SearchForm } from "@/components/search/SearchForm"
import { SearchResults } from "@/components/search/SearchResults"

export const metadata: Metadata = {
  title: "検索 | アイデアマーケット",
  description: "アイデアを検索して、新しいインスピレーションを見つけましょう。",
}

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
          <SearchForm />
          <Suspense fallback={<div>検索中...</div>}>
            <SearchResults />
          </Suspense>
        </div>
      </div>
    </div>
  )
}