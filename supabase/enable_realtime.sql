-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Enable full row data on inserts/updates/deletes (required for postgres_changes)
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE deals    REPLICA IDENTITY FULL;

-- 2. Add tables to the Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE deals;

-- 3. Verify (should show messages and deals in the list)
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
