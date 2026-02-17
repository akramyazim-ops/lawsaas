-- Add due_date to cases table
alter table cases add column if not exists due_date date;
