-- FurniCycle schema. Run once in the Supabase SQL editor (Dashboard → SQL → New query).

-- Profiles: one row per auth user, created automatically on sign-up.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  whatsapp boolean not null default true,
  district text not null default '',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, phone)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), coalesce(new.raw_user_meta_data ->> 'phone', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Listings
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null default '',
  category text not null check (category in ('sofa','bed','table','chair','wardrobe','shelf','desk','dining','cabinet','other')),
  condition text not null check (condition in ('like-new','good','fair','needs-repair')),
  price integer not null default 0 check (price >= 0),
  is_free boolean not null default false,
  district text not null,
  town text not null default '',
  lat double precision,
  lng double precision,
  images text[] not null default '{}',
  status text not null default 'available' check (status in ('available','sold')),
  seller_name text not null default '',
  contact_phone text not null,
  whatsapp boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_browse_idx on public.listings (status, featured desc, created_at desc);
create index if not exists listings_user_idx on public.listings (user_id);
create index if not exists listings_category_idx on public.listings (category);
create index if not exists listings_district_idx on public.listings (district);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists listings_touch on public.listings;
create trigger listings_touch before update on public.listings
  for each row execute function public.touch_updated_at();

-- Sellers may not promote their own listings; `featured` is set by an admin only.
create or replace function public.guard_featured()
returns trigger language plpgsql as $$
begin
  if auth.role() <> 'service_role' then
    if tg_op = 'INSERT' then new.featured = false;
    else new.featured = old.featured;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists listings_guard_featured on public.listings;
create trigger listings_guard_featured before insert or update on public.listings
  for each row execute function public.guard_featured();

-- Favorites (saved listings)
create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- Row level security
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles for select using (auth.uid() = id);
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

drop policy if exists "listings readable" on public.listings;
create policy "listings readable" on public.listings for select using (true);
drop policy if exists "insert own listing" on public.listings;
create policy "insert own listing" on public.listings for insert with check (auth.uid() = user_id);
drop policy if exists "update own listing" on public.listings;
create policy "update own listing" on public.listings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "delete own listing" on public.listings;
create policy "delete own listing" on public.listings for delete using (auth.uid() = user_id);

drop policy if exists "own favorites" on public.favorites;
create policy "own favorites" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage bucket for listing photos (public read, owners write into their own folder)
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

drop policy if exists "listing images public read" on storage.objects;
create policy "listing images public read" on storage.objects for select
  using (bucket_id = 'listing-images');
drop policy if exists "listing images owner upload" on storage.objects;
create policy "listing images owner upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "listing images owner delete" on storage.objects;
create policy "listing images owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);
