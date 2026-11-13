# Security

No secret keys, seed phrases or wallet credentials are requested or stored. Contract text is rendered through React, not injected as HTML; external links are constrained to public HTTP(S) URLs and opened with `noopener noreferrer`. The app validates addresses, URL lengths, criteria, limits and deadlines. It re-reads current state and account/network before a write; contract authorization is the ultimate control.

Evidence and model output are untrusted. Reachability is not authenticity, and content may change. Prompt injection and correlated model errors can defeat independent evaluation. An unassigned milestone is claimable by the first valid non-creator. No escrow is implemented. Preview network state may reset. This frontend has not had a formal security audit; test wallet/provider behavior and simulation fee policy before real use.
