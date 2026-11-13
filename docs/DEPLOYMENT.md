# Deployment

Run `npm ci`, `npm test`, `npm run lint`, `npm run build`. Netlify should use `npm run build` and publish `dist`; the root `netlify.toml` routes all SPA paths to `index.html`. The RPC and address are public constants, not secrets. No custom server is required. Verify direct-route refreshes, CSP/network availability, wallet extension interaction, error states and approved live transactions before relying on the site. The default owner-supplied explorer and official transaction explorer are separately configured.
