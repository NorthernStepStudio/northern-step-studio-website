-- Create maintenance_tasks table
CREATE TABLE IF NOT EXISTS maintenance_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    frequency_days INTEGER,
    -- Nullable. If Set, task repeats every N days
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
-- Enable RLS
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
-- Policies
CREATE POLICY "Users can view their own maintenance tasks" ON maintenance_tasks FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own maintenance tasks" ON maintenance_tasks FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own maintenance tasks" ON maintenance_tasks FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own maintenance tasks" ON maintenance_tasks FOR DELETE USING (auth.uid() = user_id);
-- Trigger for updated_at
CREATE TRIGGER update_maintenance_tasks_modtime BEFORE
UPDATE ON maintenance_tasks FOR EACH ROW EXECUTE PROCEDURE update_modified_column();