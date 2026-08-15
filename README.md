# AutoLens AI

AutoLens AI is a responsive vehicle-buying intelligence cockpit. It consolidates local asking prices, an explainable fair-value estimate, listing comparisons, vehicle-history risk, reliability and recalls, projected service and maintenance costs, alternatives, a price target, and negotiation guidance.

The repository includes two deployable surfaces:

- **Full-stack edge app:** the main Vinext/React application and validated `/api/valuation` endpoint, suitable for Cloudflare-compatible hosting.
- **GitHub Pages app:** a static build of the same interface. It keeps the interactive client-side valuation fallback, but live marketplace and protected history-provider calls must be routed through a separately hosted API.

## Local development

```bash
npm install
npm run dev
```

For the GitHub Pages build:

```bash
npm run build:pages
```

## Accuracy architecture

The demo clearly labels sample data. A production deployment should use:

1. NHTSA vPIC for VIN decoding and NHTSA recall/campaign data.
2. A licensed marketplace feed for active and recently removed listings.
3. A licensed NMVTIS-compatible provider for title brands plus CARFAX or AutoCheck where contractually available for accident/service records.
4. A scheduled comparable-sales pipeline that normalizes trim, mileage, condition, geography, time-on-market, and dealer fees.
5. A versioned valuation model with backtesting, confidence calibration, drift monitoring, and an explanation log for every estimate.
6. Licensed maintenance-cost data plus manufacturer service schedules, localized labor rates, parts inflation, and service-history adjustments for ownership forecasts.

Never present an incomplete history lookup as a clean vehicle. Treat missing provider coverage as “unknown,” not “no accidents.”

## GitHub Pages

The workflow at `.github/workflows/deploy-pages.yml` publishes `dist-pages` on pushes to `main`. In the repository settings, set **Pages → Source** to **GitHub Actions**. Project-site base paths are derived automatically from `GITHUB_REPOSITORY`.

GitHub Pages is static hosting, so keep provider secrets and paid API calls in the edge API; point the production Pages client to that API when credentials are configured.
