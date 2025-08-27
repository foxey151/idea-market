"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, LogIn } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 検索ページに遷移（実装する際はNext.jsのrouterを使用）
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Image 
                src="/logo.avif" 
                alt="アイデアマーケット Logo" 
                width={32} 
                height={32} 
                className="transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              アイデアマーケット
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/ideas" className="text-foreground/80 hover:text-primary transition-colors">
              アイデア一覧
            </Link>
            <Link href="/search" className="text-foreground/80 hover:text-primary transition-colors">
              検索
            </Link>
            <Link href="/sell" className="text-foreground/80 hover:text-primary transition-colors">
              アイデア販売
            </Link>
            <Link href="/about" className="text-foreground/80 hover:text-primary transition-colors">
              サービス案内
            </Link>
          </nav>

          {/* Search Bar and Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="アイデアを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-background/50"
              />
            </form>
            <Button variant="outline" size="sm">
              <LogIn className="h-4 w-4 mr-2" />
              ログイン
            </Button>
            <Button variant="hero" size="sm">
              アイデア投稿
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Search Bar - Always visible on mobile */}
        <div className="md:hidden mt-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="アイデアを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </form>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 p-4 bg-card rounded-lg border shadow-soft animate-fade-in">
            <nav className="flex flex-col space-y-4">
                              <Link
                  href="/ideas"
                  className="text-foreground/80 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  アイデア一覧
                </Link>
                <Link
                  href="/search"
                  className="text-foreground/80 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  検索
                </Link>
                <Link
                  href="/sell"
                  className="text-foreground/80 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  アイデア販売
                </Link>
                <Link
                  href="/about"
                  className="text-foreground/80 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  サービス案内
                </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  ログイン
                </Button>
                <Button variant="hero" size="sm">
                  アイデア投稿
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;