# Loan Interest Calculator

A responsive React and TypeScript application that calculates simple loan
interest, provides a daily accrual schedule, and lets users view or update
calculations created during the current browser session.

## Live

- GitHub Pages: `https://aish-hk.github.io/loan-interest-calculator/`
- Cloudflare Pages: connect this repository with build command `npm run build`
  and output directory `dist`

## Run locally

```bash
npm install
npm run dev
```

Run the automated checks:

```bash
npm test
npm run build
```

## Technology

- React for component composition and local interface state
- TypeScript for explicit financial data structures
- Vite for a small, fast development and build setup
- Vitest for calculation and date-boundary tests
- React Aria Components for accessible date fields and calendar interaction
- Plain CSS for a focused design foundation without UI-library overhead

## Calculation assumptions

The task does not define a financial day-count convention or boundary-date
behaviour. This implementation makes those choices explicit:

- Simple interest; no compounding
- 365-day year
- Start date included
- End date excluded
- Days elapsed are zero-based: the start-date accrual has 0 days elapsed
- Calendar days are used, including weekends and public holidays
- Total annual rate = base interest rate + margin
- Daily schedules are generated in pages of 100 records, allowing long-term
  loans without allocating every day in memory
- Currency totals use two-decimal cumulative rounding. Each daily row is the
  difference between consecutive rounded cumulative balances, so displayed
  daily accruals always reconcile exactly to displayed total interest
- A defensive 50-year processing ceiling prevents pathological browser input;
  30-year loans are fully supported

```text
base daily interest = principal × (base rate / 100) ÷ 365
daily accrued interest = principal × ((base rate + margin) / 100) ÷ 365
total interest = daily accrued interest × number of days
```

The nominal daily rate is calculated at full precision. Currency amounts in the
schedule and total are rounded to two decimals using cumulative allocation,
which avoids placing the entire rounding remainder on the final day.

## UX decisions

- The form groups dates, principal and rates to reduce cognitive load.
- Total annual rate updates immediately as base rate and margin change.
- Invalid input is described beside the relevant field.
- Successful calculation moves focus to the result.
- Daily results use a bounded, horizontally scrollable and paginated table.
- Loan dates use accessible segmented fields and a calendar with month/year
  navigation, keyboard controls and bounded selectable dates.
- History uses `sessionStorage`, so it survives refreshes in the same tab and is
  cleared when that browser-tab session ends.
- History prioritises principal, period, total rate, duration and total
  interest. A direct calculation creates a new record. Opening a history record
  and recalculating updates that same record, preserving its Created timestamp
  and adding an Updated timestamp.

## Possible production extensions

- Additional jurisdiction-specific financial conventions
- Decimal arithmetic library or integer minor units for regulated calculations
- Local or server persistence
- Pagination or virtualisation for multi-year schedules
- More currencies and locale selection
- End-to-end accessibility and interaction tests

## Design system

Foundations, tokens, component definitions and interaction rules are documented
in [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).
End-to-end happy paths, validation, edge cases and acceptance criteria are in
[`docs/USER_FLOWS.md`](docs/USER_FLOWS.md).

## Deployment

Pushing `main` runs tests, builds the production bundle and deploys it through
the included GitHub Pages workflow. In repository settings, set
**Pages → Build and deployment → Source** to **GitHub Actions**.

For Cloudflare Pages, import the same GitHub repository and use:

- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: 22
