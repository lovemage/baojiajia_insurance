-- 確保 hero_carousel 表有 overlay_opacity 和 button_position 欄位
ALTER TABLE public.hero_carousel
ADD COLUMN IF NOT EXISTS overlay_opacity integer DEFAULT 90;

ALTER TABLE public.hero_carousel
ADD COLUMN IF NOT EXISTS button_position text DEFAULT 'left';

-- 更新現有記錄的預設值（如果有 NULL 值）
UPDATE public.hero_carousel
SET overlay_opacity = 90
WHERE overlay_opacity IS NULL;

UPDATE public.hero_carousel
SET button_position = 'left'
WHERE button_position IS NULL;
