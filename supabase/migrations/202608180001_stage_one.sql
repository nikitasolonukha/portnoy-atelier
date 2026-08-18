create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'tailor', 'employee');
create type public.fabric_asset_type as enum ('photo', 'texture');
create type public.import_status as enum ('pending', 'processing', 'completed', 'failed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role public.app_role not null default 'employee',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.fabrics (
  id uuid primary key default gen_random_uuid(),
  article text not null unique,
  name text not null,
  manufacturer text,
  collection text,
  composition text,
  main_color text,
  pattern text,
  weight_gsm integer check (weight_gsm is null or weight_gsm >= 0),
  width_cm numeric check (width_cm is null or width_cm >= 0),
  price_per_meter numeric check (price_per_meter is null or price_per_meter >= 0),
  currency text check (currency is null or currency in ('RUB','EUR','USD')),
  description text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.fabric_assets (
  id uuid primary key default gen_random_uuid(),
  fabric_id uuid not null references public.fabrics(id) on delete cascade,
  type public.fabric_asset_type not null,
  storage_path text not null,
  original_filename text not null,
  mime_type text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create unique index one_texture_per_fabric on public.fabric_assets(fabric_id) where type = 'texture';

create table public.configuration_groups (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table public.configuration_options (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.configuration_groups(id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  preview_image_path text,
  model_key text,
  material_key text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(group_id, key)
);

create table public.configurations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles(id),
  fabric_id uuid references public.fabrics(id) on delete restrict,
  settings jsonb not null default '{}'::jsonb,
  model_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.fabric_imports (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  status public.import_status not null default 'pending',
  total_rows integer not null default 0,
  valid_rows integer not null default 0,
  invalid_rows integer not null default 0,
  created_rows integer not null default 0,
  updated_rows integer not null default 0,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index fabrics_name_idx on public.fabrics(name);
create index fabrics_active_idx on public.fabrics(is_active);
create index fabrics_manufacturer_idx on public.fabrics(manufacturer);
create index fabrics_color_idx on public.fabrics(main_color);
create index fabrics_pattern_idx on public.fabrics(pattern);
create index configurations_created_by_idx on public.configurations(created_by);
create index configurations_updated_at_idx on public.configurations(updated_at desc);

create or replace function public.current_role() returns public.app_role language sql stable security definer set search_path = public as $$ select role from public.profiles where id = auth.uid() and is_active = true $$;

alter table public.profiles enable row level security;
alter table public.fabrics enable row level security;
alter table public.fabric_assets enable row level security;
alter table public.configuration_groups enable row level security;
alter table public.configuration_options enable row level security;
alter table public.configurations enable row level security;
alter table public.fabric_imports enable row level security;
alter table public.audit_log enable row level security;

create policy "profile self read" on public.profiles for select using (id = auth.uid() or public.current_role() = 'admin');
create policy "catalog authenticated read" on public.fabrics for select to authenticated using (true);
create policy "catalog staff insert" on public.fabrics for insert to authenticated with check (public.current_role() in ('admin','tailor'));
create policy "catalog staff update" on public.fabrics for update to authenticated using (public.current_role() in ('admin','tailor')) with check (public.current_role() in ('admin','tailor'));
create policy "catalog admin delete" on public.fabrics for delete to authenticated using (public.current_role() = 'admin' and not exists(select 1 from public.configurations c where c.fabric_id = fabrics.id));
create policy "assets authenticated read" on public.fabric_assets for select to authenticated using (true);
create policy "assets staff write" on public.fabric_assets for all to authenticated using (public.current_role() in ('admin','tailor')) with check (public.current_role() in ('admin','tailor'));
create policy "groups authenticated read" on public.configuration_groups for select to authenticated using (is_active = true or public.current_role() = 'admin');
create policy "options authenticated read" on public.configuration_options for select to authenticated using (is_active = true or public.current_role() = 'admin');
create policy "groups admin write" on public.configuration_groups for all to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "options admin write" on public.configuration_options for all to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "configurations own read" on public.configurations for select to authenticated using (created_by = auth.uid() or public.current_role() in ('admin','tailor'));
create policy "configurations own insert" on public.configurations for insert to authenticated with check (created_by = auth.uid());
create policy "configurations own update" on public.configurations for update to authenticated using (created_by = auth.uid() or public.current_role() = 'admin');
create policy "configurations own delete" on public.configurations for delete to authenticated using (created_by = auth.uid() or public.current_role() = 'admin');
create policy "imports own read" on public.fabric_imports for select to authenticated using (created_by = auth.uid() or public.current_role() = 'admin');
create policy "imports staff create" on public.fabric_imports for insert to authenticated with check (created_by = auth.uid() and public.current_role() in ('admin','tailor'));
create policy "audit admin read" on public.audit_log for select to authenticated using (public.current_role() = 'admin');

insert into public.configuration_groups(key,name,sort_order) values ('fabric','Ткань',0),('jacket','Пиджак',1),('lapel','Лацканы',2),('buttons','Пуговицы',3),('pockets','Карманы',4),('trousers','Брюки',5),('vest','Жилет',6);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('fabric-assets','fabric-assets',false,10485760,array['image/jpeg','image/png','image/webp']) on conflict (id) do nothing;
create policy "fabric assets storage read" on storage.objects for select to authenticated using (bucket_id = 'fabric-assets');
create policy "fabric assets storage write" on storage.objects for insert to authenticated with check (bucket_id = 'fabric-assets' and public.current_role() in ('admin','tailor'));
create policy "fabric assets storage update" on storage.objects for update to authenticated using (bucket_id = 'fabric-assets' and public.current_role() in ('admin','tailor'));
create policy "fabric assets storage delete" on storage.objects for delete to authenticated using (bucket_id = 'fabric-assets' and public.current_role() in ('admin','tailor'));
