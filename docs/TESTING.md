# Testing

Run `npm test`, `npm run lint` and `npm run build`. Claim adapter tests use saved real response shapes as mock fixtures; these tests do not prove real consensus. Public RPC reads and deployed-source comparisons performed on 2026-11-15 referred to previous deployments. On 2026-11-21, read-only checks of the current MilestoneJudge, ClaimVerifier and MetricConsensus deployments returned counts of zero and their deployed code matched the corresponding checked-in contract files after line-ending normalization. These results may change on the resettable preview network. No real claim writes, wallet signatures, fee simulations, consensus or finalization were performed during this integration. Do not treat unit tests or a build as proof of those flows.

Full transaction failure/recovery tests, broad responsive and accessibility coverage, and live wallet verification of registration, source addition, verification and reassessment are still required before production use.
