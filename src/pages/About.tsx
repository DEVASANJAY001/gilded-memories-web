import { Heart, Sparkles, Star } from "lucide-react";
import { FloatingHearts } from "@/components/FloatingHearts";

const About = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative overflow-hidden">
      <FloatingHearts />
      
      <div className="container mx-auto max-w-3xl relative z-10">
        <div className="space-y-12 animate-fade-in-up">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="font-handwriting text-5xl md:text-6xl text-primary font-bold">
              About Onume illa 💖
            </h1>
            <div className="flex items-center justify-center gap-2">
              <Star className="fill-coral text-coral animate-sparkle" size={20} />
              <Star className="fill-coral text-coral animate-sparkle" size={16} style={{ animationDelay: "0.3s" }} />
              <Star className="fill-coral text-coral animate-sparkle" size={20} style={{ animationDelay: "0.6s" }} />
            </div>
          </div>

          {/* Main content */}
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-soft space-y-8">
            <div className="space-y-6 text-lg leading-relaxed text-foreground/90">
              <p className="flex items-start gap-3">
                <Heart className="fill-primary text-primary flex-shrink-0 mt-1 animate-float" size={24} />
                <span>
                  
                </span>
              </p>

              <p className="flex items-start gap-3">
                <Sparkles className="text-coral flex-shrink-0 mt-1 animate-sparkle" size={24} />
                <span>

                </span>
              </p>

              <p className="flex items-start gap-3">
                <Heart className="fill-primary text-primary flex-shrink-0 mt-1 animate-float" size={24} style={{ animationDelay: "0.5s" }} />
                <span>

                </span>
              </p>
            </div>

            {/* Quote */}
            <div className="border-l-4 border-primary pl-6 py-4 bg-gradient-to-r from-primary/5 to-transparent rounded-r-xl">
              <p className="italic text-foreground/80 text-xl font-light">

              </p>
            </div>

            {/* Closing */}
            <div className="text-center pt-8 space-y-4">
              <p className="text-xl text-primary font-handwriting font-semibold">
                To someone who makes every moment special ✨
              </p>
              <p className="text-muted-foreground text-sm">
              </p>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="flex items-center justify-center gap-4 pt-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <Heart className="fill-primary text-primary animate-glow-pulse" size={20} />
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
