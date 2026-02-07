-- Seed 6 筆預設評價到 customer_reviews，source='seed'
-- 使用固定 UUID 避免重複插入
INSERT INTO public.customer_reviews (id, user_name, role, rating, content, avatar_url, source, is_approved, is_active, display_order) VALUES
  ('a0000001-5eed-4001-a001-000000000001', '小美', '30歲上班族', 5,
   '之前對保險完全不懂，看了保家佳的 IG 文章後，才知道原來醫療險有這麼多眉角！顧問很有耐心地幫我規劃，現在終於有完整的保障了。',
   'https://readdy.ai/api/search-image?query=Friendly%20young%20Asian%20woman%20portrait%20smiling%20warmly%2C%20simple%20clean%20background%2C%20professional%20headshot%20photography%20style%2C%20natural%20lighting%2C%20approachable%20and%20trustworthy%20appearance&width=200&height=200&seq=testimonial-baojia-1&orientation=squarish',
   'seed', true, true, 1),

  ('a0000001-5eed-4001-a001-000000000002', '阿傑', '35歲新手爸爸', 5,
   '寶寶出生後才發現要買的保險好多！保家佳用很簡單的方式讓我了解兒童保險該怎麼買，也幫我省下不少保費。真的很推薦！',
   'https://readdy.ai/api/search-image?query=Young%20Asian%20professional%20man%20portrait%20smiling%20confidently%2C%20simple%20clean%20background%2C%20professional%20headshot%20photography%20style%2C%20natural%20lighting%2C%20modern%20father%20appearance&width=200&height=200&seq=testimonial-baojia-2&orientation=squarish',
   'seed', true, true, 2),

  ('a0000001-5eed-4001-a001-000000000003', '雅婷', '28歲小資族', 5,
   '預算有限但又想要有保障，保家佳教我如何用最少的錢買到最需要的保險。現在每個月保費不到 3000 元，但保障很完整！',
   'https://readdy.ai/api/search-image?query=Creative%20young%20Asian%20woman%20portrait%20smiling%2C%20simple%20clean%20background%2C%20professional%20headshot%20photography%20style%2C%20natural%20lighting%2C%20friendly%20appearance&width=200&height=200&seq=testimonial-baojia-3&orientation=squarish',
   'seed', true, true, 3),

  ('a0000001-5eed-4001-a001-000000000004', '志明', '42歲企業主', 5,
   '經營公司多年，一直沒有好好規劃保險。保家佳不只幫我做個人保障，也協助規劃員工團保，非常專業！',
   'https://readdy.ai/api/search-image?query=Professional%20Asian%20businessman%20portrait%20in%20business%20attire%20smiling%2C%20simple%20clean%20background%2C%20professional%20headshot%20photography%20style%2C%20natural%20lighting%2C%20executive%20appearance&width=200&height=200&seq=testimonial-baojia-4&orientation=squarish',
   'seed', true, true, 4),

  ('a0000001-5eed-4001-a001-000000000005', '佩君', '38歲家庭主婦', 5,
   '之前買了很多儲蓄險，但醫療保障卻不足。保家佳幫我重新檢視保單，調整成更適合我們家的配置。理賠時也很快速！',
   'https://readdy.ai/api/search-image?query=Warm%20Asian%20woman%20portrait%20smiling%20kindly%2C%20simple%20clean%20background%2C%20professional%20headshot%20photography%20style%2C%20natural%20lighting%2C%20caring%20mother%20appearance&width=200&height=200&seq=testimonial-baojia-5&orientation=squarish',
   'seed', true, true, 5),

  ('a0000001-5eed-4001-a001-000000000006', '建宏', '50歲準退休族', 5,
   '開始規劃退休生活，保家佳用很清楚的試算讓我知道需要準備多少退休金。現在對未來更有信心了！',
   'https://readdy.ai/api/search-image?query=Mature%20Asian%20man%20portrait%20smiling%20confidently%2C%20simple%20clean%20background%2C%20professional%20headshot%20photography%20style%2C%20natural%20lighting%2C%20experienced%20professional%20appearance&width=200&height=200&seq=testimonial-baojia-6&orientation=squarish',
   'seed', true, true, 6)
ON CONFLICT (id) DO NOTHING;
