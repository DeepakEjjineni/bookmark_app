
-- 1. Create the bookmarks table
create table if not exists bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text not null,
  created_at timestamptz default now() not null
);

-- 2. Enable Row Level Security so users only see their own bookmarks
alter table bookmarks enable row level security;

-- 3. RLS policies
create policy "Users can view their own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

-- Users can only insert bookmarks for themselves
create policy "Users can insert their own bookmarks"
  on bookmarks for insert
  with check (auth.uid() = user_id);

-- Users can only delete their own bookmarks
create policy "Users can delete their own bookmarks"
  on bookmarks for delete
  using (auth.uid() = user_id);


alter publication supabase_realtime add table bookmarks;
