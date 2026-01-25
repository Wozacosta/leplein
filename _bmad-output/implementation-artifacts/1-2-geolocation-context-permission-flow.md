# Story 1.2: Geolocation Context & Permission Flow

Status: ready-for-dev

## Story

As a user,
I want to grant location permission when I open the app,
So that I can discover nearby fuel stations.

## Acceptance Criteria

1. **Given** the user opens the app for the first time
   **When** the app loads
   **Then** a location permission prompt is displayed with clear explanation
   **And** the user can grant or deny permission

2. **Given** the user grants location permission
   **When** the browser provides coordinates
   **Then** the coordinates are stored in GeolocationContext
   **And** the permission status is set to "granted"

3. **Given** the user denies location permission
   **When** the permission is denied
   **Then** the permission status is set to "denied"
   **And** a helpful message is shown (fallback addressed in Epic 5)

## Tasks / Subtasks

- [ ] Task 1: Verify/Complete GeolocationContext implementation (AC: #2, #3)
  - [ ] 1.1: Verify `src/contexts/GeolocationContext.tsx` handles all status states
  - [ ] 1.2: Verify coordinates are stored correctly on grant
  - [ ] 1.3: Verify permission status transitions: `idle` → `requesting` → `granted`|`denied`
  - [ ] 1.4: Verify error handling for `unavailable` status (browser doesn't support)
  - [ ] 1.5: Verify auto-request on mount when permission was previously granted

- [ ] Task 2: Verify/Complete LocationPrompt UI component (AC: #1, #3)
  - [ ] 2.1: Verify `src/components/location/LocationPrompt.tsx` renders permission prompt
  - [ ] 2.2: Verify clear explanation text about why permission is needed
  - [ ] 2.3: Verify grant/deny button functionality
  - [ ] 2.4: Verify loading spinner during `requesting` state
  - [ ] 2.5: Verify helpful message and retry option when denied

- [ ] Task 3: Integration on main page (AC: #1)
  - [ ] 3.1: Verify `LocationPrompt` is conditionally rendered in `src/app/page.tsx`
  - [ ] 3.2: Verify prompt shows when status is NOT `granted`
  - [ ] 3.3: Verify prompt hides when coordinates are available

- [ ] Task 4: Build and manual verification (AC: all)
  - [ ] 4.1: Run `pnpm build` - verify no errors
  - [ ] 4.2: Run `pnpm dev` - test permission grant flow
  - [ ] 4.3: Test permission deny flow
  - [ ] 4.4: Test retry after deny

## Dev Notes

### Existing Implementation Status

**IMPORTANT:** Much of this story is already implemented. Focus on VERIFICATION and COMPLETION, not starting from scratch.

**Already Implemented:**
- `src/contexts/GeolocationContext.tsx` - Full context with all status handling
- `src/components/location/LocationPrompt.tsx` - Complete UI component
- `src/types/geolocation.ts` - Type definitions
- `layout.tsx` wraps app with `GeolocationProvider`

**Verify These Work Correctly:**
1. Permission prompt displays on first visit
2. Coordinates are stored when user grants permission
3. Status transitions work: `idle` → `requesting` → `granted`|`denied`
4. Error messages display appropriately
5. Auto-request works when permission was previously granted (browser remembers)

### Architecture Requirements

**From architecture.md - State Management:**
```typescript
// Context for cross-cutting state only (geolocation, preferences)
// Never for server data (use SWR)

interface GeolocationContextValue {
  coordinates: { lat: number; lng: number } | null;
  status: 'idle' | 'requesting' | 'granted' | 'denied';
  requestPermission: () => void;
}
```

**Required Status States:**
| Status | Meaning |
|--------|---------|
| `idle` | Initial state, no permission requested yet |
| `requesting` | Browser permission prompt is active |
| `granted` | User allowed, coordinates available |
| `denied` | User denied permission |
| `unavailable` | Browser doesn't support Geolocation API |

### File Locations

| File | Purpose |
|------|---------|
| `src/contexts/GeolocationContext.tsx` | Context provider + useGeolocation hook |
| `src/components/location/LocationPrompt.tsx` | Permission request UI |
| `src/types/geolocation.ts` | TypeScript types |
| `src/app/layout.tsx` | GeolocationProvider wraps app |
| `src/app/page.tsx` | Renders LocationPrompt conditionally |

### Critical Implementation Rules

**From project-context.md:**

1. **Named exports only** - Context uses `export function GeolocationProvider` and `export function useGeolocation`
2. **'use client' directive** - Required for context since it uses browser APIs
3. **Error boundaries** - Context throws if used outside provider
4. **French localization** - Error messages in French (already implemented)

### Geolocation API Options (Already Configured)

```typescript
{
  enableHighAccuracy: true,   // Best accuracy for fuel station distance
  timeout: 10000,             // 10 second timeout
  maximumAge: 300000,         // Cache position for 5 minutes
}
```

### Error Messages (French - Already Implemented)

| Error Code | Message |
|------------|---------|
| PERMISSION_DENIED | "Vous avez refusé l'accès à votre position" |
| POSITION_UNAVAILABLE | "Position non disponible" |
| TIMEOUT | "Délai d'attente dépassé" |
| Unsupported browser | "La géolocalisation n'est pas supportée par votre navigateur" |

### Previous Story (1.1) Learnings

- Named exports required everywhere except Next.js `layout.tsx`/`page.tsx` (which require `export default`)
- TypeScript strict mode is enabled - all types must be explicit
- Use lazy initialization pattern for hooks that read from browser APIs
- Project uses French locale for user-facing text

### Testing Checklist

Manual testing required for browser permission flows:

1. **Fresh browser session**: Should show prompt with explanation
2. **Grant permission**: Should show coordinates in console/state, status = `granted`
3. **Deny permission**: Should show error message, status = `denied`
4. **Retry after deny**: Button should allow re-request
5. **Return visit (granted)**: Should auto-request and show coordinates immediately
6. **Incognito mode**: Should behave like fresh session

### Project Structure Notes

- `GeolocationProvider` wraps entire app in `layout.tsx`
- `LocationPrompt` renders when status is NOT `granted`
- Station list (future stories) renders when coordinates are available
- Mobile-first UI with touch-friendly button sizes (min 44x44px)

### References

- [Source: architecture.md#Frontend Architecture - State Management]
- [Source: architecture.md#Project Structure & Boundaries]
- [Source: epics.md#Story 1.2: Geolocation Context & Permission Flow]
- [Source: project-context.md#State Management]
- [Source: prd.md#Location & Discovery - FR1]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

