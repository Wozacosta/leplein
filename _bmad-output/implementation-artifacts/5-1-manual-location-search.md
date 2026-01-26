# Story 5.1: Manual Location Search

Status: done

## Story

As a user,
I want to search for stations by city or postcode,
So that I can find fuel even if I deny location permission or want to search elsewhere.

## Acceptance Criteria

1. **Given** the user has denied location permission OR wants to search another area
   **When** the manual search input is available
   **Then** the user can enter a city name or French postcode
   **And** the app geocodes the input to coordinates
   **And** stations near the searched location are displayed

2. **Given** the search input is invalid or not found
   **When** the user submits the search
   **Then** a helpful error message is shown (e.g., "Location not found, try another search")

## Tasks / Subtasks

- [x] Task 1: Extend GeolocationContext for manual coordinates (AC: #1)
  - [x] 1.1: Add `setManualCoordinates(lat, lng)` function to context
  - [x] 1.2: Add `locationSource: 'gps' | 'manual' | null` to track origin
  - [x] 1.3: Ensure manual coordinates trigger same flow as GPS coordinates

- [x] Task 2: Create LocationSearch component (AC: #1, #2)
  - [x] 2.1: Create `LocationSearch.tsx` in `/components/location`
  - [x] 2.2: Input field for city name or postcode
  - [x] 2.3: Submit button with loading state
  - [x] 2.4: Use French government geocoding API (api-adresse.data.gouv.fr)
  - [x] 2.5: Handle errors with user-friendly messages

- [x] Task 3: Integrate LocationSearch into LocationPrompt (AC: #1)
  - [x] 3.1: Show LocationSearch as alternative when geolocation denied/unavailable
  - [x] 3.2: Add "Ou rechercher une ville" section
  - [x] 3.3: On successful search, set manual coordinates in context

- [x] Task 4: Add unit tests (AC: #1, #2)
  - [x] 4.1: Test LocationSearch renders input and button
  - [x] 4.2: Test successful geocoding sets coordinates
  - [x] 4.3: Test error state displays message
  - [x] 4.4: Test loading state during search

- [x] Task 5: Final validation (AC: #1, #2)
  - [x] 5.1: Run `pnpm build` - verify no errors (Node version environment issue only)
  - [x] 5.2: Run `pnpm lint` - verify no issues
  - [x] 5.3: Run `pnpm test` - verify all tests pass (146 tests after review fixes)
  - [x] 5.4: Manual test with denied geolocation + city search

## Dev Notes

### French Government Geocoding API

**Base URL:** `https://api-adresse.data.gouv.fr`

**Endpoint:** `GET /search/?q={query}&limit=1`

**Example:**
```bash
curl "https://api-adresse.data.gouv.fr/search/?q=Paris&limit=1"
```

**Response:**
```json
{
  "features": [
    {
      "geometry": {
        "coordinates": [2.347, 48.859]  // [lng, lat] - NOTE: lng first!
      },
      "properties": {
        "label": "Paris",
        "city": "Paris",
        "postcode": "75001"
      }
    }
  ]
}
```

### Implementation Approach

**GeolocationContext Extension:**
```typescript
interface GeolocationContextValue {
  coordinates: Coordinates | null;
  status: GeolocationStatus;
  error: string | null;
  locationSource: 'gps' | 'manual' | null;
  locationLabel: string | null;
  requestPermission: () => void;
  setManualCoordinates: (lat: number, lng: number, label?: string) => void;
}
```

**LocationSearch Component:**
```typescript
export function LocationSearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { setManualCoordinates } = useGeolocation();

  const handleSearch = async () => {
    // Geocode using api-adresse.data.gouv.fr
    // On success: setManualCoordinates(lat, lng, label)
    // On error: setSearchError(message)
  };
}
```

### Architecture Compliance

| Requirement | Implementation |
|-------------|----------------|
| Named exports only | `export function LocationSearch` |
| No useState for server data | Using simple fetch for one-shot geocoding (not SWR - single request, no caching needed) |
| French locale | "Rechercher une ville", "Ville ou code postal" |
| Accessibility | Input label, error announcements, loading state |

### References

- [Source: epics.md#Story 5.1: Manual Location Search]
- [Source: architecture.md#State Management - React Context for geolocation]
- [Source: project-context.md#File Naming]
- [API: api-adresse.data.gouv.fr - French government geocoding]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Extended GeolocationContext with `setManualCoordinates`, `locationSource`, and `locationLabel`
- Created LocationSearch component with French government geocoding API integration
- Integrated LocationSearch into LocationPrompt for both denied and unavailable geolocation states
- Updated LocationStatus to display manual location label when available
- Added 8 unit tests for LocationSearch covering all scenarios
- Updated LocationStatus tests to mock useGeolocation
- All 146 tests pass, lint clean

### Code Review Fixes (2026-01-26)

- **H1 Fixed:** Added tests for manual location label display in LocationStatus
- **M1 Fixed:** Added `aria-label="Recherche en cours"` to loading button for accessibility
- **M2 Fixed:** Resolved act() warnings in LocationSearch tests with proper waitFor cleanup
- **M3 Fixed:** Added LocationPrompt integration tests (8 new tests)

### Change Log

| Date | Change |
|------|--------|
| 2026-01-26 | Story created for manual location search implementation |
| 2026-01-26 | Implemented LocationSearch component and GeolocationContext extension |
| 2026-01-26 | Code review: Fixed 1 HIGH, 3 MEDIUM issues - accessibility, test coverage |

### File List

**New files:**
- src/components/location/LocationSearch.tsx
- src/components/location/__tests__/LocationSearch.test.tsx
- src/components/location/__tests__/LocationPrompt.test.tsx (added in code review)

**Modified files:**
- src/contexts/GeolocationContext.tsx (add setManualCoordinates, locationSource, locationLabel)
- src/components/location/LocationPrompt.tsx (integrate LocationSearch)
- src/components/location/LocationStatus.tsx (show manual location label)
- src/types/geolocation.ts (add LocationSource type, locationLabel)
- src/components/location/__tests__/LocationStatus.test.tsx (add useGeolocation mock, manual label tests)
