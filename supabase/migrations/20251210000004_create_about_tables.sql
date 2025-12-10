-- Create about_content table
create table if not exists public.about_content (
  id uuid default gen_random_uuid() primary key,
  mission_title text,
  mission_content text,
  instagram_followers text,
  clients_served text,
  satisfaction_rate text,
  articles_published text,
  team_visible boolean default false,
  intro_visible boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create team_members table
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

-- Create core_values table
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

-- Enable RLS
alter table public.about_content enable row level security;
alter table public.team_members enable row level security;
alter table public.core_values enable row level security;

-- Policies
create policy "Public can view about content"
  on public.about_content for select
  using (true);

create policy "Admins can update about content"
  on public.about_content for update
  using (true);
  
create policy "Admins can insert about content"
  on public.about_content for insert
  with check (true);


create policy "Public can view team members"
  on public.team_members for select
  using (true);

create policy "Admins can manage team members"
  on public.team_members for all
  using (true);


create policy "Public can view core values"
  on public.core_values for select
  using (true);

create policy "Admins can manage core values"
  on public.core_values for all
  using (true);

-- Insert default about content if not exists
insert into public.about_content (mission_title, mission_content, team_visible, intro_visible)
select '保家佳的成立初衷', '在保險市場上，因為有成千上萬的商品、密密麻麻的條款、艱澀難懂的專業術語，又甚至是一些不公開的銷售話術...等。導致一般人想要看懂保險真的是困難重重！也因此保險業總是被說是個「水很深」的行業。

可是，如果想找保險業務了解，每一個業務各說各的好，是真是假難以分辨！又或是怕找了業務會遇到強迫推銷、人情壓力的問題。

保家佳的成立，就是希望能創造一個沒有推銷壓力的知識環境，我們希望用白話文的說明讓保險變得簡單易懂，也陪著您破解那些討人厭的話術！我們相信，唯有真正了解保險，才能做出最適合自己的決策。

我們也希望能陪伴您走過人生每個重要的階段，為您和家人建立最完善的保障。', false, false
where not exists (select 1 from public.about_content);
