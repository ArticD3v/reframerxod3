-- Create users table
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  status text check (status in ('pending', 'active', 'banned')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.users enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Admins can view all profiles" on public.users;
drop policy if exists "Admins can update all profiles" on public.users;

-- Create policies
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.users for select
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.email = 'admin@zorvexra.com'
    )
  );

create policy "Admins can update all profiles"
  on public.users for update
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.email = 'admin@zorvexra.com'
    )
  );

create policy "Allow insert for authenticated users"
  on public.users for insert
  with check (auth.uid() = id);

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, status, created_at)
  values (
    new.id,
    new.email,
    case 
      when new.email = 'admin@zorvexra.com' then 'active'
      else 'pending'
    end,
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger to automatically create user profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.users to anon, authenticated;
