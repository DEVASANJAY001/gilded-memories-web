import { useState } from "react";
import { Upload as UploadIcon, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [captions, setCaptions] = useState<Record<number, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Filter for image files
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length !== files.length) {
      toast.error("Only image files are allowed");
    }

    setSelectedFiles(prev => [...prev, ...imageFiles]);
    
    // Create previews
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setCaptions(prev => {
      const newCaptions = { ...prev };
      delete newCaptions[index];
      return newCaptions;
    });
  };

  const updateCaption = (index: number, caption: string) => {
    setCaptions(prev => ({ ...prev, [index]: caption }));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one photo");
      return;
    }

    setIsUploading(true);
    let successCount = 0;

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = fileName;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath);

        // Save to database
        const { error: dbError } = await supabase
          .from('photos')
          .insert({
            file_path: publicUrl,
            file_name: file.name,
            caption: captions[i] || null
          });

        if (dbError) {
          console.error('Database error:', dbError);
          toast.error(`Failed to save ${file.name} to database`);
          continue;
        }

        successCount++;
      }

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} photo${successCount > 1 ? 's' : ''}! 🎉`);
        
        // Clear form
        setSelectedFiles([]);
        setPreviews([]);
        setCaptions({});
        
        // Navigate to gallery after a short delay
        setTimeout(() => {
          navigate('/gallery');
        }, 1500);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("An error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-background via-accent to-muted">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-6 animate-fade-in">
          <div className="relative inline-block">
            <h1 className="font-handwriting text-6xl md:text-7xl text-primary font-bold drop-shadow-lg">
              Upload Photos 📸
            </h1>
            <div className="absolute -inset-4 bg-gradient-glow opacity-60 blur-3xl -z-10 animate-glow-pulse" />
          </div>
          <p className="text-muted-foreground text-lg md:text-xl font-light">
            Add beautiful moments to the gallery. Supports JPG, PNG, GIF, and WebP formats.
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-elegant border-2 border-primary/10 p-8 md:p-10 space-y-8">
          {/* File Input */}
          <div className="space-y-4">
            <Label htmlFor="file-upload" className="text-lg font-medium">
              Select Photos
            </Label>
            <div className="relative">
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-56 border-3 border-dashed border-primary/30 rounded-3xl cursor-pointer hover:border-primary hover:bg-gradient-to-br hover:from-primary/5 hover:to-lavender/5 transition-all duration-500 group bg-gradient-to-br from-muted/50 to-accent/30"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <UploadIcon className="w-16 h-16 text-primary drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute -inset-2 bg-gradient-glow opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-semibold text-primary group-hover:scale-105 transition-transform duration-300">Click to select photos</p>
                    <p className="text-sm text-muted-foreground">
                      or drag and drop multiple files
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Preview Grid */}
          {previews.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Image size={20} />
                Selected Photos ({previews.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative bg-accent/30 rounded-xl p-4 space-y-3 animate-scale-in"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 z-10 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
                      aria-label="Remove photo"
                    >
                      <X size={16} />
                    </button>

                    {/* Image preview */}
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* File name */}
                    <p className="text-sm font-medium truncate">
                      {selectedFiles[index].name}
                    </p>

                    {/* Caption input */}
                    <div className="space-y-2">
                      <Label htmlFor={`caption-${index}`} className="text-sm">
                        Caption (optional)
                      </Label>
                      <Textarea
                        id={`caption-${index}`}
                        placeholder="Add a beautiful caption..."
                        value={captions[index] || ''}
                        onChange={(e) => updateCaption(index, e.target.value)}
                        className="resize-none h-20"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
              size="lg"
              className="px-16 py-7 text-xl rounded-full shadow-glow hover:shadow-elegant transition-all duration-500 hover:scale-105 bg-gradient-primary border-0"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin mr-2">⚡</div>
                  Uploading Magic...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2" size={24} />
                  Upload {selectedFiles.length > 0 ? `${selectedFiles.length} Photo${selectedFiles.length > 1 ? 's' : ''}` : 'Photos'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
