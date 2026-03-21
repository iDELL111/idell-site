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
    const params = new URLSearchParams();
    params.append('key', API_KEY);
    params.append('action', body.action);
    if (body.action === 'add') {
      params.append('service', body.service);
      params.append('link', body.link);
      params.append('quantity', body.quantity);
    }
    if (body.action === 'status') params.append('order', body.order);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
