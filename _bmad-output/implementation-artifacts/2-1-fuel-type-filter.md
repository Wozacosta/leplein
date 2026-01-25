# Story 2.1: Fuel Type Filter

Status: ready-for-dev

## Story

As a user,
I want to filter stations by fuel type,
So that I only see prices for the fuel my car uses.

## Acceptance Criteria

1. **Given** the station list is displayed
   **When** the user views the fuel filter
   **Then** all 6 fuel types are available: Gazole, SP95, SP98, E10, E85, GPLc
   **And** each fuel type shows both common name and EU picto code (e.g., "SP95 (E5)", "Gazole (B7)")

2. **Given** the user selects a fuel type
   **When** the filter is applied
   **Then** stations are filtered to show only those with the selected fuel available
   **And** station cards display the price for the selected fuel prominently
   **And** filter changes reflect instantly (< 100ms)

## Tasks / Subtasks

- [ ] Task 1: Update FuelFilter to display EU picto codes (AC: #1)
  - [ ] 1.1: Modify button labels to show format "shortName (picto)" e.g., "SP95 (E5)"
  - [ ] 1.2: Verify all 6 fuel types display correctly with their picto codes
  - [ ] 1.3: Ensure touch targets remain 44px minimum

- [ ] Task 2: Implement station filtering by fuel availability (AC: #2)
  - [ ] 2.1: In StationList, filter `sortedStations` to only include stations where selected fuel is available
  - [ ] 2.2: Use `fuel.available === true` check (not rupture field)
  - [ ] 2.3: When "Tous" selected, show all stations (no filtering)
  - [ ] 2.4: Update results count to reflect filtered count

- [ ] Task 3: Verify prominent price display for selected fuel (AC: #2)
  - [ ] 3.1: Confirm StationCard shows selected fuel price prominently (already implemented via `selectedFuel`)
  - [ ] 3.2: Verify FuelPriceRow `isHighlighted` styling is visually prominent

- [ ] Task 4: Verify instant filter response (AC: #2)
  - [ ] 4.1: Confirm filtering uses useMemo (client-side, no API call)
  - [ ] 4.2: Test filter changes are instant (< 100ms)

- [ ] Task 5: Final validation (AC: #1, #2)
  - [ ] 5.1: Run `pnpm build` - verify no errors
  - [ ] 5.2: Run `pnpm lint` - verify no issues
  - [ ] 5.3: Run `pnpm test` - verify all tests pass
  - [ ] 5.4: Manual verification of all 6 fuel types with picto codes

## Dev Notes

### Current Implementation Status

**PARTIALLY IMPLEMENTED:** The FuelFilter component exists and is functional, but is missing two key features from the acceptance criteria:

1. **Missing EU picto codes** - Buttons show only `shortName` (e.g., "SP95") instead of "SP95 (E5)"
2. **Missing station filtering** - All stations show regardless of whether they have the selected fuel available

### Existing Components to Modify

| Component | File | Change Required |
|-----------|------|-----------------|
| FuelFilter | `src/components/filters/FuelFilter.tsx` | Add picto code to button labels |
| StationList | `src/components/stations/StationList.tsx` | Filter stations by fuel availability |

### No New Components Required

This story is primarily a **modification story** - enhancing existing functionality, not creating new components.

### Architecture Requirements

**From architecture.md:**
- Named exports only (VERIFIED in existing code)
- Tailwind class order: Layout → Positioning → Box model → Typography → Visual → Interactive
- Mobile-first responsive design
- Touch targets minimum 44x44px

**From project-context.md:**
- SWR for data fetching (already implemented)
- Client-side filtering via useMemo for instant response

### Code Analysis: FuelFilter.tsx

**Current implementation (line 23-31):**
```tsx
<button
  type="button"
  key={fuel.id}
  onClick={() => onFuelChange(fuel.id)}
  className={`flex items-center justify-center px-3 min-h-[44px] text-sm font-medium rounded-lg transition-colors ${
    selectedFuelId === fuel.id
      ? "bg-blue-600 text-white"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
  }`}
>
  {fuel.shortName}  {/* ← CHANGE TO: {fuel.shortName} ({fuel.picto}) */}
</button>
```

**Required change:**
```tsx
{fuel.shortName} ({fuel.picto})
```

This produces: "SP95 (E5)", "Gazole (B7)", "E10 (E10)", etc.

### Code Analysis: StationList.tsx

**Current implementation** does sorting but NO filtering. Need to add filtering step.

**Current sortedStations useMemo (lines 24-42):**
```tsx
const sortedStations = useMemo(() => {
  if (!stations) return [];

  return [...stations].sort((a, b) => {
    // sorting logic
  });
}, [stations, sortOrder, selectedFuelId]);
```

**Required change - add filtering BEFORE sorting:**
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
    // existing sorting logic
  });
}, [stations, sortOrder, selectedFuelId]);
```

### Constants Reference

**From `src/lib/constants.ts`:**
```typescript
export const FUEL_TYPES = [
  { id: 1, name: 'Gazole', shortName: 'Gazole', picto: 'B7' },
  { id: 2, name: 'Sans Plomb 95', shortName: 'SP95', picto: 'E5' },
  { id: 5, name: 'Sans Plomb 95-E10', shortName: 'E10', picto: 'E10' },
  { id: 6, name: 'Sans Plomb 98', shortName: 'SP98', picto: 'E5' },
  { id: 3, name: 'E85', shortName: 'E85', picto: 'E85' },
  { id: 4, name: 'GPLc', shortName: 'GPLc', picto: 'LPG' },
] as const;
```

**Expected button labels after change:**
- "Gazole (B7)"
- "SP95 (E5)"
- "E10 (E10)"
- "SP98 (E5)"
- "E85 (E85)"
- "GPLc (LPG)"

### API Data Structure

**From previous story learnings (1-3, 1-4):**
- `station.Fuels` is an array of `StationFuelPrice`
- Each fuel has `id`, `shortName`, `available` (boolean), `Price` (object with `value`)
- Use `available: boolean` NOT `rupture` field (API uses available: true/false)

### Performance Consideration

**Filtering must be instant (< 100ms):**
- Already using `useMemo` with proper dependencies
- Filtering is O(n) where n = number of stations (typically < 50)
- No API call on filter change - purely client-side
- This is already the pattern - just need to add the filter logic

### Previous Story Learnings (from 1-4)

**Relevant learnings:**
- Touch targets: All buttons have `min-h-[44px]` - maintain this
- `available: boolean` is the correct field for stock status
- FuelFilter already has 44px touch targets (added in 1-4 code review)

### Git Intelligence

**Recent commits:**
- `fc0734c feat: 1-3 station api integration`
- `9166944 feat: 1-2 geoloc permission flow`
- `dd8575f feat: 1-1 project init`

**Patterns established:**
- Feature commits prefixed with story number
- Components follow named export pattern
- Hooks use SWR for data fetching

### Project Structure Notes

All files for this story already exist in correct locations per architecture:
- `src/components/filters/FuelFilter.tsx` - to modify
- `src/components/stations/StationList.tsx` - to modify
- `src/lib/constants.ts` - read-only reference (already has picto data)

### Testing Notes

**Existing tests:**
- `src/hooks/__tests__/useStations.test.tsx` - 8 tests
- `src/lib/__tests__/formatPrice.test.ts` - 7 tests
- `src/lib/__tests__/formatDistance.test.ts` - 7 tests

**Consider adding (optional):**
- Unit test for filtering logic in StationList
- Test that verifies picto codes display in FuelFilter

### References

- [Source: epics.md#Story 2.1: Fuel Type Filter]
- [Source: architecture.md#Implementation Patterns & Consistency Rules]
- [Source: project-context.md#Critical Implementation Rules]
- [Source: 1-4-station-list-ui-with-prices.md#Dev Notes - API Response Structure]
- [Source: src/lib/constants.ts#FUEL_TYPES]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### Change Log

| Date | Change |
|------|--------|
| 2026-01-25 | Story created with comprehensive context from epics, architecture, project-context, and previous stories |

### File List

- `src/components/filters/FuelFilter.tsx` - To modify: Add picto codes to labels
- `src/components/stations/StationList.tsx` - To modify: Add fuel availability filtering
