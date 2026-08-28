# Open items

Known gaps and deferred work, with enough context to pick each one up cold.
Written 2026-08-28. Delete entries as they land.

## Campus services

The schema and status logic are done and tested; the data is not.

- **Populate the records.** `src/data/campusServiceRecords.ts` holds 8 of
  roughly 200 services. Six are `verified` (a person read the linked page),
  two are `scraped` and unconfirmed. `provenance` and `lastVerified` exist so
  this is visible — an unverified record renders a warning line on its detail
  screen. Committing a `stub` is fine.
- **The site gives almost nothing structured.** No JSON-LD, empty
  `og:description`. Everything in the seed came from reading prose. A broad
  crawl produces mostly empty rows and a few confidently wrong ones, which is
  why the list is short and hand-checked.
- **Do not trust scraped emails.** The clinic page yields three staff
  addresses (`andale.evans@`, …) and no service address. That record
  deliberately has no `email`.
- **Hours are often open-ended.** The site says "walk-ins begin at 9 a.m."
  with no closing time, so `closesMinutes` is optional and the UI shows
  "Open · walk-ins from 9 AM". A test asserts that label never says "until".
  Do not add a closing time that is not published.
- **Feed ↔ record matching is fuzzy.** `matchServiceRecord` joins the live
  campus feed to these records on a normalised name, because the feed has no
  stable key. The feed says "Health Services / Guy-De Maisonneuve Building",
  the record says "Health Services Clinic / GM-200". Expect misses and the
  occasional mismatch as records are added. A real id on the feed would
  replace it.
- **Not built:** the bookmark control in SR-2/SR-3 (no saved-services store),
  and hero photography — the masthead is a brand gradient, and there is no
  `heroImage` field on the schema yet.

## Course detail

- **Assessments and Materials are unbuilt.** The design has essay weights and
  lecture slides; there is no source for either. Needs Moodle. Inventing
  "Essay 2 · Due tonight · 20%" would read as real in a demo.
- **Open Data's course/schedule returns no rows** for these courses, so the
  Schedule section is derived from the local timetable instead.
- **Descriptions have corrupted apostrophes** upstream — "sadresse",
  "dexpression", "léquivalent". The feed strips them; not ours to fix in the
  app. Worth one report to whoever owns the data.
- **"Read more" overlaps the status bar** when the sheet is scrolled — the
  sheet's content is not clearing the top safe-area inset.

## Schedule

- **Mock events are keyed by day-of-week**, so every Wednesday in any week
  shows the same classes. Invisible while the week was frozen; real paging
  exposes it. Needs date-keyed events or a real SIS feed.
- **Paging is inconsistent by design, and may be wrong.** Paging the *week*
  strip carries your weekday across; paging the *month* grid previews without
  moving the selection. Revisit if it bites.

## Home and shared chrome

- **`sourceHiddenSV` needs an invariant guard.** A fast refresh tears down the
  session-expand overlay without running the close path, so the shared value
  stays `true` and the Home card renders blank with nothing on top of it. Only
  bites in development, but it has cost many reload cycles. A few lines.
- **The scroll-edge blur bands.** Stacked `BlurView`s approximate a
  variable-radius blur, which is not public API. More steps narrows the
  banding; it cannot remove it.
- **One untested option for that:** keep the greeting as an overlay *and*
  leave the native `scrollEdgeEffects: { top: 'soft' }` on, dropping the
  custom curtain. The greeting would be blurred as it scrolls under, which may
  read fine since it is fading anyway. Would give the native blur and keep the
  left-aligned title.

## Faculty profiles

- **Only four instructors are mapped.** SIS gives an instructor name, not a
  profile id, so `professorFpid` is set by hand in the mock data. Anyone
  unmatched renders as plain text, which is the intended fallback.
- **The ProfileAPI has no discovery endpoint.** Every route needs an id you
  already hold — `fpid`, `custid`, or a department id. `fpid` is a name slug
  ("marc-lafrance"), not a number. Department ids are not the Open Data
  `deparmentCode` values; those return zero profiles.

## Typography

- **There is no roman middleweight.** Local Gill Sans Nova is Book (400),
  Heavy (800), ExtraBold (900), UltraBold — nothing between, which is why the
  session card title steps 800 → 400. `brandFaceForWeight` maps 500/600/700
  onto the nearest file. Closing it needs the licensed Medium or Semibold TTF
  dropped into `assets/fonts/`, not a code change.

## Housekeeping

- **Lint has 14 pre-existing `require()` errors**, all image imports flagged
  by `@typescript-eslint/no-require-imports`. Untouched by recent work.
- **DesignSync authorization lapses mid-session.** Re-running `/design-login`
  needs an interactive terminal. When it is gone, paste design sources
  directly.
