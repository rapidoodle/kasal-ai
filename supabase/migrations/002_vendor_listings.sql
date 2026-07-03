-- Vendor Listings — public directory (separate from per-wedding vendors table)

create table if not exists public.vendor_listings (
  id uuid default uuid_generate_v4() primary key,

  -- Business info
  business_name text not null,
  slug text unique not null,        -- URL-friendly name e.g. "juan-photography-manila"
  category text not null,
  description text,
  tagline text,                     -- Short one-liner shown on cards

  -- Location
  city text not null,
  province text,

  -- Pricing
  price_min numeric,
  price_max numeric,
  price_label text,                 -- e.g. "Starting at ₱15,000"

  -- Contact
  contact_name text not null,
  contact_email text not null,
  contact_number text,
  website_url text,

  -- Social
  facebook_url text,
  instagram_url text,
  tiktok_url text,

  -- Media
  cover_image_url text,
  portfolio_urls jsonb default '[]',

  -- Admin
  approved boolean default false,
  featured boolean default false,
  submitted_at timestamptz default now() not null,
  approved_at timestamptz
);

-- Indexes
create index if not exists vendor_listings_category_idx on public.vendor_listings(category);
create index if not exists vendor_listings_city_idx on public.vendor_listings(city);
create index if not exists vendor_listings_approved_idx on public.vendor_listings(approved);
create index if not exists vendor_listings_slug_idx on public.vendor_listings(slug);

-- RLS
alter table public.vendor_listings enable row level security;

-- Anyone can read approved listings
create policy "Public can read approved listings"
  on public.vendor_listings for select
  using (approved = true);

-- Anyone can submit (insert) a new listing
create policy "Anyone can submit a listing"
  on public.vendor_listings for insert
  with check (true);
