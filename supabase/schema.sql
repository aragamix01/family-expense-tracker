-- Family Expense Tracker — Supabase Schema
-- Run this in Supabase SQL Editor once to set up the database.

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Members
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  line_user_id text unique,
  created_at timestamptz not null default now()
);

-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- Seed default categories
insert into categories (name, is_default) values
  ('Groceries', true),
  ('Dining', true),
  ('Utilities', true),
  ('Transport', true),
  ('Other', true);

-- Periods (billing cycles)
create table if not exists periods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Seed initial open period (current month)
insert into periods (name, status)
values (to_char(now(), 'Month YYYY'), 'open');

-- Expenses
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references periods(id) on delete cascade,
  description text not null,
  amount numeric(12, 2) not null check (amount > 0),
  category_id uuid not null references categories(id),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- Expense splits (who owes how much per expense)
create table if not exists expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  unique (expense_id, member_id)
);

-- Indexes for common queries
create index if not exists idx_expenses_period_id on expenses(period_id);
create index if not exists idx_expenses_date on expenses(date desc);
create index if not exists idx_expense_splits_expense_id on expense_splits(expense_id);
create index if not exists idx_expense_splits_member_id on expense_splits(member_id);
create index if not exists idx_members_line_user_id on members(line_user_id);

-- Row Level Security (open for now — secured via service role key in API routes)
alter table members enable row level security;
alter table categories enable row level security;
alter table periods enable row level security;
alter table expenses enable row level security;
alter table expense_splits enable row level security;

-- Allow all operations via service role (used in API routes with service role key)
create policy "service_role_all" on members for all using (true);
create policy "service_role_all" on categories for all using (true);
create policy "service_role_all" on periods for all using (true);
create policy "service_role_all" on expenses for all using (true);
create policy "service_role_all" on expense_splits for all using (true);
