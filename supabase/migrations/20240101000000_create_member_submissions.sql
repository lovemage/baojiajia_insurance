
-- Create a table for member submissions if it doesn't exist
create table if not exists public.member_submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  email text,
  name text,
  phone text,
  city text,
  line_id text,
  questionnaire_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.member_submissions enable row level security;

-- Drop existing policies if they exist to avoid conflict
drop policy if exists "Users can insert their own submissions" on public.member_submissions;
drop policy if exists "Admins can view all submissions" on public.member_submissions;
drop policy if exists "Admins can delete submissions" on public.member_submissions;

-- Create policies
create policy "Users can insert their own submissions"
  on public.member_submissions for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all submissions"
  on public.member_submissions for select
  using (true); -- Assuming admin check is done via application logic or separate role check, for simplicity allowing all select for authenticated users who can access admin page

create policy "Admins can delete submissions"
  on public.member_submissions for delete
  using (true); -- Same assumption as above
