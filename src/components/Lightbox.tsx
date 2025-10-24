import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect } from "react";

interface LightboxProps {
  images: Array<{ src: string; alt: string; caption?: string }>;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const Lightbox = ({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
}: LightboxProps) => {
  const currentImage = images[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrevious();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrevious]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm animate-fade-in">
      {/* Close button */}
      <Button
        onClick={onClose}
        size="icon"
        variant="ghost"
        className="absolute top-4 right-4 z-50 text-white hover:bg-white/10"
      >
        <X size={24} />
      </Button>

      {/* Navigation */}
      {currentIndex > 0 && (
        <Button
          onClick={onPrevious}
          size="icon"
          variant="ghost"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/10"
        >
          <ChevronLeft size={32} />
        </Button>
      )}

      {currentIndex < images.length - 1 && (
        <Button
          onClick={onNext}
          size="icon"
          variant="ghost"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/10"
        >
          <ChevronRight size={32} />
        </Button>
      )}

      {/* Image container */}
      <div className="flex items-center justify-center h-full p-8">
        <div className="relative max-w-6xl max-h-full animate-scale-in">
          <img
            src={currentImage.src}
            alt={currentImage.alt}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-glow"
          />
          
          {currentImage.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
              <p className="text-white text-center">{currentImage.caption}</p>
            </div>
          )}

          {/* Counter */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent rounded-t-lg">
            <p className="text-white/80 text-center text-sm">
              {currentIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
