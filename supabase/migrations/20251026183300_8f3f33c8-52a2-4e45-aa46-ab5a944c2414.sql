-- Create notes table
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender TEXT NOT NULL CHECK (sender IN ('harini', 'deva')),
  message TEXT NOT NULL,
  parent_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anyone can read and write)
CREATE POLICY "Anyone can view notes" 
ON public.notes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create notes" 
ON public.notes 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance on replies
CREATE INDEX idx_notes_parent_id ON public.notes(parent_id);
CREATE INDEX idx_notes_created_at ON public.notes(created_at DESC);