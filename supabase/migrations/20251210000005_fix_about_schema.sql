-- Fix about_content table schema
do $$
begin
  -- Create table if it doesn't exist (basic structure)
  create table if not exists public.about_content (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  -- Add columns if they don't exist
  if not exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'mission_title') then
    alter table public.about_content add column mission_title text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'mission_content') then
    alter table public.about_content add column mission_content text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'instagram_followers') then
    alter table public.about_content add column instagram_followers text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'clients_served') then
    alter table public.about_content add column clients_served text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'satisfaction_rate') then
    alter table public.about_content add column satisfaction_rate text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'articles_published') then
    alter table public.about_content add column articles_published text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'team_visible') then
    alter table public.about_content add column team_visible boolean default false;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'intro_visible') then
    alter table public.about_content add column intro_visible boolean default false;
  end if;
end $$;

-- Ensure other tables exist
create table if not exists public.team_members (
  id uuid default gen_random_uuid() primary key,
  name text,
  role text,
  description text,
  image_url text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.core_values (
  id uuid default gen_random_uuid() primary key,
  icon text,
  title text,
  description text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (safe to run multiple times)
alter table public.about_content enable row level security;
alter table public.team_members enable row level security;
alter table public.core_values enable row level security;

-- Policies (drop first to avoid errors if they exist)
drop policy if exists "Public can view about content" on public.about_content;
drop policy if exists "Admins can update about content" on public.about_content;
drop policy if exists "Admins can insert about content" on public.about_content;

create policy "Public can view about content" on public.about_content for select using (true);
create policy "Admins can update about content" on public.about_content for update using (true);
create policy "Admins can insert about content" on public.about_content for insert with check (true);

drop policy if exists "Public can view team members" on public.team_members;
drop policy if exists "Admins can manage team members" on public.team_members;

create policy "Public can view team members" on public.team_members for select using (true);
create policy "Admins can manage team members" on public.team_members for all using (true);

drop policy if exists "Public can view core values" on public.core_values;
drop policy if exists "Admins can manage core values" on public.core_values;

create policy "Public can view core values" on public.core_values for select using (true);
create policy "Admins can manage core values" on public.core_values for all using (true);

-- Insert default row if table is empty
insert into public.about_content (mission_title, mission_content, team_visible, intro_visible)
select '保家佳的成立初衷', '在保險市場上，因為有成千上萬的商品、密密麻麻的條款、艱澀難懂的專業術語，又甚至是一些不公開的銷售話術...等。導致一般人想要看懂保險真的是困難重重！也因此保險業總是被說是個「水很深」的行業。

可是，如果想找保險業務了解，每一個業務各說各的好，是真是假難以分辨！又或是怕找了業務會遇到強迫推銷、人情壓力的問題。

保家佳的成立，就是希望能創造一個沒有推銷壓力的知識環境，我們希望用白話文的說明讓保險變得簡單易懂，也陪著您破解那些討人厭的話術！我們相信，唯有真正了解保險，才能做出最適合自己的決策。

我們也希望能陪伴您走過人生每個重要的階段，為您和家人建立最完善的保障。', false, false
where not exists (select 1 from public.about_content);
