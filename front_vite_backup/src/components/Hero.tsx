import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Search } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroBackground} 
          alt="Hero background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-30" />
      </div>
      
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-subtle" />
      
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-glow-pulse" />
      <div className="absolute bottom-32 right-16 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-glow-pulse animation-delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                アイデア
              </span>
              <span className="text-foreground">を</span>
              <br />
              <span className="bg-gradient-secondary bg-clip-text text-transparent">
                価値に変える
              </span>
            </h1>
          </div>

          <div className="animate-fade-in animation-delay-200">
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              あなたのアイデアを世界に届け、収益化しませんか？<br />
              技術案・事業案・デザイン・レシピまで、すべてのアイデアが価値を持ちます
            </p>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 animate-fade-in animation-delay-400">
            <div className="group p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-primary">アイデア売買</h3>
              <p className="text-muted-foreground text-sm">
                革新的なアイデアを投稿し、企業や個人へ販売できます
              </p>
            </div>

            <div className="group p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-secondary">アイデア換金</h3>
              <p className="text-muted-foreground text-sm">
                優れたアイデアを適正価格で収益化し、継続的な収入を得られます
              </p>
            </div>

            <div className="group p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Search className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-accent">アイデア検索</h3>
              <p className="text-muted-foreground text-sm">
                膨大なアイデアの中から、あなたのニーズにぴったりのものを発見
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in animation-delay-600">
            <Button 
              variant="hero" 
              size="lg" 
              className="group px-8 py-6 text-lg font-semibold shadow-glow hover:shadow-elegant transition-all duration-300"
            >
              無料でアイデア投稿
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-6 text-lg font-semibold border-2 hover:bg-primary/5"
            >
              アイデアを探す
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-border/50 animate-fade-in animation-delay-800">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-sm text-muted-foreground">登録アイデア</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">5,000+</div>
              <div className="text-sm text-muted-foreground">活動ユーザー</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">¥50M+</div>
              <div className="text-sm text-muted-foreground">総取引額</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">98%</div>
              <div className="text-sm text-muted-foreground">満足度</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;