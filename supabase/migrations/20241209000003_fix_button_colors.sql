-- 修復按鈕 2 背景色格式
-- 將 rgba(255, 255, 255, 0.1) 改為 #ffffff
-- 並添加透明度支持

-- 更新現有記錄
UPDATE public.hero_carousel
SET button2_bg_color = '#ffffff'
WHERE button2_bg_color = 'rgba(255, 255, 255, 0.1)' OR button2_bg_color IS NULL;

-- 確保所有按鈕顏色都有預設值
UPDATE public.hero_carousel
SET 
  button1_bg_color = COALESCE(button1_bg_color, '#0d9488'),
  button1_text_color = COALESCE(button1_text_color, '#ffffff'),
  button2_bg_color = COALESCE(button2_bg_color, '#ffffff'),
  button2_text_color = COALESCE(button2_text_color, '#ffffff')
WHERE button1_bg_color IS NULL OR button1_text_color IS NULL OR button2_bg_color IS NULL OR button2_text_color IS NULL;

