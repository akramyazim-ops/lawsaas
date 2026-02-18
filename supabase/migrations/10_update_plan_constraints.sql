-- Update the plan check constraint on profiles table
alter table profiles drop constraint if exists profiles_plan_check;
alter table profiles add constraint profiles_plan_check check (plan in ('starter', 'growth', 'pro_firm', 'free'));
