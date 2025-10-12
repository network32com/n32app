# Network32 Performance Optimization Guide

## Overview

This document outlines performance optimizations implemented in Network32 and best practices for maintaining optimal performance.

## Image Optimization

### Next.js Image Component

All images use the Next.js `Image` component for automatic optimization:

```tsx
import Image from 'next/image'

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  // Or use fill for responsive containers
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority // For above-the-fold images
/>
```

### Benefits

- ✅ Automatic WebP/AVIF conversion
- ✅ Responsive image sizing
- ✅ Lazy loading by default
- ✅ Blur placeholder support
- ✅ Prevents layout shift

### Configuration

In `next.config.ts`:

```typescript
images: {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

### Supabase Storage Optimization

1. **Enable CDN** in Supabase Dashboard
   - Go to Storage > Settings
   - Enable "Use CDN for storage"
   - Configure cache headers

2. **Image Transformation**
   ```typescript
   const imageUrl = `${supabaseUrl}/storage/v1/object/public/case-images/${filename}?width=800&quality=80`
   ```

3. **Compression**
   - Upload images at reasonable quality (80-85%)
   - Use tools like ImageOptim before upload
   - Consider client-side compression

## Code Splitting

### Dynamic Imports

Use dynamic imports for heavy components:

```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Disable SSR if not needed
})
```

### Route-based Code Splitting

Next.js automatically code-splits by route. Each page only loads its required JavaScript.

## Database Query Optimization

### Supabase Best Practices

1. **Select Only Required Fields**
   ```typescript
   // Bad
   const { data } = await supabase.from('cases').select('*')
   
   // Good
   const { data } = await supabase
     .from('cases')
     .select('id, title, before_image_url, created_at')
   ```

2. **Use Pagination**
   ```typescript
   const { data } = await supabase
     .from('cases')
     .select('*')
     .range(0, 19) // First 20 items
     .order('created_at', { ascending: false })
   ```

3. **Leverage Indexes**
   - Ensure frequently queried columns have indexes
   - Use composite indexes for multi-column queries
   - Monitor slow queries in Supabase Dashboard

4. **Use RPC for Complex Queries**
   ```sql
   CREATE OR REPLACE FUNCTION get_feed_items(user_id UUID)
   RETURNS TABLE(...) AS $$
   BEGIN
     -- Complex query logic
   END;
   $$ LANGUAGE plpgsql;
   ```

### Caching Strategy

1. **Server-Side Caching**
   ```typescript
   import { unstable_cache } from 'next/cache'
   
   const getCachedCases = unstable_cache(
     async () => {
       return await getCases()
     },
     ['cases-list'],
     { revalidate: 60 } // Cache for 60 seconds
   )
   ```

2. **Client-Side Caching**
   ```typescript
   // Use SWR or React Query for client-side caching
   import useSWR from 'swr'
   
   const { data, error } = useSWR('/api/cases', fetcher, {
     revalidateOnFocus: false,
     dedupingInterval: 60000,
   })
   ```

## Bundle Size Optimization

### Analyze Bundle

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# Run analysis
ANALYZE=true npm run build
```

### Tree Shaking

Ensure imports are tree-shakeable:

```typescript
// Bad
import _ from 'lodash'

// Good
import debounce from 'lodash/debounce'
```

### Remove Unused Dependencies

```bash
# Find unused dependencies
npx depcheck

# Remove unused packages
npm uninstall package-name
```

## Runtime Performance

### React Performance

1. **Memoization**
   ```typescript
   import { memo, useMemo, useCallback } from 'react'
   
   // Memoize expensive components
   const ExpensiveComponent = memo(({ data }) => {
     return <div>{/* ... */}</div>
   })
   
   // Memoize expensive calculations
   const sortedData = useMemo(() => {
     return data.sort((a, b) => a.value - b.value)
   }, [data])
   
   // Memoize callbacks
   const handleClick = useCallback(() => {
     doSomething(id)
   }, [id])
   ```

2. **Virtualization for Long Lists**
   ```typescript
   import { FixedSizeList } from 'react-window'
   
   <FixedSizeList
     height={600}
     itemCount={items.length}
     itemSize={100}
     width="100%"
   >
     {({ index, style }) => (
       <div style={style}>{items[index]}</div>
     )}
   </FixedSizeList>
   ```

3. **Debounce User Input**
   ```typescript
   import { useDebouncedCallback } from 'use-debounce'
   
   const handleSearch = useDebouncedCallback((value) => {
     performSearch(value)
   }, 300)
   ```

### Loading States

Always show loading states for better perceived performance:

```typescript
{loading ? (
  <Skeleton className="h-20 w-full" />
) : (
  <Content data={data} />
)}
```

## Network Performance

### Reduce API Calls

1. **Batch Requests**
   ```typescript
   // Bad: Multiple sequential requests
   const user = await getUser(id)
   const cases = await getCases(id)
   const followers = await getFollowers(id)
   
   // Good: Parallel requests
   const [user, cases, followers] = await Promise.all([
     getUser(id),
     getCases(id),
     getFollowers(id),
   ])
   ```

2. **Prefetch Data**
   ```typescript
   import { prefetch } from '@/lib/prefetch'
   
   // Prefetch on hover
   <Link
     href="/cases/123"
     onMouseEnter={() => prefetch('/cases/123')}
   >
     View Case
   </Link>
   ```

### Compression

Enable compression in `next.config.ts`:

```typescript
compress: true
```

### HTTP/2 Server Push

Vercel automatically enables HTTP/2 for better performance.

## Monitoring

### Core Web Vitals

Target metrics:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Lighthouse Audit

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://your-domain.com --view
```

Target scores:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### Real User Monitoring

1. **Vercel Analytics**
   - Automatically enabled in Vercel
   - View in Vercel Dashboard

2. **Web Vitals Reporting**
   ```typescript
   // pages/_app.tsx
   export function reportWebVitals(metric) {
     console.log(metric)
     // Send to analytics service
   }
   ```

## Performance Checklist

### Images
- [ ] All images use Next.js Image component
- [ ] Appropriate sizes specified
- [ ] Priority set for above-fold images
- [ ] Lazy loading for below-fold images
- [ ] WebP/AVIF format enabled

### Code
- [ ] Dynamic imports for heavy components
- [ ] Memoization where appropriate
- [ ] No unnecessary re-renders
- [ ] Tree-shaking enabled
- [ ] Bundle size < 200KB (first load)

### Database
- [ ] Queries select only needed fields
- [ ] Pagination implemented
- [ ] Indexes on frequently queried columns
- [ ] Connection pooling configured

### Caching
- [ ] Server-side caching for static data
- [ ] Client-side caching for API calls
- [ ] CDN enabled for assets
- [ ] Browser caching headers set

### Network
- [ ] API calls batched where possible
- [ ] Compression enabled
- [ ] HTTP/2 enabled
- [ ] Prefetching for critical routes

## Optimization Tools

### Development
- Chrome DevTools Performance tab
- React DevTools Profiler
- Next.js Bundle Analyzer
- Lighthouse

### Production
- Vercel Analytics
- Sentry Performance Monitoring
- Google PageSpeed Insights
- WebPageTest

## Common Performance Issues

### Issue: Slow Initial Load

**Causes:**
- Large bundle size
- Unoptimized images
- Blocking JavaScript

**Solutions:**
- Code splitting
- Image optimization
- Defer non-critical JavaScript

### Issue: Slow Navigation

**Causes:**
- No prefetching
- Large page components
- Unnecessary data fetching

**Solutions:**
- Implement prefetching
- Dynamic imports
- Cache API responses

### Issue: Poor Interaction Response

**Causes:**
- Heavy computations on main thread
- Unnecessary re-renders
- Large DOM updates

**Solutions:**
- Use Web Workers for heavy tasks
- Memoize components and values
- Virtualize long lists

## Performance Budget

Set and enforce performance budgets:

```json
{
  "budgets": [
    {
      "path": "/**",
      "timings": [
        {
          "metric": "interactive",
          "budget": 3000
        },
        {
          "metric": "first-contentful-paint",
          "budget": 1500
        }
      ],
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 200
        },
        {
          "resourceType": "total",
          "budget": 500
        }
      ]
    }
  ]
}
```

## Continuous Optimization

1. **Regular Audits**
   - Run Lighthouse monthly
   - Monitor Core Web Vitals
   - Review bundle size

2. **Performance Testing**
   - Test on slow networks (3G)
   - Test on low-end devices
   - Test with throttled CPU

3. **User Feedback**
   - Monitor error rates
   - Track page load times
   - Collect user feedback

## Resources

- [Next.js Performance Docs](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web.dev Performance](https://web.dev/performance/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Supabase Performance](https://supabase.com/docs/guides/platform/performance)
