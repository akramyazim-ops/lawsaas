-- Create a table for user profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  plan text check (plan in ('free', 'pro', 'enterprise')) default 'free',
  subscription_status text check (subscription_status in ('active', 'past_due', 'canceled', 'incomplete')) default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, plan)
  values (new.id, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'plan', 'free'));
  return new;
end;
$$ language plpgsql security modeller;

-- Trigger to call the function on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
