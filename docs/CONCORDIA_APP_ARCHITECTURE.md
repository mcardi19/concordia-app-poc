# Concordia University Mobile App – Architecture & Conventions

This document is the single source of truth for stack choices, architecture, design system, security, accessibility, and long-term scale. Use it when adding features, reviewing code, or onboarding. Do not deviate without updating this doc.

---

## 1. Stack recommendation

| Area | Choice | Rationale / version target |
|------|--------|----------------------------|
| **React Native** | Expo (SDK 52+) with development build | Single codebase; EAS Build/Submit for App Store and Play Store; EAS Update for JS-only fixes; strong TypeScript and New Architecture support. Custom native code via config plugins when needed. |
| **TypeScript** | Strict mode, path alias `@/` → `src/` | All new code in TS; no `any` for public APIs. |
| **Navigation** | React Navigation 7 (or 8 when stable) | Stack + bottom tabs; type-safe params and deep linking. Explicit screen set fits institutional apps. |
| **State** | Zustand + TanStack Query | Zustand for global UI/auth; React Query for server state (cache, mutations, loading/error). |
| **API layer** | Axios (or fetch) behind one client factory | Base URL from env; interceptors for auth and token refresh. All endpoints go through this client. |
| **Authentication** | OIDC/OAuth2 (Concordia SSO) | expo-auth-session or react-native-app-auth; store only access/refresh tokens; design for refresh and logout (revocation). |
| **Secure storage** | expo-secure-store | Tokens and session data only. Never AsyncStorage for secrets. |
| **Form handling** | React Hook Form + Zod | Design system Input/Select; screens compose and pass schema-based validation. |
| **Testing** | Jest + React Native Testing Library; Detox or Maestro for E2E | Jest/RNTL on every PR; E2E on release or nightly. |
| **Lint / format** | ESLint (React Native + TS) + Prettier | Enforce in CI. Optional: commitlint + husky. |
| **Analytics / logging** | Logger service (dev vs prod; no PII) | Analytics behind an interface; no hardcoded events in UI. |
| **Theming** | Design tokens in TS + ThemeProvider | Components use `useTheme()` or token imports; no hardcoded colors/fonts/spacing. |

---

## 2. App architecture

### 2.1 Folder structure

```
src/
  app/                    # App shell: App.tsx, providers (theme, query, auth)
  navigation/             # Navigator config, linking, types
  screens/                # home, auth, profile, etc. (placeholder screens)
  components/
    design-system/        # Button, Text, Card, Input, Screen
    feature/              # Feature-specific components
  design-system/
    tokens/               # primitives, semantic, index
    theme/                # theme object, ThemeProvider, useTheme
  hooks/                  # useAuth, useTheme, useApi (stubs)
  services/               # api client, auth service, storage, logger
  state/                  # Zustand store(s) (e.g. auth)
  utils/                  # helpers; platform/
  api/                    # API client factory, endpoint modules
  auth/                   # auth service, types, constants
  accessibility/          # constants (minTouchTarget), helpers
  types/                  # shared TS types
  platform/               # .native.ts / .ios / .android when needed
  __tests__/              # example and colocated tests
```

Root: `app.json` / `app.config.js`, `package.json`, `tsconfig.json`, `babel.config.js`, `.eslintrc`, `.prettierrc`, `docs/CONCORDIA_APP_ARCHITECTURE.md`.

### 2.2 Boundaries and data flow

- **App shell**: Root layout, theme + auth + query providers, NavigationContainer. No business logic.
- **Screens**: Thin; compose UI from design system and call hooks only. No direct API or raw fetch.
- **Design system**: Components consume theme/tokens only; no feature logic.
- **Data flow**: User action → Screen → Hook (or state) → Service/API → Response → State/Query cache → Re-render.

Screens do not call the API client directly; they use hooks that encapsulate API and state.

---

## 3. Design system & tokens

### 3.1 Token layers

1. **Primitive**: Raw values (e.g. `blue500`, `spacing4`, `fontSize16`). Platform-agnostic; can be shared with web via JSON or a shared package.
2. **Semantic**: Meaningful names (e.g. `color.primary`, `color.text.subtle`, `spacing.section`, `typography.body`). Map primitives to roles (brand, background, text, borders, feedback).
3. **Component** (optional): Component-specific tokens (e.g. `button.background.primary`, `input.border.radius`). Prefer semantic tokens so components stay generic.

### 3.2 Web token adaptation

- If the website uses CSS variables or JS tokens: define a **token pipeline**: web tokens (JSON/JS) → optional transform → RN token files (TS).
- Mobile may use different spacing/typography (e.g. touch targets, readability); keep **semantic names** aligned so that “mobile `spacing.section` = web `spacing.lg`” is documented.
- Document the mapping in this file or in `design-system/tokens/README.md`.

### 3.3 Theme structure

- One **Theme** type: `color`, `typography`, `spacing`, `radius`, `elevation`, `motion`, and optional `component` overrides.
- Light and dark themes are two such objects. Provider injects the theme; `useTheme()` returns it.
- Components use theme or semantic token keys only; no raw primitives in component props.

### 3.4 Naming and governance

- Convention: `category.subcategory.variant` (e.g. `color.text.primary`, `spacing.section`).
- All new tokens go through the same token files; no one-off values in components.
- **Do not**: Put hex/rgba or magic numbers in component files; bypass the theme for “quick” fixes.

---

## 4. Security

- **Auth**: OIDC/OAuth2 with PKCE; redirect URI and client id from env. Access + refresh tokens in secure storage only; attach token via API client interceptor. Refresh before expiry; logout = revoke + clear storage. No credentials in code or logs.
- **Token handling**: On 401, attempt refresh once and retry; on failure, clear storage and redirect to login. Short-lived access tokens; refresh token stored securely.
- **Secure storage**: Use only SecureStore (or Keychain) for tokens and any PII that must persist. Document what is stored where.
- **Role-aware access**: If roles (e.g. student vs staff) are added, keep minimal claims from IDP; enforce feature/screen visibility in app; sensitive operations re-validated by backend.
- **Environment**: All env via `EXPO_PUBLIC_*` or `app.config.js`; no secrets in repo. Use different configs for dev/staging/prod (e.g. EAS environment secrets).
- **API**: HTTPS only; certificate pinning optional for high-sensitivity. No logging of request/response bodies.
- **Student data**: Minimize on-device storage; prefer “fetch when needed” and short TTL cache. No PII in logs or analytics. Consider FERPA/PCI as applicable.
- **Logging**: Dev: verbose; prod: errors and minimal audit events; strip PII and tokens in the central logger.
- **Release hardening**: See Phase 3 checklist (env, secure storage, no debug endpoints, logging level, store listing, privacy policy).

---

## 5. Accessibility

- **Screen reader**: Every interactive element has `accessibilityLabel` (and `accessibilityHint` where useful). Images have meaningful `accessibilityLabel` or `accessibilityRole="image"`. Use `accessibilityRole` (button, link, header, etc.) consistently.
- **Semantic structure**: Prefer Pressable/Button; avoid “clickable” divs. Group content with `accessibilityRole="group"` and optional `accessibilityLabel`.
- **Focus**: Focus order follows visual order; modals trap focus. Document focus behavior for custom components.
- **Touch targets**: Minimum 44×44 pt (iOS) / 48×48 dp (Material). Design system components enforce via `minHeight`/`minWidth` or `hitSlop`; document in tokens (e.g. `touchTargetMinSize`).
- **Contrast**: Semantic colors meet WCAG AA (e.g. 4.5:1 for body text). Theme can expose a highContrast variant.
- **Dynamic type**: Theme typography scales with system font size; avoid fixed sizes for body text.
- **Reduced motion**: Respect `AccessibilityInfo.isReduceMotionEnabled()`; reduce or disable animations when enabled.
- **Reusable patterns**: Design system components export consistent a11y props; one place to fix (e.g. all primary buttons have role=button and label from children or prop).

---

## 6. Extensibility

The app is designed so future modules can be added without breaking the foundation.

- **Maps / place intelligence**: Campus home is a `react-native-maps` canvas ([CampusHomeScreen](../src/screens/campus/CampusHomeScreen.tsx)). Pin coordinates from Open Data `facilities/buildinglist/` via [useBuildings](../src/hooks/useBuildings.ts). Building services, departments, and amenities live in the consolidated local catalog at [src/data/buildings/](../src/data/buildings/) — regenerate with `npm run sync:buildings`. See Greenhouse doc *Buildings catalog (PoC)*. After adding or patching `react-native-maps`, rebuild the native dev client (`expo run:ios` / `expo run:android`). Android needs `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`.
- **Course schedule**: Add `screens/courses`; data via React Query and a dedicated API module; reuse design system (Card, Text, Button).
- **Events listing**: Add `screens/events`; same pattern (hooks + API + design system).
- **Student services / resources**: Add screens under `screens/resources` or similar; link from home or tabs.
- **Grades**: Add `screens/grades`; sensitive data; ensure auth and short cache; no PII in logs.
- **Account balance**: Add screen or section under profile; same API + auth patterns.
- **Notifications**: Add push (e.g. Expo Notifications); store FCM/token in backend only; handle in a dedicated service.
- **Profile / account settings**: Extend `screens/profile`; settings as list of design system components; auth and secure storage for sensitive options.
- **Campus-specific tools**: Add feature modules under `components/feature/` and `screens/`; use platform or env to toggle by campus if needed.

Rule: New features use existing navigation, design system, API client, auth, and hooks. No duplicate auth or API logic per feature.

---

## 7. Phase 3 summary: Testing, CI/CD, release, technical debt

### 7.1 Testing strategy

- **Unit**: Utils, hooks, services (pure logic). Jest.
- **Component**: Design system and key screens. React Native Testing Library; assert labels, roles, and token-driven styles where useful.
- **E2E**: Critical flows (e.g. login, home, one feature). Detox or Maestro; run on release branches or nightly.
- **Coverage**: Define goals (e.g. 80% for utils/services); run Jest with coverage in CI. Document how to run each type in README.

### 7.2 CI/CD

- **EAS Build and Submit**: Build iOS/Android with EAS; submit to TestFlight / Play Internal.
- **Branch strategy**: e.g. `main` → production; feature branches → PR → merge after checks.
- **EAS Update**: Use for JS-only fixes without full store review.
- **Secrets**: Environment and signing secrets in EAS; never in repo.
- **Versioning**: Bump version in `app.json`/`app.config.js` per release; align with store metadata.

### 7.3 Release readiness checklist

- [ ] Prod env (API URL, OIDC client id, etc.) set in EAS; no debug endpoints.
- [ ] Secure storage verified for tokens; nothing sensitive in AsyncStorage.
- [ ] Logging level set to prod (no verbose; no PII).
- [ ] Accessibility pass (screen reader, touch targets, contrast).
- [ ] Performance check (no obvious jank; list rendering optimized if needed).
- [ ] Store listing and privacy policy ready; build signed and submitted.

### 7.4 Technical debt to avoid

- Do not hardcode tokens (colors, spacing, fonts) in components.
- Do not call the API client directly from screens; use hooks.
- Do not log PII or tokens.
- Do not store tokens in AsyncStorage.
- Do not skip accessibility on “simple” components.
- Maintain a single API client and a single auth flow; extend, don’t duplicate.
