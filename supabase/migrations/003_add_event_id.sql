-- Add event_id column to vendors and budget_items for Ganap PH
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.events(id) ON DELETE CASCADE;
ALTER TABLE public.budget_items ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.events(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX IF NOT EXISTS vendors_event_id_idx ON public.vendors(event_id);
CREATE INDEX IF NOT EXISTS budget_items_event_id_idx ON public.budget_items(event_id);
