# Ethereum Tracker Merge Notes

Base repository: `jimskin03/multi-chain-tracker`
Base commit: `176e1063f96e71167f8dc76b73a12d581575ad3b`
Recommended branch: `feature/ethereum-tracker`

## What is implemented

- Ethereum added as a fourth `ChainAdapter`.
- Public Ethereum address validation.
- ETH balance from PublicNode JSON-RPC (`eth_getBalance`).
- Latest address transactions + transaction counter from Blockscout Ethereum public API v2.
- ETH/USD via the existing CoinGecko price service.
- Incoming/outgoing/self/activity normalization.
- Wei-safe formatting with `BigInt`.
- Contract method names for zero-value calls such as `approve`.
- Gas fee and counterparty metadata exposed in the existing transaction UI.
- Graceful degradation: RPC balance still renders when indexed Blockscout history is unavailable.
- Ethereum sample wallet, tab styling, environment overrides, docs, and tests.
- Existing Bitcoin, Solana, and XRP adapter model is preserved.

## Why there is no `/api/ethereum.ts`

The repository deploys through GitHub Pages, which is static. A Vercel-style serverless route would not execute there. The ETH integration therefore uses browser-safe public endpoints so it works with the current deployment model.

## Files changed

- `.env.example`
- `README.md`
- `src/App.tsx`
- `src/chains/adapters.ts`
- `src/chains/ethereum.ts` (new)
- `src/chains/ethereum.test.ts` (new)
- `src/chains/validators.ts`
- `src/chains/validators.test.ts`
- `src/services/priceService.ts`
- `src/styles.css`
- `src/types/wallet.ts`
- `src/vite-env.d.ts`

## Validation performed

Strict TypeScript checking passed across the modified `src` tree using local declaration stubs because this sandbox cannot install npm packages from the network. The actual repository CI should still run:

```bash
npm ci
npm run typecheck
npm run test:run
npm run build
```

## Provider note

Blockscout's per-instance public API is currently documented but deprecated in favor of the universal PRO API. The base URL is configurable through `VITE_ETHEREUM_BLOCKSCOUT_URL`, making a later provider migration localized to configuration/adapter logic.

## GitHub write limitation in this session

The connected GitHub integration could read the repository but returned HTTP 403 for branch creation and Git tree/commit writes. No changes were made to `main`.
