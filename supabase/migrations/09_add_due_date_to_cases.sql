-- Add due_date column to cases table if it doesn't exist
alter table cases add column if not exists due_date date;
