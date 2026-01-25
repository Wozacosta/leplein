# Story 1.3: Station API Integration & SWR Hook

Status: done

## Story

As a user,
I want the app to fetch nearby fuel stations from the API,
So that I can see stations close to my location.

## Acceptance Criteria

1. **Given** valid coordinates are available in GeolocationContext
   **When** the useStations hook is called
   **Then** stations are fetched from `https://api.prix-carburants.2aaz.fr/stations/around/{lat},{lng}`
   **And** the request includes `Accept: application/json` header
   **And** results are cached by SWR

2. **Given** the API returns station data
   **When** the data is processed
   **Then** each station has id, name/brand, address, coordinates, and fuel prices
   **And** distance from user is included in the response (API provides this)

## Tasks / Subtasks

- [x] Task 1: Verify useStations hook implementation (AC: #1)
  - [x] 1.1: Verify hook fetches from correct endpoint with lat/lng coordinates
  - [x] 1.2: Verify `Accept: application/json` header is included in fetcher
  - [x] 1.3: Verify SWR caching configuration (dedupingInterval, revalidateOnFocus)
  - [x] 1.4: Verify hook returns null URL when coordinates are not available (conditional fetching)

- [x] Task 2: Verify Station type definitions match API response (AC: #2)
  - [x] 2.1: Verify Station interface includes id, Brand (name), Address, Distance
  - [x] 2.2: Verify StationFuelPrice interface includes fuel id, name, Price, Update, available
  - [x] 2.3: Test with actual API response to confirm type compatibility

- [x] Task 3: Add unit tests for useStations hook (AC: #1, #2)
  - [x] 3.1: Set up test framework (Vitest + React Testing Library) - configured in this story
  - [x] 3.2: Write test: hook returns loading state initially
  - [x] 3.3: Write test: hook fetches data when coordinates provided
  - [x] 3.4: Write test: hook returns null/no fetch when coordinates are null
  - [x] 3.5: Write test: hook handles API error gracefully

- [x] Task 4: Integration verification (AC: #1, #2)
  - [x] 4.1: Verify StationList component correctly uses useStations hook
  - [x] 4.2: Run manual end-to-end test: grant location → verify stations load
  - [x] 4.3: Verify station data displays correctly (brand, address, distance, prices)
  - [x] 4.4: Run `pnpm build` - verify no errors
  - [x] 4.5: Run `pnpm lint` - verify no issues

## Dev Notes

### API Discovery Findings

**Critical Finding:** The 2aaz.fr API has two distinct endpoints with different data:
1. `/stations/around/{lat},{lng}` - Returns station list WITHOUT prices
2. `/station/{id}` - Returns station detail WITH prices

The hook was updated to:
1. First fetch list of stations around the location
2. Then fetch details for each station in parallel to get prices
3. Merge distance from list response into detail response

### Type Corrections Applied

**API uses different field names than originally documented:**
- `shortName` (camelCase) instead of `short_name` (snake_case)
- `available: boolean` instead of `rupture: boolean` (inverted logic)
- Price is only present in detail endpoint, not list endpoint

### Architecture Requirements

**From architecture.md - SWR Hook Pattern:**
- All API data access through custom hooks
- Hook returns: { data, error, isLoading, mutate }
- Calls 2aaz.fr directly (public API, no key needed)
- Fetcher must include `Accept: application/json` header

### Project Structure Notes

**Files involved in this story:**
| File | Purpose | Status |
|------|---------|--------|
| `src/hooks/useStations.ts` | SWR hook for stations | MODIFIED |
| `src/lib/fetcher.ts` | Generic fetcher with headers | VERIFIED |
| `src/lib/api.ts` | API endpoints | VERIFIED |
| `src/types/station.ts` | TypeScript interfaces | MODIFIED |
| `src/hooks/__tests__/useStations.test.tsx` | Unit tests | NEW |
| `src/components/stations/StationCard.tsx` | Station display | MODIFIED |
| `src/components/stations/FuelPriceRow.tsx` | Fuel price display | MODIFIED |
| `src/components/stations/StationList.tsx` | Station list | MODIFIED |

### References

- [Source: epics.md#Story 1.3: Station API Integration & SWR Hook]
- [Source: architecture.md#API & Communication Patterns]
- [Source: architecture.md#SWR Hook Pattern]
- [Source: project-context.md#Data Fetching]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Build output: Compiled successfully in 1678.3ms, TypeScript in 1845.6ms
- Lint: No errors
- Tests: 12 passed (8 new useStations tests + 4 existing ErrorMessage tests)

### Completion Notes List

**Task 1 - useStations Hook Verification:**
- Hook correctly fetches from `/stations/around/{lat},{lng}` endpoint
- Accept: application/json header is included via fetcher.ts
- SWR configured with dedupingInterval: 60000ms, revalidateOnFocus: false
- Hook returns null URL when coordinates are null (conditional fetching works)
- **Enhancement:** Hook now fetches station details in parallel to get prices (list endpoint doesn't include prices)

**Task 2 - Type Definitions Fixed:**
- Station interface updated: uses `shortName` (camelCase) per actual API response
- StationFuelPrice interface updated: uses `available` instead of `rupture`, `shortName` instead of `short_name`
- Price field made optional since list endpoint doesn't return it
- Added StationListItem type for list endpoint response
- Verified types against actual API calls using curl

**Task 3 - Unit Tests Added:**
- Created `src/hooks/__tests__/useStations.test.tsx` with 8 comprehensive tests
- Tests cover: null coordinates, loading state, successful fetch, Accept header, error handling, distance merging
- All 8 tests passing

**Task 4 - Integration Verification:**
- Updated StationCard.tsx: use `shortName` instead of `short_name`, handle optional Distance
- Updated FuelPriceRow.tsx: use `shortName` and `!available` instead of `rupture`, handle optional Price
- Updated StationList.tsx: handle optional Distance, use `!available` for out-of-stock check
- Build: Passed (Turbopack, 1678.3ms)
- Lint: Passed (0 errors)
- Tests: 12 passed

### File List

**New Files:**
- src/hooks/__tests__/useStations.test.tsx (unit tests for useStations hook)
- src/components/ui/__tests__/ErrorMessage.test.tsx (unit tests for ErrorMessage component)
- src/test/setup.ts (Vitest test setup with Testing Library)
- vitest.config.ts (Vitest configuration)

**Modified Files:**
- src/hooks/useStations.ts (enhanced to fetch prices from detail endpoint)
- src/types/station.ts (fixed to match actual API response)
- src/components/stations/StationCard.tsx (use shortName, handle optional Distance)
- src/components/stations/FuelPriceRow.tsx (use shortName, available, optional Price)
- src/components/stations/StationList.tsx (handle optional Distance, use available)
- package.json (added Vitest, Testing Library, jsdom dev dependencies)

## Change Log

| Date | Change |
|------|--------|
| 2026-01-25 | Story created with comprehensive context from epics, architecture, and previous stories |
| 2026-01-25 | API analysis: discovered list endpoint doesn't return prices, detail endpoint does |
| 2026-01-25 | Updated types to match actual API (shortName, available instead of short_name, rupture) |
| 2026-01-25 | Enhanced useStations hook to fetch prices from detail endpoint in parallel |
| 2026-01-25 | Updated components (StationCard, FuelPriceRow, StationList) for new type structure |
| 2026-01-25 | Added 8 unit tests for useStations hook - all passing |
| 2026-01-25 | Build and lint pass - story ready for review |
| 2026-01-25 | **Code Review:** Added concurrency limit (5 parallel requests) to prevent API rate limiting |
| 2026-01-25 | **Code Review:** Added console.warn logging for failed detail fetches (was silent) |
| 2026-01-25 | **Code Review:** Added test for partial detail fetch failure scenario |
| 2026-01-25 | **Code Review:** Updated File List to include all new files (vitest.config.ts, test setup, etc.) |
| 2026-01-25 | **Code Review:** All 13 tests pass, build and lint pass - story complete |
