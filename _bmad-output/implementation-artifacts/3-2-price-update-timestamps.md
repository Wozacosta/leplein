# Story 3.2: Price Update Timestamps

Status: done

## Story

As a user,
I want to see when each station's price was last updated,
So that I know how fresh the data is.

## Acceptance Criteria

1. **Given** a station card is displayed
   **When** the user views the station details
   **Then** the last price update time is shown in relative format (e.g., "il y a 2h", "il y a 3j")
   **And** the timestamp uses French locale formatting

## Tasks / Subtasks

- [x] Task 1: Verify existing timestamp implementation (AC: #1)
  - [x] 1.1: Confirm `formatTimeAgo` function in `lib/isStale.ts` produces correct French relative time
  - [x] 1.2: Confirm timestamp is displayed in `FuelPriceRow` component next to each fuel price
  - [x] 1.3: Test various time ranges (minutes, hours, days, weeks+)

- [x] Task 2: Add comprehensive unit tests for formatTimeAgo (AC: #1)
  - [x] 2.1: Create `src/lib/__tests__/isStale.test.ts` if not exists
  - [x] 2.2: Test "il y a X min" format for times < 1 hour
  - [x] 2.3: Test "il y a Xh" format for times 1-24 hours
  - [x] 2.4: Test "il y a Xj" format for times 1-7 days
  - [x] 2.5: Test French locale date format for times > 7 days
  - [x] 2.6: Test edge cases (just now, exactly 1 hour, exactly 1 day)

- [x] Task 3: Add visual/component tests for timestamp display (AC: #1)
  - [x] 3.1: Add test in `FuelPriceRow.test.tsx` verifying timestamp is rendered
  - [x] 3.2: Test timestamp styling (gray for fresh, orange for stale)
  - [x] 3.3: Verify timestamp position and accessibility

- [x] Task 4: Final validation (AC: #1)
  - [x] 4.1: Run `pnpm build` - verify no errors
  - [x] 4.2: Run `pnpm lint` - verify no issues
  - [x] 4.3: Run `pnpm test` - verify all tests pass
  - [x] 4.4: Manual verification of timestamp display in app

## Dev Notes

### Implementation Status

**NOTE:** The core timestamp functionality appears to already be implemented in the codebase:
- `src/lib/isStale.ts` contains `formatTimeAgo()` function with French locale formatting
- `src/components/stations/FuelPriceRow.tsx` displays the timestamp using this function

**This story focuses on:**
1. Verifying the existing implementation meets acceptance criteria
2. Adding comprehensive test coverage for the timestamp formatting
3. Ensuring edge cases are handled correctly

### Existing Implementation Analysis

**formatTimeAgo function (src/lib/isStale.ts):**
```typescript
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `il y a ${diffMins} min`;
  }
  if (diffHours < 24) {
    return `il y a ${diffHours}h`;
  }
  if (diffDays < 7) {
    return `il y a ${diffDays}j`;
  }
  return date.toLocaleDateString('fr-FR');
}
```

**FuelPriceRow usage (src/components/stations/FuelPriceRow.tsx):**
```tsx
<span className={`text-xs ${stale ? "text-orange-600" : "text-gray-400"}`}>
  {formatTimeAgo(fuel.Update.value)}
</span>
```

### Testing Strategy

**Unit Tests for formatTimeAgo:**
```typescript
// src/lib/__tests__/isStale.test.ts
describe('formatTimeAgo', () => {
  it('returns "il y a X min" for times less than 1 hour', () => {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    expect(formatTimeAgo(thirtyMinsAgo)).toBe('il y a 30 min');
  });

  it('returns "il y a Xh" for times 1-24 hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatTimeAgo(twoHoursAgo)).toBe('il y a 2h');
  });

  it('returns "il y a Xj" for times 1-7 days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatTimeAgo(threeDaysAgo)).toBe('il y a 3j');
  });

  it('returns French locale date for times > 7 days', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    // Should match format like "11/01/2026"
    expect(formatTimeAgo(twoWeeksAgo)).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});
```

**Component Tests for FuelPriceRow:**
```typescript
// src/components/stations/__tests__/FuelPriceRow.test.tsx
describe('FuelPriceRow', () => {
  it('displays the price update timestamp', () => {
    const fuel = {
      id: 1,
      name: 'Gazole',
      shortName: 'Gazole',
      picto: 'B7',
      type: 'D',
      Update: { value: new Date().toISOString(), text: 'now' },
      available: true,
      Price: { value: 1.72, text: '1.72' }
    };
    
    render(<FuelPriceRow fuel={fuel} />);
    expect(screen.getByText(/il y a/)).toBeInTheDocument();
  });
});
```

### Previous Story Intelligence

**From Story 3-1 (Location Context Display):**
- SWR hooks with proper caching options work well
- Test patterns using Jest and React Testing Library established
- French locale used throughout (e.g., "Près de {city}")

**From earlier stories:**
- `formatPrice` and `formatDistance` patterns in `lib/` folder
- Test files follow `__tests__/` folder convention

### Architecture Compliance

| Requirement | Implementation |
|-------------|----------------|
| Named exports only | `export function formatTimeAgo` |
| French locale | "il y a X min/h/j" format, `toLocaleDateString('fr-FR')` |
| File organization | Utility in `lib/isStale.ts`, tests in `lib/__tests__/` |
| Type safety | Function accepts string, returns string |

### Library/Framework Requirements

- **No new dependencies required**
- Uses native JavaScript `Date` API
- Uses native `toLocaleDateString` for locale formatting

### File Structure Requirements

**Files to verify:**
```
src/
├── lib/
│   ├── isStale.ts           # EXISTING: Contains formatTimeAgo
│   └── __tests__/
│       └── isStale.test.ts  # TO CREATE: Unit tests for isStale and formatTimeAgo
└── components/
    └── stations/
        ├── FuelPriceRow.tsx           # EXISTING: Displays timestamp
        └── __tests__/
            └── FuelPriceRow.test.tsx  # TO CREATE/UPDATE: Component tests
```

### Testing Requirements

**Test Coverage Goals:**
- Unit tests for `formatTimeAgo` function covering all time ranges
- Unit tests for `isStale` function (48-hour threshold)
- Component tests verifying timestamp rendering and styling
- Edge case testing (invalid dates, future dates)

### Project Structure Notes

- Utility functions in `lib/` folder following existing pattern (`formatPrice.ts`, `formatDistance.ts`)
- Test files in `__tests__/` subdirectories
- French locale formatting consistent with rest of app

### References

- [Source: epics.md#Story 3.2: Price Update Timestamps]
- [Source: architecture.md#Date/Time Handling - Store as ISO 8601, display with Intl.DateTimeFormat]
- [Source: project-context.md#File Naming - Utils: camelCase.ts]
- [Source: src/lib/isStale.ts - existing implementation]
- [Source: src/components/stations/FuelPriceRow.tsx - timestamp display]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

No issues encountered during implementation.

### Completion Notes List

- Verified existing `formatTimeAgo` function correctly produces French relative time formats
- Verified `FuelPriceRow` component displays timestamps with proper styling (gray for fresh, orange for stale)
- Created comprehensive unit test suite for `isStale.ts` (21 tests covering isStale and formatTimeAgo functions)
- Created comprehensive component test suite for `FuelPriceRow.tsx` (16 tests covering timestamp display, styling, accessibility)
- All validation passed: build successful, lint clean, 105 tests passing

### Change Log

| Date | Change |
|------|--------|
| 2026-01-25 | Story created by create-story workflow |
| 2026-01-25 | Added unit tests for isStale and formatTimeAgo functions (21 tests) |
| 2026-01-25 | Added component tests for FuelPriceRow timestamp display (16 tests) |
| 2026-01-25 | Story completed - all acceptance criteria verified |
| 2026-01-26 | Code review: Added edge case handling (invalid dates, future dates, "à l'instant" for <1 min) |
| 2026-01-26 | Code review: Added 6 new edge case tests, updated 3 component tests for new behavior |

### File List

- `src/lib/isStale.ts` (modified) - Added edge case handling for invalid/future dates and "à l'instant" format
- `src/lib/__tests__/isStale.test.ts` (created/modified) - Unit tests for isStale and formatTimeAgo (27 tests)
- `src/components/stations/__tests__/FuelPriceRow.test.tsx` (created/modified) - Component tests for FuelPriceRow (16 tests)
