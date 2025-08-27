import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Shield, 
  Zap, 
  Users, 
  Globe, 
  Target,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "コラボレーション機能",
      description: "LINE風のコメント機能で、アイデアをリアルタイムでブラッシュアップ",
      gradient: "bg-gradient-primary"
    },
    {
      icon: Shield,
      title: "安全な取引システム",
      description: "エスクローシステムで安心・安全な売買を実現",
      gradient: "bg-gradient-secondary"
    },
    {
      icon: Zap,
      title: "瞬時の検索・発見",
      description: "AI搭載の検索エンジンで、求めるアイデアを瞬時に発見",
      gradient: "bg-primary"
    },
    {
      icon: Users,
      title: "コミュニティ",
      description: "同じ志を持つクリエイターや企業とのネットワーキング",
      gradient: "bg-accent"
    },
    {
      icon: Globe,
      title: "グローバル展開",
      description: "日本から世界へ、あなたのアイデアを国際市場に",
      gradient: "bg-secondary"
    },
    {
      icon: Target,
      title: "的確なマッチング",
      description: "企業ニーズとアイデアを効率的にマッチング",
      gradient: "bg-gradient-primary"
    }
  ];

  const steps = [
    {
      step: "01",
      title: "アイデア投稿",
      description: "あなたの革新的なアイデアを投稿し、概要版を公開"
    },
    {
      step: "02", 
      title: "コミュニティ協力",
      description: "他のユーザーからのコメントでアイデアをブラッシュアップ"
    },
    {
      step: "03",
      title: "詳細版作成",
      description: "完成されたアイデアの詳細版を作成し、価格を設定"
    },
    {
      step: "04",
      title: "収益化実現",
      description: "企業や個人がアイデアを購入し、継続的な収入を獲得"
    }
  ];

  return (
    <section className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Features Grid */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              なぜIdeaMarketが
            </span>
            <br />
            <span className="text-foreground">選ばれるのか</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            革新的な機能と信頼できるシステムで、あなたのアイデアビジネスを成功に導きます
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card/50 backdrop-blur-sm animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform shadow-soft`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How it Works */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">簡単</span>
            <span className="bg-gradient-secondary bg-clip-text text-transparent">4ステップ</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            シンプルなプロセスで、あなたのアイデアを価値ある資産に変換
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative group animate-slide-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent transform -translate-y-1/2" />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-card/30 backdrop-blur-sm rounded-3xl p-12 border border-border/50 shadow-soft">
          <h3 className="text-3xl font-bold mb-4">
            <span className="text-foreground">今すぐ始めて、</span>
            <span className="bg-gradient-primary bg-clip-text text-transparent">未来を創造</span>
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            アイデア投稿から収益化まで、すべて無料で開始できます。<br />
            あなたの創造性を世界に解き放ちましょう。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="hero" 
              size="lg" 
              className="group px-8 py-6 text-lg font-semibold shadow-glow"
            >
              無料登録でスタート
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-6 text-lg font-semibold border-2"
            >
              デモを見る
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 mt-8 pt-8 border-t border-border/50">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">初期費用無料</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">手数料業界最安</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">24時間サポート</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;