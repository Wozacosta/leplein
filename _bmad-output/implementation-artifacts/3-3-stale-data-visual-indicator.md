# Story 3.3: Stale Data Visual Indicator

Status: done

## Story

As a user,
I want to visually identify stations with outdated prices,
So that I can avoid relying on potentially inaccurate data.

## Acceptance Criteria

1. **Given** a station's price data is older than 48 hours
   **When** the station card is displayed
   **Then** a visual indicator marks the data as stale (e.g., warning icon, muted styling)
   **And** the staleness is obvious but not alarming

2. **Given** a station's price data is fresh (within 48 hours)
   **When** the station card is displayed
   **Then** no staleness indicator is shown

## Tasks / Subtasks

- [x] Task 1: Create StaleIndicator component (AC: #1)
  - [x] 1.1: Create `StaleIndicator.tsx` in `/components/ui`
  - [x] 1.2: Use warning icon (clock or exclamation) with muted orange styling
  - [x] 1.3: Add tooltip text explaining staleness (title attribute)
  - [x] 1.4: Add proper ARIA label for accessibility
  - [x] 1.5: Style with Tailwind following project patterns

- [x] Task 2: Integrate StaleIndicator into StationCard (AC: #1, #2)
  - [x] 2.1: Add staleness check at station level (check oldest fuel update)
  - [x] 2.2: Display StaleIndicator in station card header when stale
  - [x] 2.3: Ensure indicator is visible but not alarming (muted styling)
  - [x] 2.4: Conditionally render only when station has stale data

- [x] Task 3: Add unit tests for StaleIndicator (AC: #1, #2)
  - [x] 3.1: Create `src/components/ui/__tests__/StaleIndicator.test.tsx`
  - [x] 3.2: Test renders warning icon and text
  - [x] 3.3: Test accessibility attributes (aria-label, title)
  - [x] 3.4: Test styling matches muted orange theme

- [x] Task 4: Add StationCard integration tests (AC: #1, #2)
  - [x] 4.1: Update `StationCard.test.tsx` with stale indicator tests
  - [x] 4.2: Test indicator appears when station has stale data
  - [x] 4.3: Test indicator hidden when station data is fresh
  - [x] 4.4: Test staleness determined by oldest fuel update

- [x] Task 5: Final validation (AC: #1, #2)
  - [x] 5.1: Run `pnpm build` - verify no errors
  - [x] 5.2: Run `pnpm lint` - verify no issues
  - [x] 5.3: Run `pnpm test` - verify all tests pass (128 tests)
  - [x] 5.4: Manual verification of stale indicator display

## Dev Notes

### Implementation Approach

**Staleness Detection Logic:**
The `isStale` function already exists in `src/lib/isStale.ts` and uses a 48-hour threshold defined in `src/lib/constants.ts` as `STALE_THRESHOLD_HOURS = 48`.

**Station-Level Staleness:**
A station is considered stale if ANY of its fuel prices are stale. Check the oldest update time across all fuels.

```typescript
// Helper function to check if station has stale data
function hasStaleData(station: Station): boolean {
  return station.Fuels.some(fuel => isStale(fuel.Update.value));
}
```

**Existing isStale Function (src/lib/isStale.ts:3-8):**
```typescript
export function isStale(updateDateString: string): boolean {
  const updateDate = new Date(updateDateString);
  const now = new Date();
  const diffHours = (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60);
  return diffHours > STALE_THRESHOLD_HOURS;
}
```

### StaleIndicator Component Pattern

```typescript
// src/components/ui/StaleIndicator.tsx
interface StaleIndicatorProps {
  className?: string;
}

export function StaleIndicator({ className }: StaleIndicatorProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-orange-600 bg-orange-50 rounded ${className || ''}`}
      title="Prix potentiellement obsolètes (plus de 48h)"
      aria-label="Données potentiellement obsolètes"
    >
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Ancien
    </span>
  );
}
```

### Integration in StationCard

Add staleness indicator to the header section of StationCard (src/components/stations/StationCard.tsx:45-60):

```tsx
// Add import at top
import { isStale } from "@/lib/isStale";
import { StaleIndicator } from "@/components/ui/StaleIndicator";

// Add staleness check before return
const hasStaleData = station.Fuels.some(fuel => isStale(fuel.Update.value));

// In JSX, add indicator after brand name badges
<div className="flex items-center gap-2">
  <h3 className="font-semibold text-gray-900">
    {station.Brand?.shortName || station.Brand?.name || station.name}
  </h3>
  {station.type === "A" && (
    <span className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded">
      Autoroute
    </span>
  )}
  {hasStaleData && <StaleIndicator />}
</div>
```

### Previous Story Intelligence

**From Story 3-2 (Price Update Timestamps):**
- `isStale` function already tested with 27 unit tests covering edge cases
- French locale formatting established ("il y a Xh", "il y a Xj")
- Stale threshold = 48 hours (STALE_THRESHOLD_HOURS constant)
- FuelPriceRow already shows orange timestamp text for stale individual fuels

**From Story 3-1 (Location Context Display):**
- Component testing patterns with React Testing Library
- Named exports only, props interfaces co-located
- Tailwind patterns: muted styling for secondary information

**Key Pattern:** The orange color scheme is already used for stale timestamps in FuelPriceRow. Use the same orange-600/orange-50 palette for consistency.

### Git Intelligence Summary

**Recent commits:**
- `f6e1cdb` feat: 3-2 price update timestamp
- `64c67fb` feat: 3-1 location context display

**Commit pattern:** `feat: X-Y description` for feature commits.

### Architecture Compliance

| Requirement | Implementation |
|-------------|----------------|
| Named exports only | `export function StaleIndicator` |
| Component naming | PascalCase `StaleIndicator.tsx` |
| File location | `/components/ui/` for generic UI components |
| Tailwind patterns | Mobile-first, proper class ordering |
| Accessibility | `aria-label`, `title` tooltip, `aria-hidden` for icons |
| French locale | "Ancien", "Prix potentiellement obsolètes" |

### Library/Framework Requirements

- **No new dependencies required**
- Reuses existing `isStale` function from `src/lib/isStale.ts`
- Reuses existing `STALE_THRESHOLD_HOURS` constant

### File Structure Requirements

**Files to create:**
```
src/
└── components/
    └── ui/
        ├── StaleIndicator.tsx          # NEW: Stale data indicator
        └── __tests__/
            └── StaleIndicator.test.tsx # NEW: Component tests
```

**Files to modify:**
```
src/
└── components/
    └── stations/
        ├── StationCard.tsx             # Add StaleIndicator integration
        └── __tests__/
            └── StationCard.test.tsx    # Add stale indicator tests
```

### Testing Requirements

**StaleIndicator Component Tests:**
```typescript
// src/components/ui/__tests__/StaleIndicator.test.tsx
describe('StaleIndicator', () => {
  it('renders with warning clock icon', () => {
    render(<StaleIndicator />);
    expect(screen.getByText('Ancien')).toBeInTheDocument();
    expect(screen.getByLabelText('Données potentiellement obsolètes')).toBeInTheDocument();
  });

  it('has title tooltip explaining staleness', () => {
    render(<StaleIndicator />);
    const indicator = screen.getByLabelText('Données potentiellement obsolètes');
    expect(indicator).toHaveAttribute('title', 'Prix potentiellement obsolètes (plus de 48h)');
  });

  it('applies muted orange styling', () => {
    render(<StaleIndicator />);
    const indicator = screen.getByLabelText('Données potentiellement obsolètes');
    expect(indicator).toHaveClass('text-orange-600', 'bg-orange-50');
  });
});
```

**StationCard Integration Tests:**
```typescript
// Add to src/components/stations/__tests__/StationCard.test.tsx
describe('StationCard stale indicator', () => {
  it('shows stale indicator when station has stale fuel data', () => {
    const staleStation = createMockStation({
      fuels: [{ Update: { value: threeDaysAgo } }]
    });
    render(<StationCard station={staleStation} />);
    expect(screen.getByText('Ancien')).toBeInTheDocument();
  });

  it('hides stale indicator when station data is fresh', () => {
    const freshStation = createMockStation({
      fuels: [{ Update: { value: oneHourAgo } }]
    });
    render(<StationCard station={freshStation} />);
    expect(screen.queryByText('Ancien')).not.toBeInTheDocument();
  });

  it('shows stale indicator if any fuel is stale', () => {
    const mixedStation = createMockStation({
      fuels: [
        { Update: { value: oneHourAgo } },
        { Update: { value: threeDaysAgo } }  // This one is stale
      ]
    });
    render(<StationCard station={mixedStation} />);
    expect(screen.getByText('Ancien')).toBeInTheDocument();
  });
});
```

### Project Structure Notes

- StaleIndicator is a generic UI component → `/components/ui/`
- Follows existing badge pattern (similar to "Autoroute" and "Rupture" badges)
- Uses same orange color palette as stale timestamp in FuelPriceRow for consistency

### Visual Design Guidance

**Indicator Appearance:**
- Small badge with clock icon + "Ancien" text
- Muted orange (orange-600 text, orange-50 background)
- Rounded corners matching other badges
- Positioned next to brand name and "Autoroute" badge

**Why "Ancien" (Old) instead of "Données obsolètes":**
- Shorter, less alarming to users
- Matches casual tone of the app
- Users understand without technical jargon

**Not Alarming Requirement:**
- Muted orange (not red/danger colors)
- Small badge (not banner or alert)
- Positioned as secondary information
- Tooltip provides full explanation on hover

### References

- [Source: epics.md#Story 3.3: Stale Data Visual Indicator]
- [Source: architecture.md#Format Patterns - consistent styling]
- [Source: project-context.md#Tailwind Class Order]
- [Source: src/lib/isStale.ts - existing isStale function]
- [Source: src/lib/constants.ts - STALE_THRESHOLD_HOURS = 48]
- [Source: src/components/stations/FuelPriceRow.tsx - orange stale styling pattern]
- [Source: 3-2-price-update-timestamps.md#Dev Notes - isStale testing patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Fixed vitest config ESM compatibility issue (renamed vitest.config.ts → vitest.config.mts)
- Switched test environment from jsdom to happy-dom due to ESM/CJS incompatibility with jsdom@27

### Completion Notes List

- Created StaleIndicator component with clock icon, muted orange styling, French text ("Ancien"), and proper accessibility (aria-label, title tooltip)
- Integrated StaleIndicator into StationCard header - displays when any fuel has data older than 48 hours
- Added 6 unit tests for StaleIndicator component verifying rendering, accessibility, and styling
- Added 11 tests for StationCard including 7 stale indicator integration tests covering various staleness scenarios (including empty Fuels edge case)
- All 128 tests pass, lint clean

### Change Log

| Date | Change |
|------|--------|
| 2026-01-26 | Story created by create-story workflow |
| 2026-01-26 | Implemented StaleIndicator component and integrated into StationCard |
| 2026-01-26 | Code review: exported StaleIndicatorProps, added empty Fuels edge case test, removed jsdom, cleaned up vitest.config.ts |

### File List

**New files:**
- src/components/ui/StaleIndicator.tsx
- src/components/ui/__tests__/StaleIndicator.test.tsx
- src/components/stations/__tests__/StationCard.test.tsx
- vitest.config.mts

**Modified files:**
- src/components/stations/StationCard.tsx (added StaleIndicator import and integration)
- package.json (added happy-dom, removed jsdom)
- pnpm-lock.yaml

**Deleted files:**
- vitest.config.ts (replaced by vitest.config.mts for ESM compatibility)
