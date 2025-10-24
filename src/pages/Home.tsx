import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FloatingHearts } from "@/components/FloatingHearts";
import { Heart, Sparkles } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingHearts />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-8 animate-fade-in-up">
          {/* Main title */}
          <div className="space-y-4">
            <h1 className="font-handwriting text-6xl md:text-8xl text-primary font-bold tracking-wide">
              harini 💖
            </h1>
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="text-coral animate-sparkle" size={24} />
              <p className="text-xl md:text-2xl text-muted-foreground font-light">
                A Collection of Cherished Moments
              </p>
              <Sparkles className="text-coral animate-sparkle" size={24} style={{ animationDelay: "0.5s" }} />
            </div>
          </div>

          {/* Welcome message */}
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <p className="text-lg text-foreground/80 leading-relaxed">
              Kevalamaa irundhaa manichiru heeheeee
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-8 animate-scale-in" style={{ animationDelay: "0.6s" }}>
            <Link to="/gallery">
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-full shadow-glow hover:shadow-hover transition-all duration-500 group"
              >
                <span className="flex items-center gap-2">
                  Start Journey
                  <Heart className="group-hover:fill-current transition-all duration-300" size={20} />
                </span>
              </Button>
            </Link>
          </div>

          {/* Decorative elements */}
          <div className="flex items-center justify-center gap-4 pt-12 opacity-60">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <Heart className="fill-primary text-primary animate-float" size={16} />
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-4 left-0 right-0 z-20">
        <p className="text-center text-sm text-muted-foreground font-light">
          Made for someone special ✨
        </p>
      </footer>
    </div>
  );
};

export default Home;
