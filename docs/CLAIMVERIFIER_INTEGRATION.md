# ClaimVerifier integration — development preview

This frontend uses the unchanged ClaimVerifier contract at `0xa44D5A557a2B146e6aC5B8c674cA31d540d98175` on Studio Dev (chain 61997), separately from MilestoneJudge. Public reads use the SDK and validate observed return structures. Owner-only writes reuse Proofline's wallet and transaction tracker. Claim registration requires instructions of 20–1000 characters; despite the product brief calling these optional, they are mandatory in the deployed code. The contract permits minimum source count 1, while maximum must be 2–5.

RPC chain ID, deployed schemas and normalized code were compared with both original sources on 2026-11-15. Claim count, claim 1, sources, latest assessment, history and integration status were read on the public network. No write transaction was sent and wallet signing, fee estimation, decision/finality and recovery for these claim operations have not been verified end to end. Contract state may change or be reset.

After a successful registration, locate the claim in Claims Explorer. The contract write returns no claim ID and the UI deliberately does not guess it from a global counter. Sources are append-only and verification is limited to the claim owner; the contract is authoritative.
