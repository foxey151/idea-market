import { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, Filter, Sparkles, Hash } from "lucide-react";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cmtNumber, setCmtNumber] = useState("");

  const recentSearches = [
    "AI 農業",
    "カフェ事業",
    "リモートワーク",
    "UI/UXデザイン",
    "発酵レシピ"
  ];

  const popularTags = [
    "AI", "ビジネス", "デザイン", "技術", "料理", 
    "環境", "効率化", "イノベーション", "健康", "教育"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                アイデア検索
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              膨大なアイデアの中から、あなたが求める革新的なソリューションを発見
            </p>
          </div>

          {/* Search Tabs */}
          <Tabs defaultValue="keyword" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="keyword" className="flex items-center gap-2">
                <SearchIcon className="h-4 w-4" />
                キーワード検索
              </TabsTrigger>
              <TabsTrigger value="cmt" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                CMT番号検索
              </TabsTrigger>
            </TabsList>

            <TabsContent value="keyword" className="space-y-8">
              {/* Keyword Search */}
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="例: AI、新規事業、デザイン、レシピ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 text-lg"
                />
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  検索
                </Button>
              </div>

              {/* Search Filters */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  カテゴリ
                </Button>
                <Button variant="outline" size="sm">価格帯</Button>
                <Button variant="outline" size="sm">評価</Button>
                <Button variant="outline" size="sm">投稿日</Button>
              </div>

              {/* Recent Searches */}
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    最近の検索
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="secondary"
                        size="sm"
                        className="hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setSearchTerm(search)}
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cmt" className="space-y-8">
              {/* CMT Number Search */}
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="CMT番号を入力 (例: CMT-20241201-0001)"
                  value={cmtNumber}
                  onChange={(e) => setCmtNumber(e.target.value)}
                  className="pl-12 h-14 text-lg"
                />
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  検索
                </Button>
              </div>

              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">CMT番号について</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="space-y-2">
                    <p>CMT番号は各アイデアスレッドに割り当てられる一意の識別番号です。</p>
                    <p className="font-mono text-sm bg-muted p-2 rounded">
                      形式: CMT-YYYYMMDD-####<br />
                      例: CMT-20241201-0001
                    </p>
                    <p>CMT番号で検索すると、該当するアイデアとそのコメント一覧が表示されます。</p>
                  </CardDescription>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Popular Tags */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              <span className="text-foreground">人気の</span>
              <span className="bg-gradient-secondary bg-clip-text text-transparent">タグ</span>
            </h2>
            
            <div className="flex flex-wrap gap-3 justify-center">
              {popularTags.map((tag, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="hover:bg-gradient-primary hover:text-white hover:border-transparent transition-all duration-300"
                  onClick={() => setSearchTerm(tag)}
                >
                  #{tag}
                </Button>
              ))}
            </div>
          </div>

          {/* Search Tips */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">検索のコツ</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <SearchIcon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">キーワード組み合わせ</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    複数のキーワードを組み合わせることで、より精密な検索が可能です
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Filter className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">フィルター活用</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    価格帯や評価でフィルタリングして、条件に合うアイデアを絞り込み
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Hash className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">CMT番号</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    特定のアイデアスレッドを直接参照したい場合はCMT番号を使用
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Search;