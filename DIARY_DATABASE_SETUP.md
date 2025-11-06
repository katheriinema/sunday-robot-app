# Diary Entries Database Setup

The diary entries feature now saves to Supabase. Your existing `diary_entries` table uses `child_id` to link to the `children` table.

## SQL Script - Add Title Column

Just run this simple SQL to add the `title` column to your existing table:

```sql
-- Add title column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'title'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN title TEXT;
  END IF;
END $$;
```

That's it! This will add the `title` column to your existing `diary_entries` table so kids can add custom titles to their diary entries.

## Notes

- The `title` column is optional - entries can have a title or just use the date
- The app will display entries as "Date - Title" if a title exists, or just "Date" if no title is provided
- The app still saves to localStorage as a backup, but Supabase is the primary storage
