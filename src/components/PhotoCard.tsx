import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoCardProps {
  src: string;
  alt: string;
  caption?: string;
  onClick?: () => void;
  className?: string;
}

export const PhotoCard = ({ src, alt, caption, onClick, className }: PhotoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1500);
  };

  return (
    <div
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-3xl shadow-soft hover:shadow-elegant transition-all duration-700",
        "transform hover:scale-[1.03] hover:rotate-1 will-change-transform",
        "before:absolute before:inset-0 before:rounded-3xl before:p-[2px] before:bg-gradient-primary before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-soft-pink/30 via-lavender/20 to-sky/20">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={cn(
            "w-full h-full object-cover transition-all duration-1000",
            isHovered && "scale-110 brightness-110"
          )}
        />
        
        {/* Multi-layer glow effects */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-glow opacity-0 transition-opacity duration-700",
            isHovered && "opacity-100"
          )}
        />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 transition-opacity duration-500",
            isHovered && "opacity-100"
          )}
        />

        {/* Shimmer effect on hover */}
        {isHovered && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-shimmer animate-shimmer" />
          </div>
        )}

        {/* Heart animation */}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart
              className="text-primary fill-primary drop-shadow-lg animate-float"
              size={60}
              style={{ filter: "drop-shadow(0 0 20px hsl(340 82% 65%))" }}
            />
          </div>
        )}

        {/* Sparkles on hover - more dynamic */}
        {isHovered && (
          <>
            <Sparkles
              className="absolute top-6 right-6 text-rose animate-sparkle drop-shadow-lg"
              size={28}
            />
            <Sparkles
              className="absolute bottom-6 left-6 text-lavender animate-sparkle drop-shadow-lg"
              size={24}
              style={{ animationDelay: "0.2s" }}
            />
            <Sparkles
              className="absolute top-1/2 left-6 text-mint animate-sparkle drop-shadow-lg"
              size={20}
              style={{ animationDelay: "0.4s" }}
            />
          </>
        )}
      </div>

      {caption && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-primary/90 via-primary/60 to-transparent backdrop-blur-sm",
            "transform translate-y-full group-hover:translate-y-0 transition-all duration-500"
          )}
        >
          <p className="text-white text-sm md:text-base font-light drop-shadow-lg">{caption}</p>
        </div>
      )}
    </div>
  );
};
