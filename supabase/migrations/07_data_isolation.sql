-- Add user_id column to tables that lack it
alter table clients add column if not exists user_id uuid references auth.users(id) default auth.uid();
alter table cases add column if not exists user_id uuid references auth.users(id) default auth.uid();
alter table invoices add column if not exists user_id uuid references auth.users(id) default auth.uid();
alter table invoice_items add column if not exists user_id uuid references auth.users(id) default auth.uid();

-- Update existing records to match the current user (if any exist during migration)
-- This is a fallback for data already in the DB
update clients set user_id = auth.uid() where user_id is null;
update cases set user_id = auth.uid() where user_id is null;
update invoices set user_id = auth.uid() where user_id is null;
update invoice_items set user_id = auth.uid() where user_id is null;

-- ACTUALLY ENABLE RLS (Crucial step that was missing)
alter table clients enable row level security;
alter table cases enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table documents enable row level security;

-- Fix Row Level Security Policies for CLIENTS
drop policy if exists "Enable read access for authenticated users" on clients;
drop policy if exists "Enable insert access for authenticated users" on clients;
drop policy if exists "Enable update access for authenticated users" on clients;
drop policy if exists "Enable delete access for authenticated users" on clients;

create policy "Users can only view their own clients" on clients
  for select using (auth.uid() = user_id);
create policy "Users can only insert their own clients" on clients
  for insert with check (auth.uid() = user_id);
create policy "Users can only update their own clients" on clients
  for update using (auth.uid() = user_id);
create policy "Users can only delete their own clients" on clients
  for delete using (auth.uid() = user_id);

-- Fix Row Level Security Policies for CASES
drop policy if exists "Enable read access for authenticated users" on cases;
drop policy if exists "Enable insert access for authenticated users" on cases;
drop policy if exists "Enable update access for authenticated users" on cases;
drop policy if exists "Enable delete access for authenticated users" on cases;

create policy "Users can only view their own cases" on cases
  for select using (auth.uid() = user_id);
create policy "Users can only insert their own cases" on cases
  for insert with check (auth.uid() = user_id);
create policy "Users can only update their own cases" on cases
  for update using (auth.uid() = user_id);
create policy "Users can only delete their own cases" on cases
  for delete using (auth.uid() = user_id);

-- Fix Row Level Security Policies for INVOICES
drop policy if exists "Enable read access for authenticated users" on invoices;
drop policy if exists "Enable insert access for authenticated users" on invoices;
drop policy if exists "Enable update access for authenticated users" on invoices;
drop policy if exists "Enable delete access for authenticated users" on invoices;

create policy "Users can only view their own invoices" on invoices
  for select using (auth.uid() = user_id);
create policy "Users can only insert their own invoices" on invoices
  for insert with check (auth.uid() = user_id);
create policy "Users can only update their own invoices" on invoices
  for update using (auth.uid() = user_id);
create policy "Users can only delete their own invoices" on invoices
  for delete using (auth.uid() = user_id);

-- Fix Row Level Security Policies for INVOICE_ITEMS
drop policy if exists "Enable read access for authenticated users" on invoice_items;
drop policy if exists "Enable insert access for authenticated users" on invoice_items;
drop policy if exists "Enable update access for authenticated users" on invoice_items;
drop policy if exists "Enable delete access for authenticated users" on invoice_items;

create policy "Users can only view their own invoice items" on invoice_items
  for select using (auth.uid() = user_id);
create policy "Users can only insert their own invoice items" on invoice_items
  for insert with check (auth.uid() = user_id);
create policy "Users can only update their own invoice items" on invoice_items
  for update using (auth.uid() = user_id);
create policy "Users can only delete their own invoice items" on invoice_items
  for delete using (auth.uid() = user_id);

-- Fix Row Level Security Policies for DOCUMENTS
drop policy if exists "Enable read access for authenticated users" on documents;
drop policy if exists "Enable insert access for authenticated users" on documents;
drop policy if exists "Enable update access for authenticated users" on documents;
drop policy if exists "Enable delete access for authenticated users" on documents;

create policy "Users can only view their own documents" on documents
  for select using (auth.uid() = uploaded_by);
create policy "Users can only insert their own documents" on documents
  for insert with check (auth.uid() = uploaded_by);
create policy "Users can only update their own documents" on documents
  for update using (auth.uid() = uploaded_by);
create policy "Users can only delete their own documents" on documents
  for delete using (auth.uid() = uploaded_by);

-- Fix Storage Policies (Storage Policies check bucket and owner)
-- The current policies allow all authenticated users to see the whole bucket.
-- We should restrict it so users only see objects with their UID in the path.

drop policy if exists "Authenticated users can upload documents" on storage.objects;
drop policy if exists "Authenticated users can view documents" on storage.objects;
drop policy if exists "Authenticated users can delete documents" on storage.objects;

create policy "Users can only upload to their own folder"
on storage.objects for insert
to authenticated
with check (bucket_id = 'case-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can only view their own folder"
on storage.objects for select
to authenticated
using (bucket_id = 'case-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can only delete their own folder"
on storage.objects for delete
to authenticated
using (bucket_id = 'case-documents' and (storage.foldername(name))[1] = auth.uid()::text);
