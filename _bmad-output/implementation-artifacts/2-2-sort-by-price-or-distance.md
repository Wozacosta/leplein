# Story 2.2: Sort by Price or Distance

Status: done

## Story

As a user,
I want to sort stations by price or distance,
So that I can find the cheapest or closest station.

## Acceptance Criteria

1. **Given** the station list is displayed
   **When** the user views sort options
   **Then** two options are available: "Price (lowest)" and "Distance (closest)"
   **And** "Price (lowest)" is the default sort order

2. **Given** the user selects "Price (lowest)"
   **When** the sort is applied
   **Then** stations are ordered from cheapest to most expensive (for selected fuel type)
   **And** sort changes reflect instantly (< 100ms)

3. **Given** the user selects "Distance (closest)"
   **When** the sort is applied
   **Then** stations are ordered from nearest to farthest
   **And** sort changes reflect instantly (< 100ms)

## Tasks / Subtasks

- [x] Task 1: Verify sort controls are implemented (AC: #1)
  - [x] 1.1: Confirm two sort options exist in StationList.tsx
  - [x] 1.2: Verify "Price (lowest)" is the default sort order
  - [x] 1.3: Verify sort buttons have proper 44px touch targets

- [x] Task 2: Verify price sorting logic (AC: #2)
  - [x] 2.1: Confirm sorting orders stations from cheapest to most expensive
  - [x] 2.2: Confirm sorting respects selected fuel type filter
  - [x] 2.3: Confirm out-of-stock stations are sorted to bottom (price = Infinity)

- [x] Task 3: Verify distance sorting logic (AC: #3)
  - [x] 3.1: Confirm sorting orders stations from nearest to farthest
  - [x] 3.2: Confirm stations without distance data are sorted to bottom

- [x] Task 4: Verify instant response (AC: #2, #3)
  - [x] 4.1: Confirm sorting uses useMemo (client-side, no API call)
  - [x] 4.2: Confirm sort changes are instant (< 100ms)

- [x] Task 5: Final validation
  - [x] 5.1: Run `pnpm build` - verify no errors
  - [x] 5.2: Run `pnpm lint` - verify no issues
  - [x] 5.3: Run `pnpm test` - verify all tests pass
  - [x] 5.4: Manual verification of both sort options

## Dev Notes

### Implementation Status: ALREADY COMPLETE

**IMPORTANT:** This story's functionality has been **fully implemented** as part of story 2-1 (Fuel Type Filter). The StationList component already contains:

1. **Sort control buttons** - "Moins cher" (Price) and "Plus proche" (Distance)
2. **Default sort order** - "price" is the initial state
3. **Sorting logic** - Full implementation in `filteredAndSortedStations` useMemo
4. **Instant response** - Uses client-side useMemo with proper dependencies

### Existing Implementation Analysis

**Sort Controls (StationList.tsx:89-110):**
```tsx
<div className="flex gap-2 mb-4">
  <button
    type="button"
    onClick={() => setSortOrder("price")}
    className={`flex items-center justify-center px-4 min-h-[44px] text-sm font-medium rounded-lg ${
      sortOrder === "price"
        ? "bg-blue-600 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    Moins cher
  </button>
  <button
    type="button"
    onClick={() => setSortOrder("distance")}
    className={`...`}
  >
    Plus proche
  </button>
</div>
```

**Sorting Logic (StationList.tsx:29-57):**
```tsx
const filteredAndSortedStations = useMemo(() => {
  if (!stations) return [];

  // Step 1: Filter by fuel availability
  let filtered = stations;
  if (selectedFuelId !== undefined) {
    filtered = stations.filter((station) => {
      const fuel = station.Fuels.find((f) => f.id === selectedFuelId);
      return fuel && fuel.available;
    });
  }

  // Step 2: Sort
  return [...filtered].sort((a, b) => {
    if (sortOrder === "distance") {
      const distA = a.Distance?.value ?? Infinity;
      const distB = b.Distance?.value ?? Infinity;
      return distA - distB;
    }

    // Sort by price of selected fuel
    const getFuelPrice = (station: Station) => {
      const fuel = selectedFuelId
        ? station.Fuels.find((f) => f.id === selectedFuelId)
        : station.Fuels[0];
      const isOutOfStock = fuel ? !fuel.available : true;
      return isOutOfStock ? Infinity : (fuel?.Price?.value ?? Infinity);
    };

    return getFuelPrice(a) - getFuelPrice(b);
  });
}, [stations, sortOrder, selectedFuelId]);
```

### What the Dev Agent Needs to Do

**Verification only** - no code changes required:

1. **Run validation commands:**
   - `pnpm build` - ensure no build errors
   - `pnpm lint` - ensure no lint issues
   - `pnpm test` - ensure all tests pass

2. **Manual verification:**
   - Open app with granted location
   - Verify "Moins cher" button is active by default (blue background)
   - Click "Plus proche" - verify stations reorder by distance
   - Click "Moins cher" - verify stations reorder by price
   - Select a fuel type, verify sorting respects the filter

3. **Optional: Add unit tests** for sorting logic if not already covered

### Architecture Compliance

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Named exports only | ✅ | `export function StationList` |
| useMemo for client-side filtering | ✅ | `filteredAndSortedStations` uses useMemo |
| 44px touch targets | ✅ | `min-h-[44px]` on sort buttons |
| Tailwind class order | ✅ | Layout → Box model → Typography → Visual → Interactive |
| Instant response (< 100ms) | ✅ | Client-side useMemo, no API calls |

### Previous Story Intelligence (from 2-1)

**Learnings applied:**
- `available: boolean` is the correct field for stock status (not `rupture`)
- `Distance?.value` uses optional chaining since field can be undefined
- Stations without price/distance are sorted to bottom using `Infinity`
- Touch targets maintained at 44px minimum

### Project Structure Notes

No new files needed. Existing files are in correct locations:
- `src/components/stations/StationList.tsx` - contains all sorting logic

### Testing Notes

**Existing tests cover:**
- StationList component rendering
- Filtering logic

**Consider adding (optional):**
- Unit tests specifically for sorting logic
- Test default sort order is "price"
- Test sort toggle behavior

### References

- [Source: epics.md#Story 2.2: Sort by Price or Distance]
- [Source: architecture.md#Implementation Patterns & Consistency Rules]
- [Source: project-context.md#Critical Implementation Rules]
- [Source: 2-1-fuel-type-filter.md#Dev Notes]
- [Source: src/components/stations/StationList.tsx]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A - Verification-only story, no code changes required.

### Completion Notes List

- **Build validation:** ✅ `pnpm build` passed with no errors (Next.js 16.1.4, Turbopack)
- **Lint validation:** ✅ `pnpm lint` passed with no issues
- **Test validation:** ✅ All 38 tests passed (6 test files)
- **Code verification:** Sort functionality already fully implemented in StationList.tsx
  - Two sort options: "Moins cher" (Price) and "Plus proche" (Distance)
  - Default sort: "price" (useState initialization)
  - Price sorting: Orders by selected fuel price, out-of-stock stations → Infinity
  - Distance sorting: Orders by Distance.value, missing → Infinity
  - Instant response: Uses useMemo with proper dependencies
  - Touch targets: 44px minimum height on sort buttons

### Change Log

| Date | Change |
|------|--------|
| 2026-01-25 | Story created - functionality already implemented in StationList.tsx |
| 2026-01-25 | Final validation completed - build, lint, tests all pass. Status → review |
| 2026-01-25 | Code review completed: Added 6 unit tests for sorting logic (price sort, distance sort, toggle behavior). All 44 tests pass. Status → done |

### File List

- `src/components/stations/StationList.tsx` - Contains all sorting implementation (transition-colors added during review)
- `src/components/stations/__tests__/StationList.test.tsx` - Modified: Added 6 sorting tests
