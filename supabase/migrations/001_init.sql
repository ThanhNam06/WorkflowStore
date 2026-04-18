-- WorkflowStore schema (Supabase Postgres)
-- Safe to run multiple times (idempotent where possible)

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum ('pending', 'paid', 'failed', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_provider') then
    create type payment_provider as enum ('sepay', 'paypal');
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type payment_status as enum ('paid', 'failed', 'pending');
  end if;
end $$;

create table if not exists public.products (
  id uuid primary key,
  slug text not null unique,
  name text not null,
  description text,
  price_vnd numeric(12,0) not null check (price_vnd >= 0),
  price_usd numeric(12,2) not null check (price_usd >= 0),
  file_path text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  access_token text not null default encode(gen_random_bytes(24), 'hex'),
  email text not null,
  country_code text not null,
  currency text not null check (currency in ('VND','USD')),
  amount numeric(12,2) not null check (amount >= 0),
  status order_status not null default 'pending',
  payment_provider payment_provider not null,
  provider_order_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists orders_access_token_uk on public.orders(access_token);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

create table if not exists public.order_items (
  id bigserial primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name text not null,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);

create table if not exists public.payments (
  id bigserial primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  provider payment_provider not null,
  provider_txn_id text not null,
  raw_payload jsonb,
  status payment_status not null default 'paid',
  created_at timestamptz not null default now(),
  unique (provider, provider_txn_id)
);

create index if not exists payments_order_id_idx on public.payments(order_id);

create table if not exists public.download_tokens (
  token text primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  expires_at timestamptz not null,
  remaining int not null default 3 check (remaining >= 0),
  created_at timestamptz not null default now()
);

create index if not exists download_tokens_order_id_idx on public.download_tokens(order_id);
create index if not exists download_tokens_expires_at_idx on public.download_tokens(expires_at);

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute procedure public.set_updated_at();

-- Enable RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.download_tokens enable row level security;

-- products: public read active products

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='products' and policyname='products_public_select_active'
  ) then
    create policy products_public_select_active
      on public.products
      for select
      using (is_active = true);
  end if;
end $$;

-- orders/order_items/payments/download_tokens:
-- no anon policies by default (server-side access via service role).

