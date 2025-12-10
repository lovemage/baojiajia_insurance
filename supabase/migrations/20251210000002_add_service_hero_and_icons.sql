-- Add hero_image_url to service_details
ALTER TABLE IF EXISTS public.service_details 
ADD COLUMN IF NOT EXISTS hero_image_url text;

-- Insert default icon settings
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES 
('analysis_adult_icon', '', '分析頁面-成人圖示URL'),
('analysis_child_icon', '', '分析頁面-幼兒圖示URL')
ON CONFLICT (setting_key) DO NOTHING;
