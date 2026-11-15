# Evidence intelligence

MilestoneJudge and ClaimVerifier remain independent. `proofline:milestone:<id>` is an application convention stored in ClaimVerifier's `external_ref`; it is not an on-chain relation or a contract-to-contract call. Milestone pages scan claim IDs incrementally, display the scanned scope, and may miss records that fail to load. A claim result never changes a milestone verdict.

ClaimVerifier reports source and fact results, possible relationships, evidence strength and informational confidence. Independent groups are contract-derived heuristics, not proof of independent origin. Sources may be inaccessible, change over time or be unauthentic. Reports and JSON export are not cryptographic proofs.

The dashboard and activity panels only load a bounded recent subset. Activity is reconstructed from contract records; it is not a complete event or transaction history. Some requested advanced comparisons, transaction lifecycle tests and wallet-based end-to-end verification remain incomplete.
