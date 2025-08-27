import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, Lightbulb, User, LogIn } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Lightbulb className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              IdeaMarket
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/ideas" className="text-foreground/80 hover:text-primary transition-colors">
              アイデア一覧
            </Link>
            <Link to="/search" className="text-foreground/80 hover:text-primary transition-colors">
              検索
            </Link>
            <Link to="/sell" className="text-foreground/80 hover:text-primary transition-colors">
              アイデア販売
            </Link>
            <Link to="/about" className="text-foreground/80 hover:text-primary transition-colors">
              サービス案内
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4 mr-2" />
              検索
            </Button>
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 p-4 bg-card rounded-lg border shadow-soft animate-fade-in">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/ideas" 
                className="text-foreground/80 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                アイデア一覧
              </Link>
              <Link 
                to="/search" 
                className="text-foreground/80 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                検索
              </Link>
              <Link 
                to="/sell" 
                className="text-foreground/80 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                アイデア販売
              </Link>
              <Link 
                to="/about" 
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