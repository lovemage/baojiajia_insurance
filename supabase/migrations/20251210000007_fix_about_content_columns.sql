-- Add missing columns to about_content table
-- This migration ensures all required columns exist for the AboutEditor component
do $$
begin
  -- Create table if it doesn't exist (basic structure)
  create table if not exists public.about_content (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  -- Add all required columns if they don't exist
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

  if not exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'hero_image') then
    alter table public.about_content add column hero_image text;
  end if;

  -- Check for and add required columns if they don't exist
  if not exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'section') then
    alter table public.about_content add column section text default 'intro';
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'display_order') then
    alter table public.about_content add column display_order integer default 0;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'content_key') then
    alter table public.about_content add column content_key text default 'about_intro';
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'content_value') then
    alter table public.about_content add column content_value text default '' not null;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'content_type') then
    alter table public.about_content add column content_type text default 'text' not null;
  end if;
end $$;

-- Enable RLS if not already enabled
do $$
begin
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'about_content' and rowsecurity = true) then
    alter table public.about_content enable row level security;
  end if;
end $$;

-- Ensure policies exist (drop first to avoid errors)
drop policy if exists "Public can view about content" on public.about_content;
drop policy if exists "Admins can update about content" on public.about_content;
drop policy if exists "Admins can insert about content" on public.about_content;

create policy "Public can view about content" on public.about_content for select using (true);
create policy "Admins can update about content" on public.about_content for update using (true);
create policy "Admins can insert about content" on public.about_content for insert with check (true);

-- Insert default row if table is empty
do $$
begin
  if not exists (select 1 from public.about_content limit 1) then
    -- Check what columns actually exist and only insert those
    declare
      has_section boolean := false;
      has_order boolean := false;
      has_key boolean := false;
      has_content_value boolean := false;
      has_content_type boolean := false;
      default_mission_title constant text := '保家佳的成立初衷';
      default_mission_content constant text := '在保險市場上，因為有成千上萬的商品、密密麻麻的條款、艱澀難懂的專業術語，又甚至是一些不公開的銷售話術...等。導致一般人想要看懂保險真的是困難重重！也因此保險業總是被說是個「水很深」的行業。

可是，如果想找保險業務了解，每一個業務各說各的好，是真是假難以分辨！又或是怕找了業務會遇到強迫推銷、人情壓力的問題。

保家佳的成立，就是希望能創造一個沒有推銷壓力的知識環境，我們希望用白話文的說明讓保險變得簡單易懂，也陪著您破解那些討人厭的話術！我們相信，唯有真正了解保險，才能做出最適合自己的決策。

我們也希望能陪伴您走過人生每個重要的階段，為您和家人建立最完善的保障。';
      default_instagram_followers constant text := '1000+';
      default_clients_served constant text := '500+';
      default_satisfaction_rate constant text := '98%';
      default_articles_published constant text := '200+';
      columns_sql text;
      values_sql text;
    begin
      
      -- Check if section column exists
      if exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'section') then
        has_section := true;
      end if;
      
      -- Check if display_order column exists  
      if exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'display_order') then
        has_order := true;
      end if;
      
      -- Check if content_key column exists  
      if exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'content_key') then
        has_key := true;
      end if;

      if exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'content_value') then
        has_content_value := true;
      end if;

      if exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'content_type') then
        has_content_type := true;
      end if;
      
      -- Build insert statement dynamically so we only reference existing columns
      columns_sql := 'mission_title, mission_content, instagram_followers, clients_served, satisfaction_rate, articles_published, team_visible, intro_visible';
      values_sql := concat(
        quote_literal(default_mission_title), ', ',
        quote_literal(default_mission_content), ', ',
        quote_literal(default_instagram_followers), ', ',
        quote_literal(default_clients_served), ', ',
        quote_literal(default_satisfaction_rate), ', ',
        quote_literal(default_articles_published), ', ',
        'false, false'
      );

      if has_key then
        columns_sql := concat(columns_sql, ', content_key');
        values_sql := concat(values_sql, ', ', quote_literal('about_intro'));
      end if;

      if has_section then
        columns_sql := concat(columns_sql, ', section');
        values_sql := concat(values_sql, ', ', quote_literal('intro'));
      end if;

      if has_order then
        columns_sql := concat(columns_sql, ', display_order');
        values_sql := concat(values_sql, ', 1');
      end if;

      if has_content_value then
        columns_sql := concat(columns_sql, ', content_value');
        values_sql := concat(values_sql, ', ', quote_literal(default_mission_content));
      end if;

      if has_content_type then
        columns_sql := concat(columns_sql, ', content_type');
        values_sql := concat(values_sql, ', ', quote_literal('text'));
      end if;

      execute format('insert into public.about_content (%s) values (%s);', columns_sql, values_sql);
    end;
  end if;
end $$;
