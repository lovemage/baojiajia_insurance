import { createClient } from '@supabase/supabase-js';
import { writeFile } from 'node:fs/promises';

const SITE_URL = 'https://baojiajia.tw';

const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing env: VITE_PUBLIC_SUPABASE_URL / VITE_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const escapeXml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const toIsoDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

const buildUrl = (path) => {
  if (!path.startsWith('/')) return `${SITE_URL}/${path}`;
  return `${SITE_URL}${path}`;
};

const makeUrlTag = ({ loc, lastmod, changefreq, priority }) => {
  const parts = [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
  ];

  if (lastmod) parts.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
  if (changefreq) parts.push(`    <changefreq>${escapeXml(changefreq)}</changefreq>`);
  if (priority) parts.push(`    <priority>${escapeXml(priority)}</priority>`);

  parts.push('  </url>');
  return parts.join('\n');
};

const main = async () => {
  const today = new Date().toISOString().slice(0, 10);

  const staticUrls = [
    { loc: buildUrl('/'), lastmod: today, changefreq: 'weekly', priority: '1.0' },
    { loc: buildUrl('/about'), lastmod: today, changefreq: 'monthly', priority: '0.95' },
    { loc: buildUrl('/blog'), lastmod: today, changefreq: 'weekly', priority: '0.90' },
    { loc: buildUrl('/analysis'), lastmod: today, changefreq: 'weekly', priority: '0.85' },
    { loc: buildUrl('/beginner'), lastmod: today, changefreq: 'monthly', priority: '0.80' },
    { loc: buildUrl('/services'), lastmod: today, changefreq: 'monthly', priority: '0.75' },
    { loc: buildUrl('/contact'), lastmod: today, changefreq: 'monthly', priority: '0.60' },
    { loc: buildUrl('/terms'), lastmod: today, changefreq: 'yearly', priority: '0.30' },
    { loc: buildUrl('/privacy'), lastmod: today, changefreq: 'yearly', priority: '0.30' },
  ];

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('slug, updated_at, published_at, is_active')
    .eq('is_active', true)
    .not('slug', 'is', null);

  if (error) {
    console.error('Failed to fetch blog_posts for sitemap:', error);
    process.exit(1);
  }

  const blogUrls = (posts ?? [])
    .map((p) => {
      const slug = (p.slug ?? '').trim();
      if (!slug) return null;

      const lastmod = toIsoDate(p.updated_at) || toIsoDate(p.published_at) || today;
      return {
        loc: buildUrl(`/blog/${slug}`),
        lastmod,
        changefreq: 'monthly',
        priority: '0.70',
      };
    })
    .filter(Boolean);

  const allUrls = [...staticUrls, ...blogUrls];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9',
    '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
    '',
    ...allUrls.map(makeUrlTag),
    '',
    '</urlset>',
    '',
  ].join('\n');

  await writeFile(new URL('../public/sitemap.xml', import.meta.url), xml, 'utf8');
  console.log(`Generated sitemap.xml with ${allUrls.length} URLs (${blogUrls.length} blog posts).`);
};

main().catch((err) => {
  console.error('generate-sitemap failed:', err);
  process.exit(1);
});
