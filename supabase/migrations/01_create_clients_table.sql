-- Create Clients Table
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table clients enable row level security;

-- Create Policy: Allow all authenticated users to view clients (for MVP)
-- In a real app, you'd restrict this to users belonging to the same firm/organization
create policy "Enable read access for authenticated users" on clients
  for select using (auth.role() = 'authenticated');

create policy "Enable insert access for authenticated users" on clients
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update access for authenticated users" on clients
  for update using (auth.role() = 'authenticated');

create policy "Enable delete access for authenticated users" on clients
  for delete using (auth.role() = 'authenticated');
