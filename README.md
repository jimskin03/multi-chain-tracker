# Cryptgreg Multi-Chain Tracker

A read-only wallet intelligence dashboard for Bitcoin, Solana, and XRP Ledger. It uses a shared `ChainAdapter` contract so additional networks can be added without coupling the UI to chain-specific APIs.

## Principles

- Explicit chain selection; no unsafe address auto-detection.
- No wallet keys, signing, account creation, or stored personal data.
- Solana uses a configurable RPC URL; no API key is shipped to browsers.
- Public APIs are rate-limited and best-effort. This is for research and education.

## Development

```bash
npm install
npm run dev
npm run typecheck
npm run test:run
npm run build
```

Set `VITE_SOLANA_RPC_URL` to a server-side proxy in production if using a provider that requires credentials. The current browser fallback is the public Solana RPC.

## Data sources

- Bitcoin: Blockstream API
- Solana: JSON-RPC (`getBalance`, `getSignaturesForAddress`, `getTransaction`)
- XRP: XRPL public WebSocket cluster
- Prices: CoinGecko public API, cached for 60 seconds
