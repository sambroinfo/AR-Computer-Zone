-- Optional bucket setup for Supabase Storage.
-- Run separately in Supabase SQL Editor after deciding your access model.
-- Public read means anyone with the object URL can view files in product-media.
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('product-media', 'product-media', true),
  ('private-uploads', 'private-uploads', false)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = EXCLUDED.public;
