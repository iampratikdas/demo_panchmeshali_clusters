import { SitemapStream, streamToPromise }  from 'sitemap';
import { createWriteStream }  from 'fs';

// Your site URL
const siteUrl = 'https://admin.panchmeshali.com/';

// Add all static routes here
const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/submit', changefreq: 'monthly', priority: 0.7 },
  { url: '/status', changefreq: 'monthly', priority: 0.7 },
  { url: '/profile', changefreq: 'weekly', priority: 0.8 },
];

const stream = new SitemapStream({ hostname: siteUrl });

streamToPromise(stream).then((data) =>
  console.log('Sitemap generated successfully!')
);

stream.pipe(createWriteStream('./public/sitemap.xml'));

// Write each link to the stream
links.forEach(link => stream.write(link));

// End the stream
stream.end();
