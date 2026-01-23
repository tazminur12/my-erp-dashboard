# Database Migration Instructions

## Create Hajis Table

The `hajis` table needs to be created in your Supabase database. Follow these steps:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire content from `supabase/migrations/003_create_hajis_table.sql`
5. Paste it into the SQL Editor
6. Click **Run** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
7. Wait for the migration to complete

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Make sure you're logged in
supabase login

# Link your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Run the migration
supabase db push
```

### Verify the Migration

After running the migration, verify the table was created:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see the `hajis` table
3. Check that it has all the columns including `customer_id`

### Important Notes

- The migration includes:
  - Auto-generation of `customer_id` in format `HAJ-0001`, `HAJ-0002`, etc.
  - Row Level Security (RLS) policies
  - Indexes for performance
  - Triggers for auto-updating timestamps

- If you get any errors, check:
  - You have the correct permissions
  - The `users` table exists (required for foreign key reference)
  - No conflicting table names

### Troubleshooting

If you see "relation already exists" error:
- The table might already exist
- Check the Table Editor to confirm
- You can drop and recreate if needed (be careful with production data!)

If you see permission errors:
- Make sure you're using the correct database credentials
- Check that your user has CREATE TABLE permissions
