
create table if not exists public.user_download_limits (
  email text primary key,
  download_limit int default -1,
  download_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.user_download_limits enable row level security;

create policy "Allow public read access" on public.user_download_limits
  for select using (true);

create policy "Allow authenticated update" on public.user_download_limits
  for update using (auth.role() = 'authenticated');

create policy "Allow authenticated insert" on public.user_download_limits
  for insert with check (auth.role() = 'authenticated');
