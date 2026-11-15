# Testing

Run `npm test`, `npm run lint` and `npm run build`. Claim adapter tests use saved real response shapes as mock fixtures; these tests do not prove real consensus. Public RPC reads and deployed-source comparisons were independently performed on 2026-11-15. No real claim writes, wallet signatures, fee simulations, consensus or finalization were performed during this integration. Do not treat unit tests or a build as proof of those flows.

Full transaction failure/recovery tests, broad responsive and accessibility coverage, and live wallet verification of registration, source addition, verification and reassessment are still required before production use.
