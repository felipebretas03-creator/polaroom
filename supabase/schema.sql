-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create users table (optional if you just use auth.users, but good for custom profile data)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create orders table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending_payment', -- 'pending_payment', 'paid'
  kacto_transaction_id text,
  size text not null, -- 'grande', 'mini'
  images jsonb not null, -- Array de objetos com { url, text, templateId, cropData }
  font_family text,
  text_color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.orders enable row level security;

-- Create policies for profiles
create policy "Users can view own profile" 
  on profiles for select 
  using ( auth.uid() = id );

create policy "Users can insert own profile" 
  on profiles for insert 
  with check ( auth.uid() = id );

create policy "Users can update own profile" 
  on profiles for update 
  using ( auth.uid() = id );

-- Create policies for orders
create policy "Users can view own orders" 
  on orders for select 
  using ( auth.uid() = user_id );

create policy "Users can insert own orders" 
  on orders for insert 
  with check ( auth.uid() = user_id );

-- Create trigger to automatically create profile on signup
create or function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
