-- Create Invoices Table
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique not null,
  client_id uuid references clients(id) on delete set null,
  case_id uuid references cases(id) on delete set null,
  issue_date date not null default current_date,
  due_date date not null,
  status text check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')) default 'draft',
  subtotal decimal(10, 2) not null default 0,
  tax_rate decimal(5, 2) default 0,
  tax_amount decimal(10, 2) default 0,
  total decimal(10, 2) not null default 0,
  notes text,
  logo_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create Invoice Items Table
create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  description text not null,
  quantity decimal(10, 2) not null default 1,
  unit_price decimal(10, 2) not null,
  amount decimal(10, 2) not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table invoices enable row level security;
alter table invoice_items enable row level security;

-- Invoices Policies
create policy "Enable read access for authenticated users" on invoices
  for select using (auth.role() = 'authenticated');

create policy "Enable insert access for authenticated users" on invoices
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update access for authenticated users" on invoices
  for update using (auth.role() = 'authenticated');

create policy "Enable delete access for authenticated users" on invoices
  for delete using (auth.role() = 'authenticated');

-- Invoice Items Policies
create policy "Enable read access for authenticated users" on invoice_items
  for select using (auth.role() = 'authenticated');

create policy "Enable insert access for authenticated users" on invoice_items
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update access for authenticated users" on invoice_items
  for update using (auth.role() = 'authenticated');

create policy "Enable delete access for authenticated users" on invoice_items
  for delete using (auth.role() = 'authenticated');

-- Function to generate invoice number
create or replace function generate_invoice_number()
returns text as $$
declare
  next_number integer;
  invoice_num text;
begin
  select coalesce(max(substring(invoice_number from 5)::integer), 0) + 1
  into next_number
  from invoices
  where invoice_number like 'INV-%';
  
  invoice_num := 'INV-' || lpad(next_number::text, 5, '0');
  return invoice_num;
end;
$$ language plpgsql;
