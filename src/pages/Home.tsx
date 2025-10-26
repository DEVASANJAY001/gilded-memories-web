import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FloatingHearts } from "@/components/FloatingHearts";
import { Heart, Sparkles } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-accent to-muted">
      <FloatingHearts />
      
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-glow opacity-40 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-glow opacity-30 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-10 animate-fade-in-up">
          {/* Main title */}
          <div className="space-y-6">
            <div className="relative inline-block">
              <h1 className="font-handwriting text-7xl md:text-9xl text-primary font-bold tracking-wide drop-shadow-2xl">
                harini 💖
              </h1>
              <div className="absolute -inset-8 bg-gradient-glow opacity-60 blur-3xl -z-10 animate-glow-pulse" />
            </div>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Sparkles className="text-rose animate-sparkle drop-shadow-lg" size={28} />
              <p className="text-2xl md:text-3xl text-foreground/70 font-light">
                A Collection of Cherished Moments
              </p>
              <Sparkles className="text-lavender animate-sparkle drop-shadow-lg" size={28} style={{ animationDelay: "0.5s" }} />
            </div>
          </div>

          {/* Welcome message */}
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in backdrop-blur-sm bg-card/30 rounded-3xl p-8 border border-primary/20" style={{ animationDelay: "0.3s" }}>
            <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed font-light">
              Kevalamaa irundhaa manichiru heeheeee
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-12 animate-scale-in" style={{ animationDelay: "0.6s" }}>
            <Link to="/gallery">
              <Button
                size="lg"
                className="text-xl px-12 py-8 rounded-full shadow-elegant hover:shadow-glow transition-all duration-700 group bg-gradient-primary border-0 hover:scale-110"
              >
                <span className="flex items-center gap-3">
                  Start Journey
                  <Heart className="group-hover:fill-current transition-all duration-500 drop-shadow-lg" size={24} />
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
