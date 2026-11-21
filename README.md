# Proofline

A static React application for creating and verifying work milestones with the existing MilestoneJudge Intelligent Contract on GenLayer Studio Dev. Creators define criteria; executors submit public evidence; the creator or executor can request independent validator assessment. There is no payment or escrow.

## Status: development preview, not production-verified

The public MilestoneJudge read path was exercised on chain 61997 on 2026-11-13 against a previous deployment: count, milestone, status, submission and verification returned data at that time. A read-only recheck on 2026-11-21 found zero records on each of the three currently configured contracts; state may change or reset. No live wallet write was performed. The four write paths, wallet signing, fee simulation, decision/finalization polling and recovery are implemented but **not verified with a live wallet transaction**. Do not treat this as production-ready without completing the live checks in `docs/GENLAYER_INTEGRATION.md`, including browser-wallet compatibility and fee estimation for each branch. Studio Dev can reset or change.

## Run locally

Requirements: Node 20+ and npm.

```sh
npm ci
npm run dev
npm test
npm run lint    # strict TypeScript check
npm run build
npm run preview
```

Open the local Vite URL. Install an EIP-1193 browser wallet; connect it explicitly and switch to **GenLayer Studio Dev**, chain **61997**. The app can add the verified network metadata to compatible wallets. No keys or seed phrases are requested. Disconnecting removes the account from the app; it does not revoke access in the wallet extension.

## Routes

`/`, `/explore`, `/dashboard`, `/create`, `/milestone/:id`, `/milestone/:id/submit`, `/milestone/:id/verification`, `/my-work`, `/activity`, `/how-it-works`.

The explore, dashboard and personal lists load 12 newest IDs at a time with a maximum of four concurrent reads per batch. Filtering and counts apply only to loaded records; use Load more for a wider scope. Activity reconstructs milestone creation and submissions for loaded records only. Reads may be reused from a 30-second in-memory cache and are labeled accordingly; Refresh clears it and displays per-record failures. No demo records are inserted.

## Network & architecture

- `genlayer-js@2.0.0-rc.3` pinned in the lockfile; `studioDevnet` preset.
- Canonical RPC: `https://studio-dev.genlayer.com/api`, chain ID `61997`, currency GEN.
- MilestoneJudge contract: `0x99F8164EE5cBe67C723eA4044A50c79B96E0E0Ba`. ClaimVerifier: `0xAD841aD6C876dA20ecC380A71ADe8313B81d3C92`.
- Reads use SDK `LATEST_FINAL` and validate response shapes with Zod. Writes use a provider-backed SDK client, `estimateTransactionFeesForWrite`, `writeContract`, `waitForDecision`, `waitForFinalization` and `isSuccessful`. Fee estimates here simulate the concrete write; this is a development approach, not a measured production fee profile.
- React, TypeScript, Vite, React Router, Lucide, Tailwind utilities, Zod, Viem. App styling also uses custom CSS. All state comes from the public contract or wallet, except UI state and a pending transaction ID in local storage.
- See the documents in `docs/` for details.

## Netlify

Connect this folder as a repository, or upload a built site. Build command `npm run build`, publish directory `dist`. The included `netlify.toml` supplies an SPA fallback for route refreshes. Do not place secrets in client environment variables. No permanent backend is needed.

## Known limitations

- **No live write test has been performed.** The preview SDK, browser wallet and actual fee/consensus flow require validation together. Per-write simulation can be slow, fail or differ from execution; replace with measured fee profiles before production.
- Consensus can be undetermined, evidence can change, accessibility does not prove authenticity, and AI consensus does not guarantee truth. The contract stores references and assessments, not evidence snapshots. Plain HTTP fetch may not access private, paywalled, JS-only or large pages.
- No payment/escrow, notifications, profiles, server search or complete transaction/event history. The latest verification per attempt is exposed, not all historical runs. Listing/filtering is client-side and limited to loaded records.
- A first valid submitter can claim an unassigned milestone; assigning an executor mitigates front-running. Final states are immutable and revision/evaluation limits apply.
- The wallet selector relies on injected `window.ethereum` and its `providers` list; EIP-6963-only wallets have not been tested. Wallet reconnection is manual. Dialog focus trapping and a full accessibility audit remain to be completed. Some small technical labels may require zoom.
- Browser storage persists a submitted transaction hash for recovery, not credentials. After a timeout, resume or inspect it; do not blindly submit again. A rejected/undetermined decision is not a contract approval. Reads may lag while waiting for finality.
- The public preview RPC can impose rate limits (observed 30 requests/minute during rapid automated checks). Large histories or repeated refreshes can fail; wait and retry.
- Initial JS bundle is large (roughly 940 kB before gzip); code splitting is future work. Google Fonts are remote with system fallbacks.

## ClaimVerifier integration — development preview

Proofline includes a separate ClaimVerifier workspace for public claim reads, source inspection and assessment reports. The `/claims` routes support registration, source addition, verification and reassessment through the existing wallet flow. This implementation has **not been independently verified with real wallet writes**. Treat it as a preview and review `docs/CLAIMVERIFIER_INTEGRATION.md`, `docs/EVIDENCE_INTELLIGENCE.md`, `docs/NETWORK_CONFIGURATION.md` and `docs/TESTING.md` before use. Claim outcomes do not alter MilestoneJudge decisions. Contract reads are scoped and may be incomplete; the UI does not fabricate records.

## MetricConsensus — development preview

Proofline now includes a metrics workspace at `/metrics`: explore contract records, register a metric, append sources, request verification, inspect evidence reports and compare stored observations. User-supplied external references connect metrics to milestones or claims as supporting context only; results never change those contracts.

The configured MetricConsensus contract is `0xd4efFc3B03B830c7a60e47769F2b41596B808a55` on Studio Dev. Read-only preflight confirmed deployed code, schema and a count of zero; no wallet writes or live end-to-end consensus were performed for this integration. Existing fee estimation is used; Transaction Kit and measured fee profiles are not yet integrated. Details, contract source, routes and limitations: [MetricConsensus integration](docs/METRICCONSENSUS_INTEGRATION.md).
