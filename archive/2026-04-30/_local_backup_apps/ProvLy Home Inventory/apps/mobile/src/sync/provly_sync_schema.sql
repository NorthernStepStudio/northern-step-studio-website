-- Create the sync table
create table provly_sync_items (
    user_id uuid references auth.users not null,
    record_id text not null,
    record_type text not null,
    -- 'item' | 'room' | 'media'
    ciphertext text not null,
    -- encrypted json blob
    device_id text,
    version int default 1,
    updated_at timestamptz default now(),
    deleted_at timestamptz,
    primary key (user_id, record_id)
);
-- Enable RLS
alter table provly_sync_items enable row level security;
-- Policies
create policy "Users can see their own sync items" on provly_sync_items for
select using (auth.uid() = user_id);
create policy "Users can insert/update their own sync items" on provly_sync_items for
insert with check (auth.uid() = user_id);
create policy "Users can update their own sync items" on provly_sync_items for
update using (auth.uid() = user_id);
create policy "Users can delete their own sync items" on provly_sync_items for delete using (auth.uid() = user_id);