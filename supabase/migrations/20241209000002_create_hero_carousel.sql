-- 創建 Hero 輪播圖片表
create table if not exists public.hero_carousel (
  id uuid default gen_random_uuid() primary key,
  image_url text not null,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 啟用 RLS
alter table public.hero_carousel enable row level security;

-- 創建 RLS 政策 - 公開讀取
create policy "Allow public to read hero carousel" on public.hero_carousel
  for select using (is_active = true);

-- 創建 RLS 政策 - 認證用戶管理
create policy "Allow authenticated users to manage hero carousel" on public.hero_carousel
  for all using (auth.role() = 'authenticated');

-- 創建觸發器
create trigger handle_hero_carousel_updated_at
  before update on public.hero_carousel
  for each row execute procedure public.handle_updated_at();

-- 創建輪播設定表
create table if not exists public.carousel_settings (
  id uuid default gen_random_uuid() primary key,
  setting_key text unique not null,
  setting_value text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 啟用 RLS
alter table public.carousel_settings enable row level security;

-- 創建 RLS 政策
create policy "Allow public to read carousel settings" on public.carousel_settings
  for select using (true);

create policy "Allow authenticated users to manage carousel settings" on public.carousel_settings
  for all using (auth.role() = 'authenticated');

-- 創建觸發器
create trigger handle_carousel_settings_updated_at
  before update on public.carousel_settings
  for each row execute procedure public.handle_updated_at();

-- 插入預設輪播設定
insert into public.carousel_settings (setting_key, setting_value, description) values
  ('carousel_interval', '5000', '輪播間隔時間（毫秒），預設 5000ms = 5秒'),
  ('carousel_auto_play', 'true', '是否自動播放輪播')
on conflict (setting_key) do nothing;

-- 插入預設輪播圖片
insert into public.hero_carousel (image_url, display_order, is_active) values
  ('https://readdy.ai/api/search-image?query=Warm%20family%20protection%20concept%20with%20happy%20Asian%20family%20silhouette%20in%20bright%20natural%20setting%2C%20soft%20golden%20lighting%2C%20simple%20clean%20background%20showing%20security%20and%20care%2C%20professional%20lifestyle%20photography%20with%20emotional%20warmth&width=1920&height=1080&seq=hero-baojia-main&orientation=landscape', 1, true)
on conflict do nothing;
