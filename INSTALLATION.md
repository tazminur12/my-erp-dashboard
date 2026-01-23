# Installation Guide

## Required Packages

Install the following packages for Supabase and authentication:

```bash
npm install @supabase/supabase-js
```

Or if using yarn:

```bash
yarn add @supabase/supabase-js
```

## Environment Variables

The `.env.local` file has been configured with:
- NextAuth configuration
- Supabase URL and keys
- Database connection string

## Database Setup

Make sure you have a `users` table in your Supabase database with the following structure:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Next Steps

1. Run `npm install` to install dependencies
2. Make sure your Supabase project is set up
3. Create the users table in Supabase
4. Start the development server: `npm run dev`
