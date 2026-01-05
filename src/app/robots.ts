import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/dashboard/', '/profile/', '/onboarding/', '/settings/'],
        },
        sitemap: 'https://network32.com/sitemap.xml',
    };
}
