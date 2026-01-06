import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pulse.com'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/dashboard/',
                    '/profile/',
                    '/_next/',
                    '/payments/checkout-demo/',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/dashboard/',
                    '/profile/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
