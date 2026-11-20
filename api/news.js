export const config = { runtime: 'edge' };

const CDATA_RE = /<!\[CDATA\[([\s\S]*?)\]\]>/g;
const ITEM_RE = /<item>([\s\S]*?)<\/item>/g;

function tag(xml, name) {
  const re = new RegExp('<' + name + '[^>]*>([\\s\\S]*?)<\\/' + name + '>');
  const m = re.exec(xml);
  if (!m) return '';
  return m[1].replace(CDATA_RE, '$1').trim();
}

export default async function handler(req) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const hl = url.searchParams.get('hl') || 'en-BD';
  const gl = url.searchParams.get('gl') || 'BD';
  const ceid = url.searchParams.get('ceid') || 'BD:en';

  if (!q) {
    return new Response(JSON.stringify({ error: 'missing q' }), {
      status: 400,
      headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
    });
  }

  const rssUrl = 'https://news.google.com/rss/search?q=' + encodeURIComponent(q) +
                 '&hl=' + encodeURIComponent(hl) + '&gl=' + encodeURIComponent(gl) +
                 '&ceid=' + encodeURIComponent(ceid);

  try {
    const res = await fetch(rssUrl, {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; AdmissionTracker/1.0)',
        'accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    if (!res.ok) throw new Error('rss fetch failed: ' + res.status);
    const xml = await res.text();

    const items = [];
    let m;
    while ((m = ITEM_RE.exec(xml)) !== null) {
      const inner = m[1];
      items.push({
        title: tag(inner, 'title'),
        link: tag(inner, 'link'),
        pubDate: tag(inner, 'pubDate'),
        source: tag(inner, 'source'),
        description: tag(inner, 'description'),
      });
    }

    return new Response(JSON.stringify({ items, fetchedAt: Date.now(), q }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 's-maxage=600, stale-while-revalidate=1800',
        'access-control-allow-origin': '*',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e && e.message) || e) }), {
      status: 502,
      headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
    });
  }
}
