# Ledger Design Foundation

Implementation reference adapted from the user-provided
`Revolut-design-analysis` specification.

## Foundations

- Primary: `#494fdf`
- Ink: `#191c1f`
- Dark canvas: `#000000`
- Light canvas: `#ffffff`
- Soft surface: `#f4f4f4`
- Elevated dark surface: `#16181a`
- Light hairline: `#e2e2e7`
- Positive: `#00a87e`
- Danger: `#e23b4a`

## Typography

The reference specifies Aeonik Pro for display typography and Inter for body
copy. Aeonik Pro is proprietary and is not included in this project, so
Manrope is used as the closest existing display substitute. Inter is loaded
for body and interface copy.

## Shape and interaction

- Cards: 20px radius
- Inputs: 12px radius, 56px height
- Primary and secondary buttons: pill shape, 48px minimum height
- Small badges: pill shape
- Interactive targets: 44px minimum

## Layout

- Near-black hero and navigation band
- White catalogue-style application surface
- High contrast section transitions
- Cobalt-violet reserved for primary financial emphasis and selected state

## Data visualisation and motion

- Charts use the primary violet for principal and a lighter violet for interest
- Financial values and percentages remain visible outside colour alone
- Calculation-result motion runs once to communicate that fresh data was produced
- Ambient hero motion is slow, spatial and metallic rather than playful
- All animation collapses to a near-instant state when reduced motion is enabled
