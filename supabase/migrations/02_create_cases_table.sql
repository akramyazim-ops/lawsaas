-- Create Cases Table
create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text check (status in ('open', 'closed', 'pending')) default 'open',
  client_id uuid references clients(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table cases enable row level security;

-- Create Policy: Allow all authenticated users to view cases (for MVP)
create policy "Enable read access for authenticated users" on cases
  for select using (auth.role() = 'authenticated');

create policy "Enable insert access for authenticated users" on cases
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update access for authenticated users" on cases
  for update using (auth.role() = 'authenticated');

create policy "Enable delete access for authenticated users" on cases
  for delete using (auth.role() = 'authenticated');
