create table if not exists public.customer_reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  user_email text,
  user_name text,
  avatar_url text,
  role text,
  rating int not null default 5,
  content text not null,
  source text not null default 'site',
  is_approved boolean not null default false,
  is_active boolean not null default false,
  display_order int not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.customer_reviews enable row level security;

drop policy if exists "Public can view active approved customer reviews" on public.customer_reviews;
create policy "Public can view active approved customer reviews"
  on public.customer_reviews for select
  using (is_active = true and is_approved = true);

drop policy if exists "Public can create customer reviews" on public.customer_reviews;
create policy "Public can create customer reviews"
  on public.customer_reviews for insert
  with check (true);

drop policy if exists "Admins can manage customer reviews" on public.customer_reviews;
create policy "Admins can manage customer reviews"
  on public.customer_reviews for all
  using (true);

create index if not exists customer_reviews_is_active_idx on public.customer_reviews (is_active);
create index if not exists customer_reviews_is_approved_idx on public.customer_reviews (is_approved);
create index if not exists customer_reviews_display_order_idx on public.customer_reviews (display_order);

drop trigger if exists handle_customer_reviews_updated_at on public.customer_reviews;
create trigger handle_customer_reviews_updated_at
  before update on public.customer_reviews
  for each row execute procedure public.handle_updated_at();

insert into public.system_settings (setting_key, setting_value, description) values
  ('reviews_google_login_required', 'false', 'Require Google login to submit customer reviews')
on conflict (setting_key) do nothing;
