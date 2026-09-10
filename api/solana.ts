export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.HELIUS_API_KEY;
  const endpoint = key ? `https://mainnet.helius-rpc.com/?api-key=${encodeURIComponent(key)}` : 'https://api.mainnet-beta.solana.com';
  try {
    const upstream = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(req.body) });
    const body = await upstream.text();
    res.status(upstream.status).setHeader('content-type', 'application/json').send(body);
  } catch { res.status(502).json({ error: 'Unable to reach Solana RPC' }); }
}
