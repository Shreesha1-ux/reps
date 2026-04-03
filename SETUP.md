# Reps - Supabase Setup Guide

This application requires a Supabase project to function. Follow these steps to set it up.

## 1. Create a Supabase Project
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Once created, go to Project Settings -> API.
3. Copy the `Project URL` and `anon public` key.

## 2. Configure Environment Variables
In your AI Studio environment (or local `.env` file), add the following variables:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Database Schema
Go to the SQL Editor in your Supabase dashboard and run the following queries to create the necessary tables and security policies.

```sql
-- Create Habits Table
create table habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text not null check (type in ('proof', 'non-proof')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Logs Table
create table logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  habit_id uuid references habits on delete cascade not null,
  time_spent integer not null,
  image_url text,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create User Stats Table
create table user_stats (
  user_id uuid references auth.users primary key,
  current_streak integer default 0,
  last_log_date date
);

-- Enable Row Level Security (RLS)
alter table habits enable row level security;
alter table logs enable row level security;
alter table user_stats enable row level security;

-- Create Policies
create policy "Users can manage their own habits" on habits for all using (auth.uid() = user_id);
create policy "Users can manage their own logs" on logs for all using (auth.uid() = user_id);
create policy "Users can manage their own stats" on user_stats for all using (auth.uid() = user_id);
```

## 4. Storage Setup
If you want to use "Proof-Based" habits, you need to create a storage bucket for the images.
1. Go to Storage in Supabase.
2. Create a new bucket named `proofs`.
3. Make the bucket **Public**.
4. Add a policy to allow authenticated users to upload files:
   - Allowed operation: INSERT
   - Target roles: authenticated
   - Policy definition: `(bucket_id = 'proofs'::text)`
