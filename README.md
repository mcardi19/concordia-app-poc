# Concordia University Mobile App

Production-ready React Native (Expo) foundation for the Concordia institutional mobile app. Shared codebase for iOS and Android with a token-driven design system, secure auth, and accessibility built in.

## Docs

- **[Architecture & conventions](docs/CONCORDIA_APP_ARCHITECTURE.md)** – Stack, folder structure, design system, security, accessibility, testing, CI/CD, and technical debt to avoid.

## Prerequisites

- Node.js 18+
- npm (or yarn)
- Expo Go app on device (for quick testing), or Xcode / Android Studio for simulators

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

Then press `i` for iOS simulator or `a` for Android, or scan the QR code with **Expo Go** on your phone.

**Expo Go:** This project uses **Expo SDK 54** to match the Expo Go app (SDK 54) on the App Store and Google Play. If you see “project is incompatible,” ensure your Expo Go and this project both target the same SDK (see `package.json`).

## Scripts

| Command    | Description                    |
| ---------- | ------------------------------ |
| `npm start` | Start Expo dev server          |
| `npm run ios` | Start and open iOS simulator   |
| `npm run android` | Start and open Android emulator |
| `npm test` | Run Jest unit/component tests  |
| `npm run lint` | Run ESLint                     |
| `npm run format` | Format with Prettier           |

## Tests

- **Unit / component**: `npm test` (Jest + React Native Testing Library).
- Design system components and key screens should be covered; add tests next to features in `__tests__/` or colocated.
- E2E (Detox or Maestro) can be added for critical flows; see architecture doc.

## Project structure

See [docs/CONCORDIA_APP_ARCHITECTURE.md](docs/CONCORDIA_APP_ARCHITECTURE.md). Summary:

- `src/app` – App shell and providers
- `src/navigation` – Stack and tab navigators
- `src/screens` – Screen components (home, profile, auth)
- `src/components/design-system` – Button, Text, Card, Input, Screen (token-driven)
- `src/design-system/tokens` – Primitive and semantic tokens
- `src/design-system/theme` – Theme object and ThemeProvider
- `src/api` – API client factory
- `src/auth` – Auth service (OIDC stub)
- `src/services` – Logger, secure storage
- `src/state` – Zustand store(s)
- `src/hooks` – useAuth, useApi, useTheme
- `src/accessibility` – Constants (e.g. min touch target)

## Environment

Use `EXPO_PUBLIC_*` for build-time config (e.g. `EXPO_PUBLIC_API_URL`). See `app.config.js` and the architecture doc. Never commit secrets.
