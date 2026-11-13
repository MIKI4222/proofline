# GenLayer integration

SDK: `genlayer-js@2.0.0-rc.3`, locked explicitly. Its `studioDevnet` definition selects chain 61997 and canonical `https://studio-dev.genlayer.com/api`. Stable `studionet` (61999) is not used. The project owner's explorer link is retained for contract inspection; the official Studio Dev explorer is used for transaction links. Preview state can reset.

On 2026-11-13, RPC `eth_chainId` returned `0xf22d`; SDK `get_milestone_count` returned 1. `get_milestone(1)`, `get_status(1)`, `get_submission(1,0)` and `get_verification(1,0)` returned contract data. Browser read rendering was also observed locally. No wallet transaction was submitted or verified. The upstream source at audit was commit `c705894883e20c67b841b29fe41ecfb2b9ae0ab5`; the public repository contained the root `milestone_judge.py` and README but no tests or docs directories despite README references.

Reads use an account-free SDK client. Writes use the chosen injected EIP-1193 provider and connected account. Before signing, the app rechecks account, chain and (for non-creation writes) fresh state and role. It estimates each concrete write with `estimateTransactionFeesForWrite`, displays the fee deposit, and passes the returned distribution and value to `writeContract`. This simulation-based approach is useful for development, but official guidance recommends measured fee profiles for production. **Its compatibility with live wallet and all branches has not been verified.**

Before deployment for use, manually test a permitted create, submit, evaluate, and revision using authorized funded wallets; check the estimate, wallet chain, transaction ID, stored decision, finalization and fresh resulting data in both app and explorer. Record every transaction. Do not perform these operations without the owner’s approval. Contract outcome and transaction consensus are distinct.

References: https://docs.genlayer.com/developers/consensus-v06-migration ; https://docs.genlayer.com/api-references/genlayer-js ; https://docs.genlayer.com/developers/networks ; https://docs.genlayer.com/developers/decentralized-applications/writing-data .
