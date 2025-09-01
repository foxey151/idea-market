"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, Eye, Heart, MessageSquare, Star } from "lucide-react";

export default function IdeasPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for ideas
  const ideas = [
    {
      id: 1,
      title: "AI搭載スマート農業システム",
      summary: "IoTセンサーとAIを活用した次世代農業管理システムの提案",
      author: "田中太郎",
      category: "技術案",
      price: "¥50,000",
      views: 1234,
      likes: 89,
      comments: 23,
      rating: 4.8,

    },
    {
      id: 2,
      title: "ゼロウェイスト型カフェ事業計画",
      summary: "廃棄物ゼロを目指す革新的なカフェビジネスモデル",
      author: "佐藤花子",
      category: "事業案",
      price: "¥75,000",
      views: 892,
      likes: 67,
      comments: 18,
      rating: 4.6
    },
    {
      id: 3,
      title: "モバイルアプリUI/UXデザイン集",
      summary: "ユーザビリティを重視したモバイルアプリのデザインパターン集",
      author: "山田デザイン",
      category: "デザイン",
      price: "¥30,000",
      views: 2156,
      likes: 143,
      comments: 41,
      rating: 4.9
    },
    {
      id: 4,
      title: "発酵食品レシピコレクション",
      summary: "健康と美味しさを両立した発酵食品の革新的レシピ集",
      author: "料理研究家みき",
      category: "レシピ",
      price: "¥15,000",
      views: 756,
      likes: 98,
      comments: 34,
      rating: 4.7
    },
    {
      id: 5,
      title: "リモートワーク効率化ツール",
      summary: "在宅勤務の生産性を最大化するオールインワンツールの設計",
      author: "エンジニア鈴木",
      category: "技術案",
      price: "¥85,000",
      views: 1445,
      likes: 112,
      comments: 29,
      rating: 4.8
    },
    {
      id: 6,
      title: "地域活性化イベント企画",
      summary: "伝統文化とテクノロジーを融合した地域振興イベントプラン",
      author: "企画のプロ田村",
      category: "事業案",
      price: "¥40,000",
      views: 623,
      likes: 45,
      comments: 12,
      rating: 4.5
    }
  ];

  const filteredIdeas = ideas.filter(idea =>
    idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors = {
      "技術案": "bg-blue-100 text-blue-800",
      "事業案": "bg-green-100 text-green-800", 
      "デザイン": "bg-purple-100 text-purple-800",
      "レシピ": "bg-orange-100 text-orange-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                アイデア一覧
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              革新的なアイデアを発見し、あなたのビジネスに活用してください
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="アイデアを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              フィルター
            </Button>
          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {filteredIdeas.length}件のアイデアが見つかりました
            </p>
          </div>

          {/* Ideas Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map((idea, index) => (
              <Card 
                key={idea.id} 
                className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getCategoryColor(idea.category)}>
                      {idea.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{idea.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {idea.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {idea.summary}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>by {idea.author}</span>
                    <span className="font-bold text-primary text-lg">{idea.price}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{idea.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{idea.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{idea.comments}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      詳細を見る
                    </Button>
                    <Button variant="hero" size="sm" className="flex-1">
                      購入する
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              さらに読み込む
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
