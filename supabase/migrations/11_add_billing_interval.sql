-- Add billing_interval to profiles
alter table profiles add column if not exists billing_interval text check (billing_interval in ('month', 'year')) default 'month';

-- Update the handle_new_user function to include billing_interval
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, plan, billing_interval)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    coalesce(new.raw_user_meta_data->>'plan', 'free'),
    coalesce(new.raw_user_meta_data->>'billing_interval', 'month')
  );
  return new;
end;
$$ language plpgsql security definer;
