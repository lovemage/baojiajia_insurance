-- Fix first hero image link to point to analysis page
UPDATE hero_carousel
SET 
    button1_link = '/analysis',
    button1_text = '', -- Ensure text is empty so it triggers the full-image link
    updated_at = NOW()
WHERE 
    image_url = '/hero.png' 
    AND display_order = 0;
