import { PhotoCard } from "@/components/PhotoCard";
import { Heart } from "lucide-react";

const memoriesData = [
  {
    capiont: "inga enna podrathunu theriyala",
  },
];

const Memories = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <h1 className="font-handwriting text-5xl md:text-6xl text-primary font-bold">
            Harini�
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
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
            "The best things in life are the people we love, the places we've been,
            and the memories we've made along the way."
          </p>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default Memories;
