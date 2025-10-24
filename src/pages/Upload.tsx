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
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <h1 className="font-handwriting text-5xl md:text-6xl text-primary font-bold">
            Upload Photos 📸
          </h1>
          <p className="text-muted-foreground text-lg">
            Add beautiful moments to the gallery. Supports JPG, PNG, GIF, and WebP formats.
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-card rounded-3xl shadow-soft p-8 space-y-8">
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
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary hover:bg-accent/50 transition-all duration-300"
              >
                <div className="flex flex-col items-center gap-3">
                  <UploadIcon className="w-12 h-12 text-primary" />
                  <div className="text-center">
                    <p className="text-lg font-medium">Click to select photos</p>
                    <p className="text-sm text-muted-foreground mt-1">
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
              className="px-12 py-6 text-lg rounded-full shadow-glow hover:shadow-hover transition-all duration-300"
            >
              {isUploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <UploadIcon className="mr-2" size={20} />
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
