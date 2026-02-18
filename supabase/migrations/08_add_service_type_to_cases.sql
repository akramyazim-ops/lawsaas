-- Add service_type column to cases table
alter table cases add column if not exists service_type text;
