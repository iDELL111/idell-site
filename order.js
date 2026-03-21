export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.SMM_API_KEY || '6ac7dfb8ed6be450d4a61b14ca1eb494';
  const API_URL = 'https://smmadx.com/api/v2';

  try {
    const body = req.body;

    // Strict validation
    if (!body || !body.action) {
      return res.status(400).json({ error: 'Action required' });
    }

    const params = new URLSearchParams();
    params.append('key', API_KEY);
    params.append('action', body.action);

    if (body.action === 'add') {
      if (!body.service || !body.link || !body.quantity) {
        return res.status(400).json({ error: 'Service, link, quantity required' });
      }
      if (!body.link.startsWith('http')) {
        return res.status(400).json({ error: 'Invalid link format' });
      }
      if (body.quantity < 100) {
        return res.status(400).json({ error: 'Minimum quantity is 100' });
      }
      params.append('service', body.service);
      params.append('link', body.link);
      params.append('quantity', body.quantity);
    }

    if (body.action === 'status') {
      if (!body.order) return res.status(400).json({ error: 'Order ID required' });
      params.append('order', body.order);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: controller.signal,
      body: params.toString()
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'SMM API error' });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'SMM API timeout' });
    }
    return res.status(500).json({ error: err.message });
  }
}
