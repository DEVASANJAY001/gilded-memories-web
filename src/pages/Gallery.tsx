import { useState, useEffect } from "react";
import { PhotoCard } from "@/components/PhotoCard";
import { Lightbox } from "@/components/Lightbox";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import { toast } from "sonner";

// Placeholder images - Replace with your actual photos
const generatePlaceholderImages = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    src: `https://images.unsplash.com/photo-${1500000000000 + i * 100000}?w=800&auto=format&fit=crop`,
    alt: `Memory ${i + 1}`,
    caption: `Beautiful moment #${i + 1}`,
  }));
};

const Gallery = () => {
  const [images, setImages] = useState(generatePlaceholderImages(40));
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const shuffleImages = () => {
    const shuffled = [...images].sort(() => Math.random() - 0.5);
    setImages(shuffled);
    toast("Memories shuffled! ✨");
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextImage = () => {
    if (lightboxIndex !== null && lightboxIndex < images.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const previousImage = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-6 animate-fade-in">
          <h1 className="font-handwriting text-5xl md:text-6xl text-primary font-bold">
            Memory Gallery ✨
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            160+ beautiful moments captured in time. Click on any photo to view it in full glory.
          </p>
          
          <Button
            onClick={shuffleImages}
            variant="outline"
            className="rounded-full shadow-soft hover:shadow-hover transition-all duration-300"
          >
            <Shuffle size={18} className="mr-2" />
            Shuffle Memories
          </Button>
        </div>

        {/* Masonry Gallery */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {images.map((image, index) => (
            <div key={index} className="break-inside-avoid animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
              <PhotoCard
                src={image.src}
                alt={image.alt}
                onClick={() => openLightbox(index)}
              />
            </div>
          ))}
        </div>

        {/* Load more hint */}
        <div className="text-center mt-12 animate-fade-in">
          <p className="text-muted-foreground text-sm">
            📸 Add your photos to <code className="bg-accent px-2 py-1 rounded">src/assets/photos/</code> folder
          </p>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrevious={previousImage}
        />
      )}
    </div>
  );
};

export default Gallery;
