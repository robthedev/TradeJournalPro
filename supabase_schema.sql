-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Trades Table
create table public.trades (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    date date not null,
    time time without time zone not null,
    symbol text not null,
    model text not null,
    result text check (result in ('WIN', 'LOSS', 'BE')) not null,
    entry_price numeric,
    exit_price numeric,
    r_multiple numeric not null,
    mfe numeric, -- Max Favorable Excursion (in R)
    mae numeric, -- Max Adverse Excursion (in R)
    notes text,
    conditions jsonb default '{}'::jsonb -- Stores boolean flags e.g., {"gap_up": true, "news": false}
);

-- Indexes for Analytics Performance
create index idx_trades_date on public.trades(date);
create index idx_trades_model on public.trades(model);
create index idx_trades_symbol on public.trades(symbol);

-- Row Level Security (Optional: useful if you add auth later, currently public for single user simplicity)
alter table public.trades enable row level security;

-- Allow all access for anon (simplest for personal local tool)
-- Ideally, you'd use authenticated users, but for this constraint we enable anon access
create policy "Enable access to all users" on public.trades for all using (true) with check (true);
