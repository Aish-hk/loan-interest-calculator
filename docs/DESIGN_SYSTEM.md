# Anchor Bank Calculator Design System

This is the source of truth for the calculator’s visual foundations,
interaction states and reusable patterns. The implementation lives in
`src/styles.css` and `src/components`.

## Principles

1. **Financial clarity** — amounts, rates, dates and assumptions are explicit.
2. **Progressive detail** — the primary total appears before supporting maths.
3. **Recoverable actions** — errors explain the fix and records can be edited.
4. **Accessible by default** — controls have labels, focus and text equivalents.

## Foundations

### Colour

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#191c1f` | Primary text |
| `--muted` | `#505a63` | Supporting text |
| `--surface` | `#ffffff` | Cards and controls |
| `--soft` | `#f4f4f4` | Grouped surfaces |
| `--line` | `#e2e2e7` | Borders and dividers |
| `--primary` | `#494fdf` | Actions and selected state |
| `--primary-hover` | `#3a40c4` | Hover and pressed state |
| `--positive` | `#00a87e` | Positive financial data |
| `--error` | `#e23b4a` | Validation state |
| `--warning` | `#c77400` | Cautionary state |
| `--focus-ring` | `rgba(73, 79, 223, .22)` | Keyboard focus |

Black and white define the Anchor Bank masthead and hero. Colour is never the
only way a state or value is communicated.

### Typography

- **Display and headings:** Manrope, weights 500–700.
- **Body and controls:** Inter, weights 400–700.
- **Fallback:** system UI sans-serif.
- **Hero:** fluid 52–80px.
- **Section headings:** 24–32px.
- **Body:** 14–18px.
- **Eyebrow/meta:** 11–12px.
- **Financial columns:** tabular numerals.

### Spacing, shape and layout

- Spacing scale: `4, 8, 12, 16, 24, 32, 48px` (`--space-1`–`--space-7`).
- Card radius: `12px`; control radius: `8px`; badges are fully rounded.
- Maximum content width: `1180px`.
- Desktop uses form and summary columns; mobile follows reading order.
- Tables scroll horizontally rather than clipping financial values.

## Components

- **Brand header:** minimal black masthead with logo and wordmark.
- **Buttons:** primary, secondary and text variants with complete interaction
  states.
- **Form fields:** persistent labels, native numeric constraints and actionable
  inline errors.
- **Date range picker:** segmented fields and keyboard-operable calendar; start
  is inclusive and end is exclusive.
- **Rate preview:** live `base + margin` value before submission.
- **Interest summary:** total first, then repayment composition and assumptions.
- **Accrual table:** paginated in 100-row pages; rounded rows reconcile exactly.
- **Calculation history:** session-scoped records that reopen and update in place.
- **Empty/loading/error states:** describe the next action and degrade safely if
  browser storage is unavailable.

## Interaction and accessibility

- Targets remain approximately 40px or larger.
- Keyboard focus uses the shared focus-ring token.
- Reduced-motion preferences are respected.
- Tooltips are supplementary; essential guidance remains visible.
- Dates use ISO calendar values and UTC formatting to avoid DST shifts.
- Results receive focus after calculation; edit returns focus to the form area.

## Content style

Use direct labels such as “Calculate interest”, “Save changes” and “Edit”.
State financial conventions plainly and never imply an estimate is an offer or
financial advice.
