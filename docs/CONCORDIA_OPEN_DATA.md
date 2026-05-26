# Concordia Open Data API — setup

Official docs and endpoint reference: [opendataConcordiaU/documentation](https://github.com/opendataConcordiaU/documentation/tree/master).

**Schemas for UI / Claude Design:** see **[CONCORDIA_OPEN_DATA_DATA_SHAPES.md](./CONCORDIA_OPEN_DATA_DATA_SHAPES.md)** (per-endpoint fields and example-level types).

## Where to put your **User** and **Key**

1. In the **project root** (same folder as `package.json` and `app.config.js`), create a file named **`.env`** if it does not exist.

2. Add your Concordia developer portal credentials (**use your new rotated key**, not any key shared in chat or screenshots):

   ```bash
   # Concordia Open Data — from https://opendata.concordia.ca/admin/ (application screen)
   CONCORDIA_OPENDATA_USER=your_numeric_user_id
   CONCORDIA_OPENDATA_API_KEY=your_application_api_key
   ```

   - **`CONCORDIA_OPENDATA_USER`** matches the **User** field (e.g. `995`).
   - **`CONCORDIA_OPENDATA_API_KEY`** matches the **Key** field (the long hexadecimal string).

3. **Restart the Expo dev server** (`Ctrl+C`, then `npm start`) after changing `.env`. Metro only picks up `app.config.js` / env changes on a fresh start.

4. **Never commit `.env`.** This repo ignores `.env` and `.env.*` (except `.env.example`). Copy from [`.env.example`](../.env.example) and fill in locally.

## How the app reads these values

| Step | What happens |
| ---- | ------------ |
| Root `.env` | Defines `CONCORDIA_OPENDATA_*` (not `EXPO_PUBLIC_*`). |
| [`app.config.js`](../app.config.js) | Reads `process.env` at startup and copies them into `expo.extra` as `concordiaOpenDataUser` and `concordiaOpenDataApiKey`. |
| [`src/config/concordiaOpenData.ts`](../src/config/concordiaOpenData.ts) | Reads `expo-constants` → `Constants.expoConfig.extra` and exposes `getConcordiaOpenDataCredentials()`. |
| [`src/api/concordiaOpenDataClient.ts`](../src/api/concordiaOpenDataClient.ts) | Creates an axios client with **HTTP Basic Auth** (`user:key`) and base URL `https://opendata.concordia.ca/API/v1`. |

## Using the client in code

```ts
import {
  isConcordiaOpenDataConfigured,
  fetchLibraryHours,
} from '@/api/concordiaOpenDataClient';

if (isConcordiaOpenDataConfigured()) {
  const hours = await fetchLibraryHours('2026-05-26');
}
```

Add more endpoints by calling `getConcordiaOpenDataClient().get(...)` with paths from the [official docs](https://github.com/opendataConcordiaU/documentation/tree/master) (e.g. `library/occupancy`, `course/catalog`, …).

## Production / EAS builds

Values passed through `expo.extra` are **embedded in the app binary** at build time. For production, set the same variable names as **EAS Secrets** (or your CI env) so `app.config.js` receives them during `eas build`. For maximum secrecy, use a **small backend proxy** instead of shipping keys in the client; for a POC, EAS secrets + quota limits are a common compromise.

## License

Open data is under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode); follow Concordia’s terms when shipping features.
