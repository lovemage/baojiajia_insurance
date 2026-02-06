insert into public.system_settings (setting_key, setting_value, description) values
  ('reviews_submission_enabled', 'true', 'Enable/disable customer review submissions (login required)')
on conflict (setting_key) do nothing;
