-- 修復 homepage_content 表結構
-- 刪除舊表（如果存在）
drop table if exists public.homepage_content cascade;

-- 創建正確的 homepage_content 表
create table public.homepage_content (
  id uuid default gen_random_uuid() primary key,
  content_key text unique not null,
  content_value text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 啟用 RLS
alter table public.homepage_content enable row level security;

-- 創建 RLS 政策
create policy "Allow public to read homepage content" on public.homepage_content
  for select using (true);

create policy "Allow authenticated users to manage homepage content" on public.homepage_content
  for all using (auth.role() = 'authenticated');

-- 創建觸發器
create trigger handle_homepage_content_updated_at
  before update on public.homepage_content
  for each row execute procedure public.handle_updated_at();

-- 插入預設的首頁內容
insert into public.homepage_content (content_key, content_value, display_order) values
  ('hero_title', '我們的願景是\n打破傳統保險業務的框架', 1),
  ('hero_subtitle', '', 2),
  ('hero_description', '提供對等、客觀、正確的資訊，\n讓大家在資訊爆炸的環境中有辨別好壞的能力。\n用專業的知識為你在市場中找出最適合的規劃方案！', 3),
  ('hero_button1_text', '需求分析 DIY', 4),
  ('hero_button1_link', '/analysis', 5),
  ('hero_button2_text', '保險知識分享', 6),
  ('hero_button2_link', '/blog', 7),
  ('hero_image_url', 'https://readdy.ai/api/search-image?query=Warm%20family%20protection%20concept%20with%20happy%20Asian%20family%20silhouette%20in%20bright%20natural%20setting%2C%20soft%20golden%20lighting%2C%20simple%20clean%20background%20showing%20security%20and%20care%2C%20professional%20lifestyle%20photography%20with%20emotional%20warmth&width=1920&height=1080&seq=hero-baojia-main&orientation=landscape', 8),
  ('cta_title', '開始您的保險規劃之旅', 9),
  ('cta_description', '先透過「需求分析 DIY」了解自己的保障缺口，或直接預約諮詢，讓保家佳為您量身規劃', 10),
  ('cta_button1_text', '立即開始需求分析', 11),
  ('cta_button1_link', '/analysis', 12),
  ('cta_button2_text', '預約專人諮詢', 13),
  ('cta_button2_link', '/contact', 14),
  ('instagram_text', '追蹤我們的 Instagram', 15),
  ('instagram_handle', '@baojiajia', 16),
  ('instagram_url', 'https://instagram.com/baojiajia', 17)
on conflict (content_key) do nothing;
