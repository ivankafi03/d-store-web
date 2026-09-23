export default function robots() {
  const baseUrl = 'https://dstore.sbs';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/store', '/reseller'],
        disallow: ['/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
