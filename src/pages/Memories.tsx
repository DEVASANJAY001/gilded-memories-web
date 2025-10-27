import { useState, useEffect } from "react";
import { PhotoCard } from "@/components/PhotoCard";
import { Heart, Plus, Calendar, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Memory {
  id: string;
  photo_url: string;
  caption: string;
  description: string | null;
  memory_date: string;
  created_at: string;
}

const Memories = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form state
  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [memoryDate, setMemoryDate] = useState<Date | undefined>(new Date());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch memories
  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    const { data, error } = await supabase
      .from("memories")
      .select("*")
      .order("memory_date", { ascending: false });

    if (error) {
      toast.error("Failed to load memories");
      return;
    }

    setMemories(data || []);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !caption || !memoryDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsUploading(true);

    try {
      // Upload photo to storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("photos")
        .getPublicUrl(filePath);

      // Insert memory record
      const { error: insertError } = await supabase
        .from("memories")
        .insert({
          photo_url: publicUrl,
          caption,
          description,
          memory_date: format(memoryDate, "yyyy-MM-dd"),
        });

      if (insertError) throw insertError;

      toast.success("Memory added successfully! 💖");
      setIsOpen(false);
      resetForm();
      fetchMemories();
    } catch (error) {
      console.error("Error adding memory:", error);
      toast.error("Failed to add memory");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setCaption("");
    setDescription("");
    setMemoryDate(new Date());
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-background via-accent to-muted">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-6 animate-fade-in">
          <div className="relative inline-block">
            <h1 className="font-handwriting text-6xl md:text-7xl text-primary font-bold drop-shadow-lg">
              Our Memories 💖
            </h1>
            <div className="absolute -inset-4 bg-gradient-glow opacity-60 blur-3xl -z-10 animate-glow-pulse" />
          </div>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-light">
            Every moment captured, every feeling treasured
          </p>
          
          {/* Add Memory Button */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 shadow-glow text-white">
                <Plus className="mr-2" size={20} />
                Add Memory
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-handwriting text-primary">Add New Memory 💫</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="photo">Photo *</Label>
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 hover:border-primary/50 transition-colors">
                    {previewUrl ? (
                      <div className="relative">
                        <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ) : (
                      <label htmlFor="photo" className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload className="text-primary" size={32} />
                        <span className="text-sm text-muted-foreground">Click to upload photo</span>
                      </label>
                    )}
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Caption */}
                <div className="space-y-2">
                  <Label htmlFor="caption">Caption *</Label>
                  <Input
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Give your memory a title..."
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Share the story behind this moment..."
                    rows={3}
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label>Memory Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !memoryDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {memoryDate ? format(memoryDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={memoryDate}
                        onSelect={setMemoryDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button type="submit" className="w-full bg-gradient-primary" disabled={isUploading}>
                  {isUploading ? "Adding..." : "Add Memory"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Timeline */}
        <div className="relative space-y-12">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-lavender to-primary opacity-30" />

          {memories.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <Heart className="mx-auto mb-4 text-primary/50" size={48} />
              <p className="text-muted-foreground text-lg">No memories yet. Start adding your special moments! 💫</p>
            </div>
          ) : (
            memories.map((memory, index) => (
              <div
                key={memory.id}
                className={cn(
                  "relative animate-fade-in",
                  index % 2 === 0 ? "md:pr-[calc(50%+3rem)]" : "md:pl-[calc(50%+3rem)]"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Timeline dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background transform -translate-x-1/2 z-10 animate-glow-pulse" />

                <div className={cn("ml-20 md:ml-0", index % 2 !== 0 && "md:text-right")}>
                  {/* Date badge */}
                  <div className={cn("inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4", index % 2 !== 0 && "md:flex-row-reverse")}>
                    <Calendar size={16} className="text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {format(new Date(memory.memory_date), "MMMM dd, yyyy")}
                    </span>
                  </div>

                  {/* Memory card */}
                  <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-4 shadow-elegant border border-primary/10 space-y-3 hover:shadow-glow transition-all duration-300">
                    <PhotoCard
                      src={memory.photo_url}
                      alt={memory.caption}
                      className="aspect-[4/3]"
                    />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Heart className="fill-primary text-primary flex-shrink-0" size={16} />
                        <h3 className="font-semibold text-lg text-foreground">{memory.caption}</h3>
                      </div>
                      {memory.description && (
                        <p className="text-foreground/80 text-sm leading-relaxed">{memory.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom message */}
        <div className="text-center mt-16 animate-fade-in space-y-4">
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
          <p className="text-muted-foreground font-light italic">
            "Every memory with you is a treasure 💖"
          </p>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default Memories;
