import {describe, expect, it} from 'vitest';
import readme from '../README.md?raw';
import network from '../docs/NETWORK_CONFIGURATION.md?raw';
import claimsGuide from '../docs/CLAIMVERIFIER_INTEGRATION.md?raw';
import {CONFIG} from './domain';
import {CLAIM_ADDRESS, CLAIM_EXPLORER} from './claims/config';
import {METRIC_ADDRESS} from './metrics/config';

describe('documented contract configuration', () => {
  it('lists each configured address in the README and network guide', () => {
    for (const address of [CONFIG.contract, CLAIM_ADDRESS, METRIC_ADDRESS]) {
      expect(readme.toLowerCase()).toContain(address.toLowerCase());
      expect(network.toLowerCase()).toContain(address.toLowerCase());
    }
  });
  it('identifies the configured ClaimVerifier in its guide and explorer', () => {
    expect(claimsGuide.toLowerCase()).toContain(CLAIM_ADDRESS.toLowerCase());
    expect(CLAIM_EXPLORER.toLowerCase()).toContain(CLAIM_ADDRESS.toLowerCase());
  });
  it('keeps a single configured Studio Dev chain', () => {
    expect(CONFIG.chainId).toBe(61997);
    expect(CONFIG.chainHex).toBe('0xf22d');
  });
});
