# Story 3.1: Location Context Display

Status: done

## Story

As a user,
I want to see my approximate location context,
So that I know where the app thinks I am.

## Acceptance Criteria

1. **Given** the user has granted location permission
   **When** coordinates are available
   **Then** the app displays the approximate area/city name (e.g., "Near Créteil")
   **And** the location context is visible in the header or near the station list

## Tasks / Subtasks

- [x] Task 1: Create reverse geocoding hook (AC: #1)
  - [x] 1.1: Create `useReverseGeocode.ts` hook in `/hooks`
  - [x] 1.2: Use BigDataCloud free API (no API key required)
  - [x] 1.3: Extract city/locality from API response
  - [x] 1.4: Handle loading and error states
  - [x] 1.5: Cache result in SWR to prevent redundant calls

- [x] Task 2: Create LocationStatus component (AC: #1)
  - [x] 2.1: Create `LocationStatus.tsx` in `/components/location`
  - [x] 2.2: Display "Near {city}" or "Près de {city}" format
  - [x] 2.3: Show loading state while geocoding
  - [x] 2.4: Handle error gracefully (show coordinates as fallback)
  - [x] 2.5: Style with Tailwind following project patterns

- [x] Task 3: Integrate into page header (AC: #1)
  - [x] 3.1: Add LocationStatus to `page.tsx` header section
  - [x] 3.2: Position below app title/tagline
  - [x] 3.3: Ensure responsive design on all viewports
  - [x] 3.4: Verify visibility and readability

- [x] Task 4: Add types for reverse geocode response (AC: #1)
  - [x] 4.1: Create types in `/types/geocode.ts`
  - [x] 4.2: Type the BigDataCloud API response

- [x] Task 5: Final validation (AC: #1)
  - [x] 5.1: Run `pnpm build` - verify no errors
  - [x] 5.2: Run `pnpm lint` - verify no issues
  - [x] 5.3: Run `pnpm test` - verify existing tests pass
  - [x] 5.4: Manual verification of location display

## Dev Notes

### Implementation Approach

**Reverse Geocoding API:**
Use BigDataCloud's free Reverse Geocoding API - no API key required, client-side friendly.

**API Endpoint:**
```
GET https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={lat}&longitude={lng}&localityLanguage=fr
```

**Response Structure (relevant fields):**
```typescript
interface ReverseGeocodeResponse {
  city: string;           // Primary city name
  locality: string;       // Locality/neighborhood
  principalSubdivision: string; // Region/department
  countryName: string;    // Country
  localityInfo: {
    administrative: Array<{
      name: string;
      order: number;
    }>;
  };
}
```

**Display Priority:**
1. `city` if available
2. `locality` as fallback
3. `principalSubdivision` (department) as last resort
4. Coordinates if all else fails

### useReverseGeocode Hook Pattern

```typescript
// src/hooks/useReverseGeocode.ts
import useSWR from 'swr';

const REVERSE_GEOCODE_API = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useReverseGeocode(lat: number | null, lng: number | null) {
  const url = lat && lng 
    ? `${REVERSE_GEOCODE_API}?latitude=${lat}&longitude=${lng}&localityLanguage=fr`
    : null;
    
  return useSWR<ReverseGeocodeResponse>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // Cache for 1 minute
  });
}
```

### LocationStatus Component Pattern

```typescript
// src/components/location/LocationStatus.tsx
interface LocationStatusProps {
  lat: number;
  lng: number;
}

export function LocationStatus({ lat, lng }: LocationStatusProps) {
  const { data, error, isLoading } = useReverseGeocode(lat, lng);
  
  if (isLoading) {
    return <span className="text-sm text-gray-400">Localisation...</span>;
  }
  
  const locationName = data?.city || data?.locality || data?.principalSubdivision;
  
  if (!locationName || error) {
    return <span className="text-sm text-gray-500">📍 Position actuelle</span>;
  }
  
  return (
    <span className="text-sm text-gray-600">
      📍 Près de {locationName}
    </span>
  );
}
```

### Integration in page.tsx

The LocationStatus component should be added in the header section, below the app tagline:

```tsx
{/* Header */}
<header className="sticky top-0 z-10 bg-white border-b border-gray-200">
  <div className="px-4 py-4 mx-auto max-w-lg md:max-w-2xl lg:max-w-4xl">
    <h1 className="text-xl font-bold text-gray-900">lepleink</h1>
    <p className="text-sm text-gray-500">
      Carburant moins cher près de vous
    </p>
    {/* NEW: Location context display */}
    {coordinates && (
      <LocationStatus lat={coordinates.lat} lng={coordinates.lng} />
    )}
  </div>
</header>
```

### Previous Story Intelligence

**From Epic 2 Stories:**
- `useLocalStorage` hook pattern established for client-side persistence
- SWR hooks with proper deduplication and caching options
- Component patterns with props interfaces
- French locale formatting throughout the app

**From story 2-3 review:**
- SSR hydration considerations - component only renders client-side after geolocation granted
- Error handling patterns with try/catch and console.error

### Git Intelligence Summary

**Recent commits:**
- `a3172ab` feat: 2-3 persistent default fuel type
- `735d5f7` feat: 2-1,2-1 sorty price distance fuel type

**Patterns observed:**
- Feature commits prefixed with `feat:`
- Story reference in commit message
- Small, focused commits

### Architecture Compliance

| Requirement | Implementation |
|-------------|----------------|
| Named exports only | `export function useReverseGeocode`, `export function LocationStatus` |
| SWR for API data | Hook uses `useSWR` with custom fetcher |
| File naming | `useReverseGeocode.ts` (hook), `LocationStatus.tsx` (component) |
| Types in `/types` | Create `geocode.ts` for API response types |
| Tailwind patterns | Mobile-first, proper class ordering |
| No default exports | Use named exports throughout |

### Library/Framework Requirements

- **SWR**: Already installed, use for reverse geocode caching
- **BigDataCloud API**: Free, no API key, client-side safe
- **No new dependencies required**

### File Structure Requirements

**Files to create:**
```
src/
├── hooks/
│   └── useReverseGeocode.ts     # NEW: Reverse geocoding hook
├── components/
│   └── location/
│       └── LocationStatus.tsx    # NEW: Location display component
└── types/
    └── geocode.ts               # NEW: Reverse geocode types
```

**Files to modify:**
```
src/
└── app/
    └── page.tsx                 # Add LocationStatus to header
```

### Testing Requirements

**Unit tests to add:**
- `useReverseGeocode.test.tsx` - Test hook with mocked API responses
- `LocationStatus.test.tsx` - Test component rendering states

**Test scenarios:**
1. Displays city name when API returns successfully
2. Shows loading state while fetching
3. Handles API error gracefully (fallback to "Position actuelle")
4. Handles missing city field (uses locality fallback)
5. Does not call API when coordinates are null

### Project Structure Notes

- Alignment with unified project structure: New files follow existing patterns
- LocationStatus component goes in `/components/location/` alongside existing `LocationPrompt.tsx`
- Hook follows established SWR pattern from `useStations.ts`

### References

- [Source: epics.md#Story 3.1: Location Context Display]
- [Source: architecture.md#API & Communication Patterns - SWR hooks]
- [Source: architecture.md#Component Architecture - functional components]
- [Source: project-context.md#Data Fetching - ALL API data via SWR hooks]
- [Source: 2-3-persistent-default-fuel-type.md#Dev Notes - SWR patterns]
- [Source: src/contexts/GeolocationContext.tsx - coordinates structure]
- [Source: src/app/page.tsx - header layout structure]
- [API: BigDataCloud Reverse Geocode](https://www.bigdatacloud.com/blog/convert-getcurrentposition-free-reversegeocoding-api)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

No issues encountered during implementation.

### Completion Notes List

- Created `useReverseGeocode` hook using BigDataCloud's free reverse geocoding API with SWR caching
- Created `LocationStatus` component that displays "Près de {city}" with fallback logic for locality/subdivision
- Integrated LocationStatus into page.tsx header, displaying below the app tagline when coordinates are available
- Added TypeScript types for the geocode API response in `/types/geocode.ts`
- Added comprehensive unit tests for both the hook (7 tests) and component (6 tests)
- All validations passed: build, lint, and 67 tests (including 13 new tests)
- Implementation follows all project patterns: named exports, SWR hooks, Tailwind styling, French locale

### Change Log

| Date | Change |
|------|--------|
| 2026-01-25 | Story created by create-story workflow |
| 2026-01-25 | Implemented reverse geocoding feature with LocationStatus component |
| 2026-01-25 | Code review: Fixed fetcher error handling, added Accept header, improved emoji accessibility, added non-2xx response test |

### File List

**New files:**
- src/types/geocode.ts
- src/hooks/useReverseGeocode.ts
- src/components/location/LocationStatus.tsx
- src/hooks/__tests__/useReverseGeocode.test.tsx
- src/components/location/__tests__/LocationStatus.test.tsx

**Modified files:**
- src/app/page.tsx
