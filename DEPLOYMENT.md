# Network32 Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Supabase account
- Vercel account (recommended for deployment)
- Git repository

## Environment Setup

### 1. Supabase Configuration

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Navigate to Project Settings > API
3. Copy your project URL and anon key
4. Copy your service role key (keep this secret!)

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional: Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

### 3. Database Migrations

Run all migrations in order:

```bash
# Connect to your Supabase project
npx supabase link --project-ref your-project-ref

# Run migrations
npx supabase db push

# Or manually run each migration in the Supabase SQL Editor:
# 1. supabase/migrations/20250101000001_initial_schema.sql
# 2. supabase/migrations/20250101000002_rls_policies.sql
# 3. supabase/migrations/20250112000002_create_forum_tables.sql
```

## Local Development

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Access the app at `http://localhost:3000`

### Database Setup

1. Run migrations (see above)
2. Create test users through the signup flow
3. Seed data (optional):
   - Create sample users
   - Add sample clinical cases
   - Create forum threads

## Deployment to Vercel

### Automatic Deployment (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - Add all variables from `.env.local`
   - Ensure `NEXT_PUBLIC_APP_URL` points to your Vercel domain
6. Click "Deploy"

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Environment Variables in Vercel

Add these in Project Settings > Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SENTRY_DSN` (optional)
- `SENTRY_AUTH_TOKEN` (optional)

## Supabase Configuration

### Storage Buckets

Create the following storage buckets in Supabase:

1. **case-images** (Public)
   - For clinical case before/after images
   - Enable public access
   - Set max file size: 10MB

2. **profile-photos** (Public)
   - For user profile photos
   - Enable public access
   - Set max file size: 5MB

3. **clinic-logos** (Public)
   - For clinic logos
   - Enable public access
   - Set max file size: 2MB

### Storage Policies

```sql
-- Allow authenticated users to upload to case-images
CREATE POLICY "Users can upload case images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'case-images');

-- Allow public read access
CREATE POLICY "Public can view case images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'case-images');

-- Similar policies for profile-photos and clinic-logos
```

### Email Templates

Configure email templates in Supabase Dashboard > Authentication > Email Templates:

1. **Confirm Signup**
2. **Reset Password**
3. **Magic Link**

Update templates with your branding and domain.

## Performance Optimization

### Image Optimization

- All images use Next.js Image component
- Automatic WebP conversion
- Responsive image sizing
- Lazy loading enabled

### Caching

Configure in `next.config.js`:

```javascript
module.exports = {
  images: {
    domains: ['your-project.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  // Enable SWC minification
  swcMinify: true,
}
```

### Supabase CDN

Enable CDN in Supabase Project Settings:
- Go to Storage > Settings
- Enable "Use CDN for storage"
- Configure cache headers

## Monitoring & Error Tracking

### Sentry Setup (Optional)

1. Create account at [sentry.io](https://sentry.io)
2. Create new Next.js project
3. Add DSN to environment variables
4. Install Sentry:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

5. Configure `sentry.client.config.js` and `sentry.server.config.js`

### Vercel Analytics

Enable in Vercel Dashboard:
- Project Settings > Analytics
- Enable Web Analytics
- Enable Speed Insights

## Security Checklist

- [ ] All environment variables are set correctly
- [ ] Service role key is never exposed to client
- [ ] RLS policies are enabled on all tables
- [ ] Storage policies are configured
- [ ] CORS is configured for your domain
- [ ] Rate limiting is enabled (Supabase)
- [ ] SSL/HTTPS is enabled (automatic with Vercel)

## Post-Deployment Verification

1. **Authentication**
   - [ ] Sign up works
   - [ ] Login works
   - [ ] Password reset works
   - [ ] Email verification works

2. **Core Features**
   - [ ] Create clinical case
   - [ ] Upload images
   - [ ] Create forum thread
   - [ ] Follow users
   - [ ] Save cases
   - [ ] Report content

3. **Performance**
   - [ ] Page load < 3s
   - [ ] Images load progressively
   - [ ] No console errors
   - [ ] Mobile responsive

## Troubleshooting

### Common Issues

**Issue: "Invalid API key"**
- Solution: Check environment variables are set correctly
- Verify Supabase URL and keys match your project

**Issue: "Storage bucket not found"**
- Solution: Create required storage buckets in Supabase
- Verify bucket names match code

**Issue: "RLS policy violation"**
- Solution: Check RLS policies are applied
- Verify user authentication state

**Issue: Images not loading**
- Solution: Add Supabase domain to `next.config.js`
- Check storage bucket permissions

## Rollback Procedure

If deployment fails:

```bash
# Revert to previous deployment in Vercel
vercel rollback

# Or redeploy previous commit
git revert HEAD
git push origin main
```

## Maintenance

### Database Backups

Supabase automatically backs up your database daily. To create manual backup:

1. Go to Supabase Dashboard
2. Database > Backups
3. Click "Create Backup"

### Monitoring

Check these regularly:
- Vercel deployment logs
- Supabase logs (Database, Auth, Storage)
- Sentry error reports
- User feedback

## Support

For issues:
1. Check logs in Vercel and Supabase
2. Review error messages in Sentry
3. Check GitHub issues
4. Contact development team

## Version History

- v1.0.0 - Initial MVP release
- Features: Auth, Cases, Forum, Feed, Clinics, Profiles
