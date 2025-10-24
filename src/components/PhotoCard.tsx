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
        "relative group cursor-pointer overflow-hidden rounded-2xl shadow-soft hover:shadow-hover transition-all duration-500",
        "transform hover:scale-105 hover:-rotate-1",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-soft-pink/20 to-peach/20">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={cn(
            "w-full h-full object-cover transition-transform duration-700",
            isHovered && "scale-110"
          )}
        />
        
        {/* Glow overlay on hover */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-glow opacity-0 transition-opacity duration-500",
            isHovered && "opacity-100"
          )}
        />

        {/* Heart animation */}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart
              className="text-primary fill-primary animate-sparkle"
              size={60}
            />
          </div>
        )}

        {/* Sparkles on hover */}
        {isHovered && (
          <>
            <Sparkles
              className="absolute top-4 right-4 text-primary animate-sparkle"
              size={24}
            />
            <Sparkles
              className="absolute bottom-4 left-4 text-primary animate-sparkle"
              size={20}
              style={{ animationDelay: "0.3s" }}
            />
          </>
        )}
      </div>

      {caption && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent",
            "transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          )}
        >
          <p className="text-white text-sm font-light">{caption}</p>
        </div>
      )}
    </div>
  );
};
