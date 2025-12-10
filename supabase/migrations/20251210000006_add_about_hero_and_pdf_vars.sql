-- Add hero_image to about_content
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'about_content' and column_name = 'hero_image') then
    alter table public.about_content add column hero_image text;
  end if;
end $$;

-- Add custom_variables to pdf_templates
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'pdf_templates' and column_name = 'custom_variables') then
    alter table public.pdf_templates add column custom_variables jsonb default '{}'::jsonb;
  end if;
end $$;
