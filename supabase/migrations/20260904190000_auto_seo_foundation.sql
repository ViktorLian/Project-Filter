-- Company-scoped AutoSEO settings and content queue.
create table if not exists public.seo_settings (
  company_id uuid primary key references public.leads_companies(id) on delete cascade,
  site_url text,
  business_description text,
  services text[] not null default '{}',
  service_areas text[] not null default '{}',
  topics text[] not null default '{}',
  publishing_mode text not null default 'draft' check (publishing_mode in ('draft', 'webhook')),
  publishing_webhook_url text,
  publishing_webhook_secret text,
  frequency_days integer not null default 7 check (frequency_days between 1 and 31),
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.seo_settings enable row level security;

create table if not exists public.seo_content_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.leads_companies(id) on delete cascade,
  title text not null,
  slug text not null,
  excerpt text not null,
  content_markdown text not null,
  meta_description text not null,
  keywords text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published', 'failed')),
  published_url text,
  provider_response jsonb,
  generated_at timestamptz not null default now(),
  published_at timestamptz,
  unique(company_id, slug)
);
alter table public.seo_content_items enable row level security;
create index if not exists seo_content_company_generated_idx
  on public.seo_content_items(company_id, generated_at desc);
