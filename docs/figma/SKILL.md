---
name: concordia-app-layer-naming
description: >-
  Rename Figma layers and component properties so Concordia mobile app designs
  map 1:1 to React Native code. Use when renaming layers, auditing component
  structure, preparing design handoff, or aligning Figma with
  concordia-app-poc.
---

# Concordia mobile app — Figma layer naming

Rename Figma layers so they match the React Native codebase in `concordia-app-poc`. The goal is predictable design-to-code mapping without Code Connect.

**Stack:** React Native 0.81 + Expo SDK 54. Styling uses `useTheme()` tokens, not CSS classes.

---

## Quick rules

1. **PascalCase** for component and screen names (`Button`, `LibraryLoanRow`, `Today`).
2. **camelCase** for variant property names and values (`variant`, `primary`, `heading2`).
3. **Match code exactly** — do not invent synonyms (`solid` → use `primary`; `title` → use `heading1`).
4. **Name by role, not appearance** — `label`, `content`, `actions`; not `red text`, `big box`, `Frame 47`.
5. **One component level** — do not encode DOM depth in names (`Card/content/title`, not `Card/content/wrapper/inner/title`).
6. **Use design system instances** — swap raw frames for `Button`, `Text`, `Card`, `Input`, `Screen` components where possible.
7. **Bind tokens** — colours, spacing, and type use semantic token paths, never raw hex or px in layer names.

---

## Layer hierarchy

Use this structure inside every screen frame:

```
Screen/{RouteName}                    ← top-level screen frame
├── Screen                            ← layout wrapper (safe area + horizontal inset)
│   ├── {SectionName}                 ← semantic screen section (Header, Content, Footer)
│   │   ├── {FeatureComponent}        ← feature component instance or frame
│   │   │   ├── {RoleLayer}           ← label, value, media, actions
│   │   │   └── Text/{variant}        ← or Button, Card, Input instances
│   │   └── ...
│   └── ...
└── (optional) TabBar                 ← only for full-app mockups
```

### Separator convention

Use `/` in layer names for hierarchy: `Screen/Today/Header/AccountHeader/title`.

Do **not** use BEM (`block__element--modifier`) or AEM web prefixes (`c-card`). This is a mobile app, not the AEM website.

---

## Screen frames

Name the top-level frame after the **navigation route key** (PascalCase, no `Screen` suffix).

| Figma frame name | Code file | Nav route |
| ---------------- | --------- | --------- |
| `Screen/Today` | `TodayScreen.tsx` | `Today` |
| `Screen/Schedule` | `ScheduleScreen.tsx` | `Schedule` |
| `Screen/CampusHome` | `CampusHomeScreen.tsx` | `CampusHome` |
| `Screen/ShuttleSchedule` | `ShuttleScheduleScreen.tsx` | `ShuttleSchedule` |
| `Screen/ShuttleTracker` | `ShuttleTrackerScreen.tsx` | `ShuttleTracker` |
| `Screen/Events` | `EventsScreen.tsx` | `Events` |
| `Screen/ServicesSearch` | `ServicesSearchScreen.tsx` | `ServicesSearch` |
| `Screen/Library` | `LibraryScreen.tsx` | `Library` |
| `Screen/MeHome` | `MeHomeScreen.tsx` | `MeHome` |
| `Screen/Settings` | `SettingsScreen.tsx` | `Settings` |
| `Screen/Profile` | `ProfileScreen.tsx` | `Profile` |
| `Screen/Grades` | `GradesScreen.tsx` | `Grades` |
| `Screen/Balance` | `BalanceScreen.tsx` | `Balance` |
| `Screen/Login` | `LoginScreen.tsx` | `Login` |

**Section names** inside a screen (sentence case is fine for display copy, PascalCase for layer groups):

- `Header`, `Content`, `Footer`, `List`, `Hero`, `Actions`
- Domain sections: `DegreeProgress`, `BalanceSummary`, `WeekStrip`, `DayTimeline`

---

## Design system components

Figma component set names must match exports from `src/components/design-system/` exactly.

| Figma component | Code export | Notes |
| --------------- | ----------- | ----- |
| `Button` | `Button` | `Pressable` with label child |
| `Text` | `Text` | All typography |
| `Card` | `Card` | Bordered surface with optional shadow |
| `Input` | `Input` | Label + field + optional error |
| `Screen` | `Screen` | Safe-area layout wrapper |

### Variant properties

Property names and values must match TypeScript prop types exactly.

**Button**

| Property | Values |
| -------- | ------ |
| `variant` | `primary`, `secondary`, `ghost` |

**Text**

| Property | Values |
| -------- | ------ |
| `variant` | `heading1`, `heading2`, `heading3`, `body`, `bodySmall`, `caption` |
| `color` | `primary`, `secondary`, `subtle`, `inverse`, `brand`, `link` |

**Card**

| Property | Values |
| -------- | ------ |
| `elevation` | `low`, `medium`, `high` |

**Input** (no style variants)

| Layer / state | Maps to prop |
| ------------- | ------------ |
| `label` | `label` string prop |
| `field` | `TextInput` |
| `error` | `error` string prop (visible when set) |

Rename internal Input layers as `label`, `field`, `error` — not `Label text`, `Rectangle 2`, `Error message red`.

---

## Feature components

Name component sets and frames after `src/components/feature/` exports (PascalCase, often domain-prefixed).

| Figma component | Code file |
| --------------- | --------- |
| `HomeFeatureCard` | `HomeFeatureCard.tsx` |
| `LoadingState` | `FeatureStates.tsx` |
| `ErrorState` | `FeatureStates.tsx` |
| `EmptyState` | `FeatureStates.tsx` |
| `AccountHeader` | `AccountHeader.tsx` |
| `StudentIdCard` | `StudentIdCard.tsx` |
| `BalanceSummaryCards` | `BalanceSummaryCards.tsx` |
| `DegreeProgressSection` | `DegreeProgressSection.tsx` |
| `AccountSettingsList` | `AccountSettingsList.tsx` |
| `ScheduleHeader` | `ScheduleHeader.tsx` |
| `ScheduleWeekView` | `ScheduleWeekView.tsx` |
| `ScheduleEventBlock` | `ScheduleEventBlock.tsx` |
| `ScheduleDayTimeline` | `ScheduleDayTimeline.tsx` |
| `ScheduleWeekStrip` | `ScheduleWeekStrip.tsx` |
| `LibraryQuickActionCard` | `LibraryQuickActionCard.tsx` |
| `LibraryCuratedBook` | `LibraryCuratedBook.tsx` |
| `LibraryLoanRow` | `LibraryLoanRow.tsx` |

### Internal layer roles (feature components)

Use stable role names inside feature components:

| Role | Use for |
| ---- | ------- |
| `media` | Cover image, avatar, thumbnail |
| `title` | Primary heading text |
| `subtitle` | Secondary line (author, date, meta) |
| `label` | Field label or caption |
| `value` | Primary data value |
| `actions` | Row of buttons or links |
| `divider` | Horizontal rule |
| `badge` | Status chip or due-date indicator |

**Example — `LibraryLoanRow`:**

```
LibraryLoanRow
├── media
├── content
│   ├── title          → Text variant=body
│   ├── subtitle       → Text variant=bodySmall color=secondary
│   └── dueLabel       → Text variant=caption
└── renewButton        → Button variant=ghost (or local Pressable)
```

---

## Icons

Icons are **Material Symbols** only (`@material-symbols-react-native/outlined-400`). No Feather, SF Symbols, or custom SVG names in layer names.

**Layer naming:** `Icon/{symbolName}`

| Layer name | Code reference |
| ---------- | -------------- |
| `Icon/home` | `msHome` (tab: today) |
| `Icon/calendar_today` | `msCalendarToday` (tab: schedule) |
| `Icon/map` | `msMap` (tab: campus) |
| `Icon/menu_book` | `msMenuBook` (tab: library) |
| `Icon/person` | `msPerson` (tab: me) |
| `Icon/school` | `msSchool` |
| `Icon/account_balance_wallet` | `msAccountBalanceWallet` |
| `Icon/schedule` | `msSchedule` |
| `Icon/directions_bus` | `msDirectionsBus` |
| `Icon/event` | `msEvent` |
| `Icon/search` | `msSearch` |
| `Icon/chevron_right` | `msChevronRight` |
| `Icon/wb_sunny` | `msWbSunny` |
| `Icon/document_scanner` | `msDocumentScanner` |
| `Icon/meeting_room` | `msMeetingRoom` |
| `Icon/bookmarks` | `msBookmarks` |

Use the official Material Symbols snake_case name. Hide vector sub-layers; keep one `Icon/{name}` wrapper.

---

## Design token variables

Bind Figma variables to semantic token paths. Layer names do not need token paths unless annotating dev handoff; variables carry the binding.

### Colour (`theme.color.*`)

```
color/primary
color/primaryHover
color/background
color/backgroundSubtle
color/backgroundMuted
color/text/primary
color/text/secondary
color/text/subtle
color/text/inverse
color/text/brand
color/text/link
color/border
color/borderSubtle
color/error
color/success
color/warning
color/info
```

Brand anchors: burgundy `#912338` (`primary`), link blue `#0072a8` (`text/link`).

### Spacing (`theme.spacing.*`)

```
spacing/xs
spacing/sm
spacing/md
spacing/lg
spacing/xl
spacing/screenHorizontal
spacing/section
```

### Typography (`theme.typography.*`)

```
typography/heading1
typography/heading2
typography/heading3
typography/body
typography/bodySmall
typography/caption
```

### Radius and shadow

```
radius/button
radius/sm
radius/md
radius/lg
shadow/low
shadow/medium
shadow/high
```

---

## Rename workflow

When cleaning up an existing Figma file:

1. **Identify the screen** — rename the top frame to `Screen/{RouteName}`.
2. **Wrap layout** — ensure content sits inside a `Screen` component instance (or a frame named `Screen`).
3. **Replace primitives** — convert raw text frames to `Text` instances; buttons to `Button`; surfaces to `Card`.
4. **Set variant props** — apply `variant`, `color`, `elevation` with exact code values.
5. **Name feature blocks** — rename groups to feature component names from the table above.
6. **Rename internal layers** — use role names (`title`, `subtitle`, `actions`), not visual descriptions.
7. **Fix icons** — rename to `Icon/{material_symbol_name}`; remove duplicate icon sets.
8. **Bind variables** — replace hardcoded fills and spacing with semantic token variables.
9. **Delete cruft** — remove hidden layers, `Frame 123`, `Group 45`, and duplicate wrappers.
10. **Verify** — every interactive element is at least 48×48 dp (touch target minimum).

---

## Do / don't

**Do**

- Name components after code exports (`AccountHeader`, not `Account header section`).
- Keep variant property names as `variant`, `color`, `elevation`.
- Use `Text` variants for all typography (`heading1`, not `H1` or `32px Bold`).
- Preserve sentence case in **text content** (e.g. nav title "Shuttle schedule"); PascalCase in **layer names**.
- Group list items as repeated component instances (`LibraryLoanRow`, not one flattened frame).

**Don't**

- Don't use Tailwind-style names (`text-lg`, `bg-burgundy-500`, `p-4`).
- Don't use web AEM BEM (`c-card__title`, `block--modifier`).
- Don't invent variant values (`outline`, `solid`, `default`, `large`).
- Don't put hex or pixel values in layer names (`#912338`, `16px padding`).
- Don't name layers after auto-layout position (`Top row`, `Left column`, `Rectangle 3`).
- Don't nest more than three levels of semantic meaning (`Screen/Today/Content/Card/Body/Title` — stop at `Screen/Today/Content/Card/title`).

---

## Before and after examples

| Before (wrong) | After (correct) |
| -------------- | --------------- |
| `Home` | `Screen/Today` |
| `Frame 12` | `Screen/Today/Content` |
| `Red button` | `Button` (variant=`primary`) |
| `H1 Account` | `Text` (variant=`heading1`, color=`brand`) |
| `Card shadow` | `Card` (elevation=`medium`) |
| `Input field` | `Input` |
| `Error text` | `error` (child of `Input`) |
| `Book row` | `LibraryLoanRow` |
| `settings gear` | `Icon/settings` |
| `16px / #912338` | bind `spacing/md` and `color/primary` variables |

---

## Related code references

- Handoff summary: `docs/FIGMA_DESIGN_HANDOFF.md`
- Architecture: `docs/CONCORDIA_APP_ARCHITECTURE.md`
- Design system components: `src/components/design-system/`
- Feature components: `src/components/feature/`
- Theme tokens: `src/design-system/tokens/`, `src/design-system/theme/`
- Navigation route names: `src/navigation/types.ts`
