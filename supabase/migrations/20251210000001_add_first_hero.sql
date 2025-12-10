-- Add first hero image with empty fields (for custom button in image)
INSERT INTO hero_carousel (
    title, 
    subtitle, 
    description, 
    button1_text, 
    button1_link, 
    button1_bg_color, 
    button1_text_color, 
    button2_text, 
    button2_link, 
    button2_bg_color, 
    button2_text_color, 
    image_url, 
    cloudinary_public_id, 
    overlay_opacity, 
    button_position, 
    display_order, 
    is_active
) VALUES (
    '', -- Empty Title
    '', -- Empty Subtitle
    '', -- Empty Description
    '', -- Empty Button 1 Text (Hidden)
    '#', -- Link placeholder (Hidden if text is empty)
    '#0d9488', 
    '#ffffff', 
    '', -- Empty Button 2 Text (Hidden)
    '', 
    '#ffffff', 
    '#ffffff', 
    '/hero.png', -- The image
    '', 
    0, -- 0 opacity overlay so image is clear? Or user might want some overlay? "nothing will show" implies maybe just the image. I'll set 0.
    'center', 
    0, -- First order
    true
);
