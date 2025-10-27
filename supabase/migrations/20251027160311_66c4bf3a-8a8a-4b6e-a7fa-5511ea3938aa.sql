-- Create memories table
CREATE TABLE public.memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  description TEXT,
  memory_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view memories" 
ON public.memories 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create memories" 
ON public.memories 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update memories" 
ON public.memories 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete memories" 
ON public.memories 
FOR DELETE 
USING (true);