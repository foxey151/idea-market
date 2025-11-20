'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, TrendingUp, Search } from 'lucide-react';
import Image from 'next/image';
import heroBackground from '@/assets/hero-background.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={heroBackground}
          alt="Hero background"
          fill
          className="object-cover opacity-20"
          priority
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
              あなたのアイデアを世界に届け、収益化しませんか？
              <br />
              技術案・事業案・デザイン・レシピまで、すべてのアイデアが価値を
              <br />
              持ちます
            </p>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 animate-fade-in animation-delay-400">
            <div className="group p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                アイデア売買
              </h3>
              <p className="text-muted-foreground text-sm">
                アイデアを投稿し、企業や個人へ販売できます
              </p>
            </div>

            <div className="group p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-secondary transition-colors">
                アイデア換金
              </h3>
              <p className="text-muted-foreground text-sm">
                優れたアイデアを適正価格で収益化し、継続的な収入が得られます
              </p>
            </div>

            <div className="group p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-tertiary rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Search className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-accent transition-colors">
                アイデア検索
              </h3>
              <p className="text-muted-foreground text-sm">
                膨大なアイデアの中からあなたのニーズにぴったりのものを発見します
              </p>
            </div>
          </div>

          <div className="text-left animate-fade-in animation-delay-200">
            <p className="text-lg md:text-lg text-muted-foreground mb-12 leading-relaxed pl-12">
              アイデアとは何も特許的なものだけではありません。ちょっとした思いつきが他の人からしたら珠玉のものかもしれません。
              <br />
              検索者の方へ：ここは知の宝が埋もれているかもしれません
            </p>
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

        </div>
      </div>
    </section>
  );
};

export default Hero;
