import { getStore } from '@netlify/blobs';

const headers = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store, max-age=0',
};

// Store ONLY a country code. This counts countries represented, not unique people or visits.
export default async (request, context) => {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {status: 405, headers});
  }

  try {
    const store = getStore('visitor-countries');
    if (request.method === 'POST') {
      const code = String(context.geo?.country?.code ?? '').toUpperCase();
      if (/^[A-Z]{2}$/.test(code)) {
        // Idempotent write: simultaneous visits from the same country never lose a counter,
        // because there is intentionally no numeric counter to increment.
        await store.set(`country/${code}`, '1');
      }
    }
    const { blobs } = await store.list({ prefix: 'country/' });
    const countries = [...new Set(blobs.map(b => b.key.slice(8)).filter(c => /^[A-Z]{2}$/.test(c)))].sort();
    return new Response(JSON.stringify({ countries }), { status: 200, headers });
  } catch (error) {
    console.error('Visitor country store error:', error);
    return new Response(JSON.stringify({ error: 'Visitor map is not available yet' }), { status: 503, headers });
  }
};
