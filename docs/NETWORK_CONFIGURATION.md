# Network configuration

Use GenLayer Studio Dev only: chain ID 61997 (`0xf22d`), RPC `https://studio-dev.genlayer.com/api`, GEN. MilestoneJudge: `0x99F8164EE5cBe67C723eA4044A50c79B96E0E0Ba`. ClaimVerifier: `0xAD841aD6C876dA20ecC380A71ADe8313B81d3C92`. The frontend requests a network switch when needed and checks the active account and network again before signature. All three currently configured addresses were rechecked read-only on 2026-11-21: their count methods returned zero, and their deployed code matched the checked-in contract files after line-ending normalization. This does not verify wallet writes or consensus; Studio Dev can reset.

MetricConsensus: `0xd4efFc3B03B830c7a60e47769F2b41596B808a55`; see [integration notes](METRICCONSENSUS_INTEGRATION.md).
