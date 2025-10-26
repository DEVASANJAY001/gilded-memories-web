import { PhotoCard } from "@/components/PhotoCard";
import { Heart } from "lucide-react";

const memoriesData = [
  {
    src: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
    alt: "Beautiful Memory",
    caption: "inga enna podrathunu theriyala",
  },
];

const Memories = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-background via-accent to-muted">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-6 animate-fade-in">
          <div className="relative inline-block">
            <h1 className="font-handwriting text-6xl md:text-7xl text-primary font-bold drop-shadow-lg">
              Harini 💖
            </h1>
            <div className="absolute -inset-4 bg-gradient-glow opacity-60 blur-3xl -z-10 animate-glow-pulse" />
          </div>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-light">
            onume illa suma
          </p>
        </div>

        {/* Memories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {memoriesData.map((memory, index) => (
            <div
              key={index}
              className="space-y-4 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PhotoCard
                src={memory.src}
                alt={memory.alt}
                className="aspect-[4/3]"
              />
              <div className="space-y-2 px-2">
                <div className="flex items-center gap-2">
                  <Heart className="fill-primary text-primary" size={16} />
                  <p className="text-foreground/90 italic leading-relaxed">
                    "{memory.caption}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom message */}
        <div className="text-center mt-16 animate-fade-in space-y-4">
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
          <p className="text-muted-foreground font-light italic">
            "💖"
          </p>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default Memories;
