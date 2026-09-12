# Cryptgreg Multi-Chain Tracker

A read-only wallet intelligence dashboard for Bitcoin, Ethereum, Solana, and XRP Ledger. It uses a shared `ChainAdapter` contract so additional networks can be added without coupling the UI to chain-specific APIs.

## Principles

- Explicit chain selection; no unsafe address auto-detection.
- No wallet keys, signing, account creation, or stored personal data.
- Public/free network APIs only by default.
- Public APIs are rate-limited and best-effort. This is for research and education.

## Development

```bash
npm install
npm run dev
npm run typecheck
npm run test:run
npm run build
```

Optional public endpoint overrides:

```env
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_ETHEREUM_RPC_URL=https://ethereum-rpc.publicnode.com
VITE_ETHEREUM_BLOCKSCOUT_URL=https://eth.blockscout.com/api/v2
```

The Ethereum integration intentionally runs entirely from public browser-safe APIs so it remains compatible with the repository's static GitHub Pages deployment. ETH balance comes from Ethereum JSON-RPC; indexed address history and counters come from Blockscout. If indexed history is unavailable, the tracker still returns the RPC balance and shows a degradation notice.

Blockscout has announced that per-instance APIs are being deprecated in favor of its universal PRO API. `VITE_ETHEREUM_BLOCKSCOUT_URL` is therefore configurable so the indexed provider can be migrated without changing the Ethereum adapter contract.

## Data sources

- Bitcoin: Blockstream API
- Ethereum balance: PublicNode Ethereum JSON-RPC (`eth_getBalance`)
- Ethereum history: Blockscout Ethereum public API v2
- Solana: JSON-RPC (`getBalance`, `getSignaturesForAddress`)
- XRP: XRPL public WebSocket cluster
- Prices: CoinGecko public API, cached for 60 seconds
