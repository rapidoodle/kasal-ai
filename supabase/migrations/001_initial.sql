-- Kasal.ai Database Schema

create extension if not exists "uuid-ossp";

-- Weddings table (stores all wedding details + checklist as JSONB)
create table if not exists public.weddings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete set null,
  details jsonb not null,
  checklist jsonb not null default '[]',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Vendors table
create table if not exists public.vendors (
  id uuid default uuid_generate_v4() primary key,
  wedding_id uuid references public.weddings(id) on delete cascade not null,
  category text not null,
  name text not null,
  contact_name text,
  contact_number text,
  price numeric default 0,
  status text not null default 'researching',
  notes text,
  created_at timestamptz default now() not null
);

-- Budget items table
create table if not exists public.budget_items (
  id uuid default uuid_generate_v4() primary key,
  wedding_id uuid references public.weddings(id) on delete cascade not null,
  category text not null,
  label text not null,
  estimated numeric default 0,
  actual numeric default 0,
  paid boolean default false,
  created_at timestamptz default now() not null
);

-- Indexes
create index if not exists weddings_user_id_idx on public.weddings(user_id);
create index if not exists vendors_wedding_id_idx on public.vendors(wedding_id);
create index if not exists budget_items_wedding_id_idx on public.budget_items(wedding_id);

-- RLS
alter table public.weddings enable row level security;
alter table public.vendors enable row level security;
alter table public.budget_items enable row level security;

-- Anyone can insert/read weddings (anonymous planning supported)
create policy "Anyone can insert weddings" on public.weddings for insert with check (true);
create policy "Anyone can read weddings" on public.weddings for select using (true);
create policy "Anyone can update weddings" on public.weddings for update using (true);

create policy "Anyone can manage vendors" on public.vendors for all using (true);
create policy "Anyone can manage budget" on public.budget_items for all using (true);
