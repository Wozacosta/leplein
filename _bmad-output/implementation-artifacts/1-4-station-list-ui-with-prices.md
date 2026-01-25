# Story 1.4: Station List UI with Prices

Status: ready-for-dev

## Story

As a user,
I want to see a list of nearby fuel stations with their prices,
So that I can quickly identify where to get fuel.

## Acceptance Criteria

1. **Given** stations data is loaded from the API
   **When** the station list renders
   **Then** each station card shows: brand/name, address, distance (formatted as "1.2 km"), and fuel prices
   **And** prices are formatted as "1,72 €/L" (French locale)
   **And** the list is mobile-first responsive (works on 320px+ viewports)
   **And** loading skeleton is shown while data is fetching
   **And** touch targets are minimum 44x44px

2. **Given** the user is on a larger screen (tablet/desktop)
   **When** viewing the station list
   **Then** the layout adapts appropriately (responsive breakpoints)

## Tasks / Subtasks

- [ ] Task 1: Audit existing StationCard component against AC requirements (AC: #1)
  - [ ] 1.1: Verify brand/name display (currently using `Brand?.shortName || Brand?.name || station.name`)
  - [ ] 1.2: Verify address display (street_line + city_line)
  - [ ] 1.3: Verify distance formatting uses `formatDistance()` producing "1.2 km" format
  - [ ] 1.4: Verify price formatting uses `formatPrice()` producing French locale "1,72 €"
  - [ ] 1.5: Document any gaps found

- [ ] Task 2: Audit touch targets for minimum 44x44px compliance (AC: #1)
  - [ ] 2.1: Measure "Y aller" (directions) button - must be at least 44x44px
  - [ ] 2.2: Measure copy address button - must be at least 44x44px
  - [ ] 2.3: Measure sort toggle buttons - must be at least 44x44px
  - [ ] 2.4: Fix any buttons below 44px minimum height

- [ ] Task 3: Verify loading skeleton implementation (AC: #1)
  - [ ] 3.1: Confirm StationListSkeleton shows during isLoading state
  - [ ] 3.2: Verify skeleton structure matches final card layout (prevents layout shift)
  - [ ] 3.3: Confirm minimum 3 skeleton items displayed

- [ ] Task 4: Implement responsive breakpoints for tablet/desktop (AC: #2)
  - [ ] 4.1: Add `md:` breakpoint styles for tablets (768px+)
  - [ ] 4.2: Add `lg:` breakpoint styles for desktop (1024px+)
  - [ ] 4.3: Consider 2-column grid layout for larger screens
  - [ ] 4.4: Ensure no horizontal scroll on any viewport >= 320px

- [ ] Task 5: Verify mobile-first responsive design (AC: #1)
  - [ ] 5.1: Test on 320px viewport (minimum supported width)
  - [ ] 5.2: Verify text doesn't overflow or truncate incorrectly
  - [ ] 5.3: Verify card padding and spacing on mobile

- [ ] Task 6: Final validation (AC: #1, #2)
  - [ ] 6.1: Run `pnpm build` - verify no errors
  - [ ] 6.2: Run `pnpm lint` - verify no issues
  - [ ] 6.3: Run `pnpm test` - verify all tests pass
  - [ ] 6.4: Manual visual inspection on mobile and desktop viewports

## Dev Notes

### Current Implementation Status

**IMPORTANT:** Most of this story is ALREADY IMPLEMENTED from previous stories. The StationCard, StationList, FuelPriceRow, and StationListSkeleton components exist and are functional. This story is primarily a **validation and polish** story to ensure the UI meets all acceptance criteria.

### Existing Components to Review (Not Rewrite)

| Component | File | Status |
|-----------|------|--------|
| StationCard | `src/components/stations/StationCard.tsx` | EXISTS - review for AC compliance |
| StationList | `src/components/stations/StationList.tsx` | EXISTS - review for AC compliance |
| FuelPriceRow | `src/components/stations/FuelPriceRow.tsx` | EXISTS - review for AC compliance |
| StationListSkeleton | `src/components/stations/StationListSkeleton.tsx` | EXISTS - verify layout match |

### Utility Functions (Already Implemented)

| Function | File | Format |
|----------|------|--------|
| `formatDistance()` | `src/lib/formatDistance.ts` | Returns "X m" or "X.X km" |
| `formatPrice()` | `src/lib/formatPrice.ts` | Returns French locale "1,234 €" |
| `formatTimeAgo()` | `src/lib/isStale.ts` | Returns "il y a Xh/Xj" |
| `isStale()` | `src/lib/isStale.ts` | Returns boolean for >48h old |

### Architecture Requirements

**From architecture.md:**
- Mobile-first responsive design with breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px)
- Touch targets minimum 44x44px
- No horizontal scroll on viewport >= 320px
- Tailwind class order: Layout → Positioning → Box model → Typography → Visual → Interactive

**From project-context.md:**
- Named exports only (VERIFIED in existing code)
- SWR for data fetching (VERIFIED - useStations hook)
- Tailwind for styling (VERIFIED)

### Previous Story Learnings (from 1-3)

**API Response Structure:**
- List endpoint `/stations/around/{lat},{lng}` returns stations WITHOUT prices
- Detail endpoint `/station/{id}` returns station WITH prices
- The `useStations` hook already handles fetching details in parallel (with 5 concurrent request limit)
- Uses `shortName` (camelCase) for fuel names
- Uses `available: boolean` (not `rupture`) for stock status

**Type Definitions:**
- `Station` interface in `src/types/station.ts` matches API response
- `Distance` field is optional (comes from list endpoint, merged by hook)
- `Price` field is optional on `StationFuelPrice` (detail endpoint only)

### Touch Target Analysis

Current button implementations need verification:
```tsx
// Directions button - needs height check
<button className="flex-1 gap-2 px-3 py-2 ...">

// Copy button - needs size check  
<button className="px-3 py-2 ...">

// Sort buttons - need height check
<button className="px-3 py-1.5 ...">
```

**Recommendation:** Ensure `py-2.5` or `min-h-[44px]` on all interactive elements.

### Responsive Design Considerations

Current layout uses `max-w-lg` (32rem = 512px) container. For tablet/desktop:
- Consider `max-w-2xl` or `max-w-4xl` for wider screens
- Consider 2-column grid for station cards on `lg:` breakpoint
- Header should remain consistent width for visual cohesion

### Project Structure Notes

All files for this story already exist in correct locations per architecture:
- Components: `src/components/stations/`
- Hooks: `src/hooks/`
- Utils: `src/lib/`
- Types: `src/types/`

### Testing Notes

Existing tests:
- `src/hooks/__tests__/useStations.test.tsx` - 8 tests for data fetching
- `src/components/ui/__tests__/ErrorMessage.test.tsx` - 4 tests

Consider adding:
- Visual regression tests for responsive layouts (optional, not required)
- Accessibility tests for touch targets (optional)

### References

- [Source: epics.md#Story 1.4: Station List UI with Prices]
- [Source: architecture.md#Tailwind Patterns]
- [Source: architecture.md#Project Structure & Boundaries]
- [Source: project-context.md#Responsive Design]
- [Source: 1-3-station-api-integration-swr-hook.md#API Discovery Findings]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### Change Log

| Date | Change |
|------|--------|
| 2026-01-25 | Story created with comprehensive context from epics, architecture, and previous story 1-3 |

### File List
