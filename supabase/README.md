# Supabase Configuration for Network32

## Overview

This directory contains SQL migration files for setting up the Network32 database schema, Row Level Security (RLS) policies, storage buckets, and helper functions.

## Migrations

The migrations are numbered and should be applied in order:

1. **20250101000001_initial_schema.sql** - Creates all database tables, indexes, and triggers
2. **20250101000002_rls_policies.sql** - Sets up Row Level Security policies for data protection
3. **20250101000003_storage_buckets.sql** - Configures storage buckets for images and files
4. **20250101000004_helper_functions.sql** - Adds helper functions for common operations

## Setup Instructions

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste each migration file in order
4. Execute each migration

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

## Database Schema

### Core Tables

- **users** - User profiles (dentists and clinic owners)
- **clinics** - Clinic information
- **cases** - Clinical case showcases with before/after images
- **follows** - User following relationships
- **clinic_affiliations** - Relationships between users and clinics
- **reports** - Content moderation reports
- **case_saves** - User bookmarks for cases

### Storage Buckets

- **profile-photos** - User profile pictures (5MB limit)
- **clinic-logos** - Clinic logo images (5MB limit)
- **case-images** - Clinical case before/after images (10MB limit)

## Row Level Security (RLS)

All tables have RLS enabled with the following general principles:

- **Public Read**: Most content is publicly viewable
- **Authenticated Write**: Only authenticated users can create content
- **Owner Control**: Users can only modify/delete their own content
- **Role-Based Access**: Certain actions restricted by user role (e.g., clinic creation)

## Helper Functions

The database includes several helper functions:

- `increment_case_views(case_id)` - Increment view count for a case
- `get_follower_count(user_id)` - Get follower count for a user
- `get_following_count(user_id)` - Get following count for a user
- `is_following(follower_id, following_id)` - Check if user is following another
- `get_user_case_count(user_id)` - Get case count for a user
- `has_saved_case(user_id, case_id)` - Check if user has saved a case
- `search_users(search_query)` - Full-text search for users
- `search_cases(search_query)` - Full-text search for cases
- `get_user_feed(user_id, limit, offset)` - Get personalized feed for user

## Environment Variables

Make sure to set these environment variables in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Security Notes

1. **Patient Consent**: The `cases` table has a constraint requiring `patient_consent_given = TRUE`
2. **No Self-Following**: Users cannot follow themselves
3. **Storage Policies**: Files are organized by user ID in folders for proper access control
4. **Service Role**: Admin operations (like report moderation) should use the service role key

## Testing

After applying migrations, verify:

1. All tables are created successfully
2. RLS policies are active (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
3. Storage buckets are created and accessible
4. Helper functions execute without errors

## Troubleshooting

If you encounter issues:

1. Check that all extensions are enabled (`uuid-ossp`, `pgcrypto`)
2. Verify RLS is enabled on all tables
3. Ensure storage buckets are created before applying storage policies
4. Check Supabase logs for detailed error messages
