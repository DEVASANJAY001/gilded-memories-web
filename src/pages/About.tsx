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
              About This Journey 💖
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
                  Every photo here holds a story I'll never forget. Each smile, each moment,
                  each memory captured — they all tell the tale of someone extraordinary who
                  has brought so much joy and light into this world.
                </span>
              </p>

              <p className="flex items-start gap-3">
                <Sparkles className="text-coral flex-shrink-0 mt-1 animate-sparkle" size={24} />
                <span>
                  This digital memory book is more than just a collection of photos.
                  It's a celebration of friendship, laughter, adventures, and all the
                  beautiful moments we've shared together. It's a reminder that the best
                  memories are the ones we create with the people we love.
                </span>
              </p>

              <p className="flex items-start gap-3">
                <Heart className="fill-primary text-primary flex-shrink-0 mt-1 animate-float" size={24} style={{ animationDelay: "0.5s" }} />
                <span>
                  From silly selfies to breathtaking sunsets, from quiet coffee dates to
                  wild adventures — every single image represents a piece of our story.
                  These aren't just pixels on a screen; they're treasures of the heart,
                  frozen moments of happiness that will live forever.
                </span>
              </p>
            </div>

            {/* Quote */}
            <div className="border-l-4 border-primary pl-6 py-4 bg-gradient-to-r from-primary/5 to-transparent rounded-r-xl">
              <p className="italic text-foreground/80 text-xl font-light">
                "In the end, we only regret the chances we didn't take, the relationships
                we were afraid to have, and the decisions we waited too long to make."
              </p>
            </div>

            {/* Closing */}
            <div className="text-center pt-8 space-y-4">
              <p className="text-xl text-primary font-handwriting font-semibold">
                To someone who makes every moment special ✨
              </p>
              <p className="text-muted-foreground text-sm">
                These memories are my way of saying: thank you for being you,
                for all the laughter, for all the love, and for being part of my story.
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
