# Loan Interest Calculator

A responsive React and TypeScript application that calculates simple loan
interest, provides a daily accrual schedule, and lets users view or update
calculations created during the current browser session.

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
- React DayPicker for accessible keyboard-navigable range calendars
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
- A defensive 50-year processing ceiling prevents pathological browser input;
  30-year loans are fully supported

```text
base daily interest = principal × (base rate / 100) ÷ 365
daily accrued interest = principal × ((base rate + margin) / 100) ÷ 365
total interest = daily accrued interest × number of days
```

Calculations retain full JavaScript numeric precision internally and are rounded
to two decimal places only for display.

## UX decisions

- The form groups dates, principal and rates to reduce cognitive load.
- Total annual rate updates immediately as base rate and margin change.
- Invalid input is described beside the relevant field.
- Successful calculation moves focus to the result.
- Daily results use a bounded, horizontally scrollable and paginated table.
- Accrual dates can be filtered with an inclusive date-range dropdown without
  materialising the full schedule.
- Loan and filter dates use a shared range calendar with month/year navigation,
  keyboard controls and bounded selectable dates.
- History is deliberately kept in React state because persistence is outside
  the task requirements.
- History prioritises principal, period, total rate, duration and total
  interest. A direct calculation creates a new record. Opening a history record
  and recalculating updates that same record, preserving its Created timestamp
  and adding an Updated timestamp.

## Possible production extensions

- Configurable ACT/360, ACT/365 and 30/360 conventions
- Decimal arithmetic library or integer minor units for regulated calculations
- Local or server persistence
- Pagination or virtualisation for multi-year schedules
- More currencies and locale selection
- End-to-end accessibility and interaction tests
