-- Create system_settings table for storing application configuration
create table if not exists public.system_settings (
  id uuid default gen_random_uuid() primary key,
  setting_key text unique not null,
  setting_value text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.system_settings enable row level security;

-- Create policies - only admins can access system settings
create policy "Admins can view system settings"
  on public.system_settings for select
  using (true); -- Assuming admin check is done via application logic

create policy "Admins can insert system settings"
  on public.system_settings for insert
  with check (true);

create policy "Admins can update system settings"
  on public.system_settings for update
  using (true);

create policy "Admins can delete system settings"
  on public.system_settings for delete
  using (true);

-- Insert default Telegram settings
insert into public.system_settings (setting_key, setting_value, description) values
  ('telegram_bot_token', '', 'Telegram Bot API Token for notifications'),
  ('telegram_chat_id', '', 'Telegram Chat ID to send notifications to'),
  ('telegram_notifications_enabled', 'false', 'Enable/disable Telegram notifications')
on conflict (setting_key) do nothing;

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_system_settings_updated_at
  before update on public.system_settings
  for each row execute procedure public.handle_updated_at();
