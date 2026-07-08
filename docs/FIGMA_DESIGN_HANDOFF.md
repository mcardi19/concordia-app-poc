# Figma ↔ code mapping — Concordia mobile app

Hand this to Claude Design (or any Figma MCP handoff) so generated screens match the existing React Native code instead of fighting it.

## Stack summary

- **Framework:** React Native 0.81 + Expo SDK 54 (iOS, Android, web).
- **Styling system:** **Custom Concordia design system (CDS)** on **plain React Native** — inline style objects driven by a token theme via `useTheme()`.
- **Not used:** NativeWind, Tamagui, Shopify restyle, styled-components, and `StyleSheet.create`. Do **not** introduce Tailwind-style utility classes or any of those libraries.
- **Icons:** Material Symbols (`@material-symbols-react-native/outlined-400`). No other icon set.
- **Theme access:** components call `useTheme()` (from `src/design-system/theme`) and read `theme.color.*`, `theme.spacing.*`, `theme.typography.*`, `theme.radius.*`, `theme.shadow.*`.
- **Code Connect:** none yet (no `.figma.ts` / `.figma.js` files). Figma variant names will not auto-map until Code Connect is added — keep names aligned manually for now.

## Components and variant prop names

Source: `src/components/design-system/`. Match Figma component **variant property names** to these exactly.

| Component | Prop | Allowed values | Default |
| --------- | ---- | -------------- | ------- |
| **Button** | `variant` | `primary` \| `secondary` \| `ghost` | `primary` |
| **Text** | `variant` | `heading1` \| `heading2` \| `heading3` \| `body` \| `bodySmall` \| `caption` | `body` |
| **Text** | `color` | `primary` \| `secondary` \| `subtle` \| `inverse` \| `brand` \| `link` | `primary` |
| **Card** | `elevation` | `low` \| `medium` \| `high` | `low` |
| **Card surface helper** (`useCardSurface` / `getCardSurfaceStyle`) | `elevation` | `none` \| `low` \| `medium` \| `high` | `low` |
| **Input** | _(no variant)_ | uses `label`, `error`, `containerStyle` | — |
| **Screen** | _(layout wrapper)_ | uses `edges` (safe-area edges) | — |

Notes:
- **Button** renders a `Pressable`; `primary` uses brand burgundy with a hover/pressed state, `secondary` uses a muted background, `ghost` is transparent.
- **Input** has no style variants; its error state is driven by the `error` prop (switches border + helper text to the error colour).
- **Card** always has a border; `elevation` only controls shadow. `none` (helper only) means border, no shadow.

## Design tokens (bind Figma variables to these names)

Bind Figma variables/styles to **semantic token names**, never raw hex or pixel values.

### Colour roles (`theme.color.*`)

- Brand: `primary`, `primaryHover`, `primaryActive`, `primaryDark`
- Surfaces: `background`, `backgroundSubtle`, `backgroundMuted`, `backgroundBrand`, `backgroundInverse`
- Text: `text.primary`, `text.secondary`, `text.subtle`, `text.subtler`, `text.inverse`, `text.inverseSubtle`, `text.brand`, `text.link`, `text.linkHover`
- Borders: `border`, `borderSubtle`, `borderSubtler`, `borderBrand`, `borderFocus`
- Status: `success`, `warning`, `error`, `info`
- Tints: `tintSuccess`, `tintWarning`, `tintInfo`, `tintMuted`

Brand anchors: burgundy `#912338` (primary), link blue `#0072a8`.

### Spacing (`theme.spacing.*`)

`xs`, `sm`, `md`, `lg`, `xl`, plus `screenHorizontal` (mobile screen inset) and `section`.

### Typography (`theme.typography.*`)

Same names as the Text `variant` values: `heading1`, `heading2`, `heading3`, `body`, `bodySmall`, `caption`. Each carries `fontSize`, `fontWeight`, `lineHeight` (unitless multiplier), `letterSpacing`, `fontFamily`.

### Radius and shadow

- Radius: `theme.radius.*` (e.g. `button`, `lg`).
- Shadow: `theme.shadow.low | medium | high` (maps to iOS shadow props and Android `elevation`).

## Layout conventions

- Screens commonly wrap content in the `Screen` component and use a `ScrollView`.
- Spacing/padding come from `theme.spacing.*` inline (e.g. `paddingHorizontal: theme.spacing.md`), not magic numbers.
- Card-like surfaces use `useCardSurface(elevation, overrides)` rather than re-deriving border/shadow.
- Minimum touch target is enforced via `MIN_TOUCH_TARGET_SIZE` (accessibility); interactive Figma elements should be sized to match.

## Do / don't for the handoff

**Do**
- Name Figma variant properties `variant`, `color`, `elevation` to match props above.
- Bind colours/spacing/type to semantic token names (`text/primary`, `spacing/md`, `color/primary`).
- Use Material Symbols for icons.
- Keep new screens composed from existing `Button`, `Text`, `Card`, `Input`, `Screen`.

**Don't**
- Don't emit Tailwind/NativeWind classes, Tamagui, restyle, or styled-components.
- Don't hardcode hex colours or pixel font sizes when a token exists.
- Don't invent new variant names (e.g. `solid`, `outline`) — reuse `primary` / `secondary` / `ghost`.
- Don't represent structural depth in names; keep variant props flat.

## Related docs

- Open Data API field shapes for screen content: `docs/CONCORDIA_OPEN_DATA_DATA_SHAPES.md`
- Architecture and conventions: `docs/CONCORDIA_APP_ARCHITECTURE.md`
