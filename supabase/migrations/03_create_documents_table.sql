-- Create Documents Table
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  file_path text not null,
  file_type text,
  size_bytes bigint,
  case_id uuid references cases(id) on delete cascade,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table documents enable row level security;

-- Create Policy: Allow all authenticated users to manage documents (for MVP)
create policy "Enable read access for authenticated users" on documents
  for select using (auth.role() = 'authenticated');

create policy "Enable insert access for authenticated users" on documents
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update access for authenticated users" on documents
  for update using (auth.role() = 'authenticated');

create policy "Enable delete access for authenticated users" on documents
  for delete using (auth.role() = 'authenticated');

-- Create storage bucket for documents
insert into storage.buckets (id, name, public)
values ('case-documents', 'case-documents', false);

-- Storage policies for case-documents bucket
create policy "Authenticated users can upload documents"
on storage.objects for insert
to authenticated
with check (bucket_id = 'case-documents');

create policy "Authenticated users can view documents"
on storage.objects for select
to authenticated
using (bucket_id = 'case-documents');

create policy "Authenticated users can delete documents"
on storage.objects for delete
to authenticated
using (bucket_id = 'case-documents');
