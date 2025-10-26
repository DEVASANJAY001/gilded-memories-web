import { useState, useEffect } from "react";
import { PhotoCard } from "@/components/PhotoCard";
import { Lightbox } from "@/components/Lightbox";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Photo {
  src: string;
  alt: string;
  caption?: string;
}

const Gallery = () => {
  const [images, setImages] = useState<Photo[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load photos from database
  useEffect(() => {
    loadPhotos();
    
    // Set up realtime subscription for new photos
    const channel = supabase
      .channel('photos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'photos'
        },
        () => {
          loadPhotos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPhotos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading photos:', error);
        toast.error("Failed to load photos");
        return;
      }

      const photos: Photo[] = (data || []).map((photo, index) => ({
        src: photo.file_path,
        alt: photo.file_name || `Photo ${index + 1}`,
        caption: photo.caption || undefined,
      }));

      setImages(photos);
    } catch (error) {
      console.error('Error loading photos:', error);
      toast.error("Failed to load photos");
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-background via-accent to-muted">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-6 animate-fade-in">
          <div className="relative inline-block">
            <h1 className="font-handwriting text-6xl md:text-7xl text-primary font-bold drop-shadow-lg">
              snap gallery ✨
            </h1>
            <div className="absolute -inset-4 bg-gradient-glow opacity-60 blur-3xl -z-10 animate-glow-pulse" />
          </div>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-light">
            Beautiful moments captured in time. Click on any photo to view it in full glory.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={shuffleImages}
              variant="outline"
              disabled={images.length === 0}
              className="rounded-full shadow-soft hover:shadow-elegant transition-all duration-500 border-2 hover:scale-105"
            >
              <Shuffle size={18} className="mr-2" />
              Shuffle Memories
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">Loading photos...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && images.length === 0 && (
          <div className="text-center py-20 space-y-6">
            <p className="text-muted-foreground text-xl">No photos yet. Start by uploading some beautiful memories! 📸</p>
            <Button
              onClick={() => window.location.href = '/upload'}
              className="rounded-full shadow-glow hover:shadow-hover transition-all duration-300"
            >
              Upload Photos
            </Button>
          </div>
        )}

        {/* Masonry Gallery */}
        {!isLoading && images.length > 0 && (
          <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
            {images.map((image, index) => (
              <div key={index} className="break-inside-avoid animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <PhotoCard
                  src={image.src}
                  alt={image.alt}
                  caption={image.caption}
                  onClick={() => openLightbox(index)}
                />
              </div>
            ))}
          </div>
        )}
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
