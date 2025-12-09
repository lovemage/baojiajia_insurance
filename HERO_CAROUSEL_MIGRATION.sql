-- 備份舊數據
create table if not exists public.hero_carousel_backup as select * from public.hero_carousel where false;

-- 刪除舊表（如果存在）
drop table if exists public.hero_carousel cascade;

-- 創建新的 Hero 輪播表 - 每個 Hero 都有完整的內容和圖片
create table public.hero_carousel (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  subtitle text,
  description text,
  button1_text text,
  button1_link text,
  button2_text text,
  button2_link text,
  image_url text,
  cloudinary_public_id text,
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

-- 插入預設 Hero 輪播項目
insert into public.hero_carousel (
  title, subtitle, description,
  button1_text, button1_link,
  button2_text, button2_link,
  image_url, display_order, is_active
) values (
  '我們的願景是\n打破傳統保險業務的框架',
  '',
  '提供對等、客觀、正確的資訊，\n讓大家在資訊爆炸的環境中有辨別好壞的能力。\n用專業的知識為你在市場中找出最適合的規劃方案！',
  '需求分析 DIY',
  '/analysis',
  '保險知識分享',
  '/blog',
  '',
  1,
  true
)
on conflict do nothing;

