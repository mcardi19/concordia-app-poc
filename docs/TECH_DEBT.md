# Tech debt

What is fake, what is missing, and what is known-wrong. Written 2026-08-28
from a sweep of the codebase, not from memory. Each entry says where it lives
and what "done" looks like, so it can be picked up cold.

Ordered by blast radius: the first section decides how much of the rest
matters.

---

## 1. The app is not signed in to anything

`src/auth/authService.ts` is a stub. `login()` writes the literal string
`'stub-sis-token'` to secure storage and sets a hardcoded user — id
`401872231`, "Maya R. Okonkwo". There is no OIDC flow.

Everything downstream of SIS inherits this:

| Hook | State |
| --- | --- |
| `useSchedule` | **wired into zero screens** — see §2 |
| `useGrades` | called by `GradesScreen`, cannot authenticate |
| `useAccountBalance` | called by 2 screens, cannot authenticate |

`src/api/client.ts:32` has a matching TODO: no refresh-then-retry, so a 401
just fails.

**Done looks like:** real OIDC (`expo-auth-session` or
`react-native-app-auth`) against Hub SSO, a real token in `secureStorage`, and
the 401 path in `client.ts` refreshing before it gives up.

Unblocked by this: real schedule, real grades, real balance, real student
identity — which removes most of §2.

---

## 2. Screens running on mock data

About 825 lines of hand-written fixtures across six files. These are not
placeholders in the "lorem ipsum" sense — they are plausible, which is what
makes them dangerous in a demo.

| File | Lines | Feeds | Real source |
| --- | --- | --- | --- |
| `components/feature/today/todayData.ts` | 221 | Home: pinned, attention, updates, campus | SIS + CMS |
| `screens/academics/academicsData.ts` | 204 | Academics: courses, GPA, dates | SIS |
| `screens/me/notificationsData.ts` | 184 | Me: notifications | none yet |
| `components/feature/library/libraryData.ts` | 91 | Library: loans, curated books | library API |
| `services/shuttle/shuttleData.ts` | 74 | Shuttle timetable | published PDF/feed |
| `components/feature/schedule/scheduleMockData.ts` | 51 | **the whole Schedule tab** | `useSchedule` |

**`scheduleMockData` is the sharpest one.** `useSchedule` already exists and
is correct, and is imported by no screen. `ScheduleScreen` reads
`MOCK_WEEK_EVENTS` directly. Two consequences:

- Events are keyed by **day-of-week**, so every Wednesday in every week shows
  the same four classes. Invisible while the week was frozen; the month/week
  pager now exposes it. Real events need dates.
- The four courses are real catalog entries with real instructors, which
  makes the fixture *more* convincing, not less.

**Done looks like:** `ScheduleScreen` calling `useSchedule(weekMonday)` and
`scheduleMockData.ts` deleted. Blocked on §1.

Also in that file: `MOCK_SCHEDULE_EVENTS` is `@deprecated` and still exported.

---

## 3. Campus services: schema done, data not

`src/data/campusServiceRecords.ts` holds **8 of roughly 200** services. Six
are `provenance: 'verified'` (a person read the linked page); two are
`'scraped'` and unconfirmed — those render a warning on their detail screen.

Constraints found the hard way, worth not rediscovering:

- **concordia.ca publishes nothing structured.** No JSON-LD, empty
  `og:description`. Every seeded field came from reading prose. A broad crawl
  produces mostly empty rows and a few confidently wrong ones.
- **Hours are often open-ended.** "Walk-ins begin at 9 a.m." with no closing
  time. `closesMinutes` is therefore optional and the UI says "Open ·
  walk-ins from 9 AM". `serviceStatus.test.ts` asserts that label never
  contains "until". Do not add a close that is not published.
- **Scraped emails are worse than none.** The clinic page yields three staff
  addresses and no service address; that record deliberately has no `email`.
- **Feed ↔ record matching is fuzzy.** `matchServiceRecord` joins on a
  normalised name because the feed has no stable key: feed says "Health
  Services / Guy-De Maisonneuve Building", record says "Health Services
  Clinic / GM-200". Expect misses and occasional mismatches as records grow.

Not built: the bookmark control from SR-2/SR-3 (no saved-services store), and
hero photography — the masthead is a brand gradient and there is no
`heroImage` field.

**Done looks like:** a stable service id on the feed (kills the fuzzy match),
and the remaining ~190 records populated with honest `provenance`.

---

## 4. Category membership is inferred from words

`SearchCategoryScreen` decides which services belong to a category by matching
the category's own words against each service's name and building, because
the feed has no category field. It over-matches on common words — "Classrooms"
lands under *Study help & tutoring* — and misses anything phrased differently.

**Done looks like:** a taxonomy on the feed.

---

## 5. Course detail: two sections have no source

`CourseDetailBody` follows the "Iteration I" design except for **Assessments**
and **Materials**. The design shows essay weights and lecture slides; there is
no source for either. Needs Moodle. They were left out rather than filled with
invented coursework, which would read as real.

Related, in the same area:

- Open Data's `course/schedule` returns **no rows** for these courses, so the
  Schedule section is derived from the local timetable instead.
- Course lookup is **two hops** — the timetable has no course id, so
  `fetchCourseDetail` splits "PHIL 232" and resolves the id through the
  catalog first. Adding `courseID` to the event type removes a request.
- Descriptions arrive with **apostrophes stripped upstream** — "sadresse",
  "dexpression", "léquivalent". A data-owner problem, not ours to patch in
  the client, but worth one report.

---

## 6. Faculty profiles are hand-mapped

Four instructors carry a `professorFpid`, set by hand. SIS gives an
instructor *name*, not a profile id, and the ProfileAPI has **no discovery or
search endpoint** — every route needs an id you already hold.

Two facts that cost real time to establish:

- `fpid` is a **name slug** ("marc-lafrance"), not a number.
- ProfileAPI department ids are **not** the Open Data `deparmentCode` values;
  those return zero profiles.

Anyone unmatched renders as plain text, which is the intended fallback.

**Done looks like:** an instructor id on the SIS schedule feed, or a
name→fpid lookup service.

---

## 7. `useServicesSearch` fakes its query state

`src/hooks/useServicesSearch.ts` hardcodes `isLoading: false, isError: false`
and reads a bundled list synchronously. Any UI branching on its loading or
error state is dead code — including the skeleton on the search screen, which
can never appear.

It also truncates an empty query to the first 50 rows, which is why
`SearchCategoryScreen` bypasses it and calls `getCampusServices` directly.

---

## 8. Known-wrong UI

- **`sourceHiddenSV` needs an invariant guard.** A fast refresh tears down the
  session-expand overlay without running the close path, so the shared value
  stays `true` and the Home card renders blank with nothing above it.
  Development-only, but it has cost many reload cycles. A few lines.
- **"Read more" overlaps the status bar** when the session sheet is scrolled —
  content is not clearing the top safe-area inset.
- **The scroll-edge blur bands.** Stacked `BlurView`s approximate a
  variable-radius blur, which is not public API. More steps narrows the
  banding; it cannot remove it. Untested alternative: keep the greeting as an
  overlay *and* leave native `scrollEdgeEffects: { top: 'soft' }` on, dropping
  the custom curtain — the greeting would blur as it scrolls under, which may
  read fine since it is fading anyway.
- **Paging is inconsistent by design.** The week strip carries your weekday
  across when you page; the month grid previews without moving the selection.
  Deliberate, possibly wrong.
- **Service hours render long** — "Mon, Tue, Wed, Fri from 9 AM · Thu from
  10 AM" wraps to two lines. Truthful but unwieldy.

---

## 9. No roman middleweight in the brand font

Local Gill Sans Nova is Book (400), Heavy (800), ExtraBold (900), UltraBold —
nothing between. The session card title therefore steps 800 → 400 with no
intermediate. `brandFaceForWeight` maps 500/600/700 onto the nearest file,
which is a lie the type system cannot catch.

**Done looks like:** the licensed Medium or Semibold TTF in `assets/fonts/`.
Not a code change.

---

## 10. Housekeeping

- **14 lint errors**, all `@typescript-eslint/no-require-imports` on image
  imports: `MainTabs.tsx` (10), `TodayStack.tsx` (2), `screenOptions.ts` (1),
  `placeActions.ts` (1). Either migrate to ESM imports or scope a rule
  exception for asset requires — currently the lint output is noise that
  hides new errors.
- **Deprecated exports still live**, kept for import stability:
  `MOCK_SCHEDULE_EVENTS`, `useTabBarScrollInset`'s predecessor in
  `tabBarInset.ts`, three in `SessionHero.tsx`, two in
  `sessionSharedTransition.ts`. Safe to remove once callers are confirmed
  gone.
- **Two native patches** in `patches/` — `react-native-screens` (tab bar
  appearance) and `react-native-maps` (marker selection animation). Both are
  load-bearing and both will need reapplying on upgrade.
- **DesignSync authorization lapses mid-session** and `/design-login` needs an
  interactive terminal. When it is gone, design sources have to be pasted in.
