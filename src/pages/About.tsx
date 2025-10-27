import { Heart, Sparkles, Star } from "lucide-react";
import { SiSpotify } from "react-icons/si";
import { FloatingHearts } from "@/components/FloatingHearts";

const About = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative overflow-hidden bg-gradient-to-br from-background via-accent to-muted">
      <FloatingHearts />
      
      {/* Ambient glow effects */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-glow opacity-30 blur-3xl animate-float" />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-gradient-glow opacity-20 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      
      <div className="container mx-auto max-w-3xl relative z-10">
        <div className="space-y-12 animate-fade-in-up">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <h1 className="font-handwriting text-6xl md:text-7xl text-primary font-bold drop-shadow-lg">
                About Onume illa 💖
              </h1>
              <div className="absolute -inset-6 bg-gradient-glow opacity-60 blur-3xl -z-10 animate-glow-pulse" />
            </div>
            <div className="flex items-center justify-center gap-3">
              <Star className="fill-rose text-rose animate-sparkle drop-shadow-lg" size={24} />
              <Star className="fill-lavender text-lavender animate-sparkle drop-shadow-lg" size={20} style={{ animationDelay: "0.3s" }} />
              <Star className="fill-mint text-mint animate-sparkle drop-shadow-lg" size={24} style={{ animationDelay: "0.6s" }} />
            </div>
          </div>

          {/* Main content */}
          <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-elegant border-2 border-primary/10 space-y-8">
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
            <div className="border-l-4 border-primary pl-8 py-6 bg-gradient-to-r from-primary/10 via-lavender/5 to-transparent rounded-r-2xl backdrop-blur-sm">
              <p className="italic text-foreground/90 text-xl md:text-2xl font-light leading-relaxed">
                "Every moment with you is a cherished memory 💖"
              </p>
            </div>

            {/* Closing */}
            <div className="text-center pt-8 space-y-6">
              <div className="relative inline-block">
                <p className="text-2xl md:text-3xl text-primary font-handwriting font-semibold drop-shadow-lg">
                  To someone who makes every moment special ✨
                </p>
                <div className="absolute -inset-2 bg-gradient-glow opacity-40 blur-2xl -z-10" />
              </div>
              <p className="text-muted-foreground text-base md:text-lg font-light">
                Forever grateful for these beautiful memories
              </p>
            </div>

            {/* Spotify Link */}
            <div className="flex justify-center pt-6">
              <a
                href="https://open.spotify.com/user/31utrzwwecfeebnviv2aghdhxtry?si=40d88211df704700"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#1DB954] hover:bg-[#1ed760] text-white px-6 py-3 rounded-full shadow-glow transition-all duration-300 hover:scale-105"
              >
                <SiSpotify size={24} />
                <span className="font-semibold">Listen on Spotify - Devaa</span>
              </a>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="flex items-center justify-center gap-6 pt-8">
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <Heart className="fill-primary text-primary animate-glow-pulse drop-shadow-lg" size={24} />
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
