"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Hash } from "lucide-react"

const POPULAR_TAGS = [
  "AI", "機械学習", "Web開発", "モバイルアプリ", "UI/UX", "マーケティング",
  "スタートアップ", "DX", "IoT", "ブロックチェーン", "サステナブル", "ヘルスケア"
]

export function SearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [searchType, setSearchType] = useState('keyword')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    const params = new URLSearchParams()
    params.set('q', searchQuery.trim())
    params.set('type', searchType)
    
    router.push(`/search?${params.toString()}`)
  }

  const handleTagSearch = (tag: string) => {
    setSearchQuery(tag)
    setSearchType('keyword')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-6 w-6" />
          アイデア検索
        </CardTitle>
        <CardDescription>
          キーワードやCMT番号でアイデアを検索できます
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder={
                  searchType === 'cmt' 
                    ? "CMT-250115-0001" 
                    : "例: AI 教育プラットフォーム"
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-base"
              />
            </div>
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keyword">キーワード</SelectItem>
                <SelectItem value="cmt">CMT番号</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={!searchQuery.trim()}>
              <Search className="h-4 w-4 mr-2" />
              検索
            </Button>
          </div>
        </form>

        {searchType === 'keyword' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">人気のタグ</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleTagSearch(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {searchType === 'cmt' && (
          <div className="text-sm text-muted-foreground">
            <p>CMT番号の形式: CMT-YYMMDD-XXXX</p>
            <p>例: CMT-250115-0001（2025年1月15日の1番目）</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
