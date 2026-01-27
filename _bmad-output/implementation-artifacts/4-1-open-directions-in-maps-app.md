# Story 4.1: Open Directions in Maps App

Status: done

## Story

As a user,
I want to tap a station to get directions,
So that I can navigate there easily.

## Acceptance Criteria

1. **Given** a station card is displayed **When** the user taps the directions/navigate button **Then** the device's default maps app opens with directions to the station
2. **And** on iOS, Apple Maps or user's default is used
3. **And** on Android/other, Google Maps link is used
4. **And** the link includes station coordinates for accurate navigation

## Tasks / Subtasks

- [x] Task 1: Enhance maps link generation for cross-platform support (AC: #1, #2, #3, #4)
  - [x] Subtask 1.1: Google Maps integration already exists in StationCard.tsx
  - [x] Subtask 1.2: Add platform detection utility for iOS vs Android/other
  - [x] Subtask 1.3: Update handleOpenMaps to use coordinates when available (more accurate)
  - [x] Subtask 1.4: Add Apple Maps fallback for iOS (maps:// scheme)
  - [x] Subtask 1.5: Consider Waze deep link as optional enhancement (skipped - not required by ACs)
- [x] Task 2: Write unit tests for maps functionality (AC: all)
  - [x] Subtask 2.1: Test that directions button renders correctly
  - [x] Subtask 2.2: Test that clicking opens maps URL (mock window.open)
  - [x] Subtask 2.3: Test URL includes proper coordinates or address encoding
  - [x] Subtask 2.4: Test accessibility (button has proper aria-label)

## Dev Notes

### CRITICAL: Existing Implementation Found!

The `handleOpenMaps()` function **already exists** in `src/components/stations/StationCard.tsx:25-32`:

```typescript
const handleOpenMaps = () => {
  const address = encodeURIComponent(
    `${station.Address.street_line}, ${station.Address.city_line}`,
  );
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${address}`,
    "_blank",
  );
};
```

**What's missing:**
1. iOS/Apple Maps support (currently only Google Maps)
2. Coordinate-based navigation (currently uses address, but station has `Coordinates` field)
3. Unit tests for the functionality

### Recommended Enhancement

Use coordinates when available for more accurate navigation:
```typescript
const handleOpenMaps = () => {
  // Prefer coordinates for accuracy, fallback to address
  if (station.Coordinates) {
    const { latitude, longitude } = station.Coordinates;
    // iOS detection for Apple Maps
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      window.open(`maps://maps.apple.com/?daddr=${latitude},${longitude}`, "_blank");
    } else {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
        "_blank"
      );
    }
  } else {
    // Fallback to address-based search
    const address = encodeURIComponent(
      `${station.Address.street_line}, ${station.Address.city_line}`
    );
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${address}`,
      "_blank"
    );
  }
};
```

### Architecture Compliance

- Component location: `src/components/stations/StationCard.tsx` (exists)
- Test location: `src/components/stations/__tests__/StationCard.test.tsx` (add tests)
- Pattern: Named exports, Tailwind classes, mobile-first responsive
- Touch target: Already 44px minimum height (compliant)

### Testing Requirements

- Use Vitest + React Testing Library (already configured)
- Mock `window.open` to verify URL construction
- Mock `navigator.userAgent` to test iOS vs other platforms
- Test file: `src/components/stations/__tests__/StationCard.test.tsx`

### Project Structure Notes

- File already exists, only modifications needed
- No new files required unless extracting platform detection to utility
- If extracting utility: `src/lib/platformDetect.ts`

### References

- [Source: architecture.md - Navigation & Actions FR16-18]
- [Source: epics.md - Epic 4 Story 4.1]
- [Source: project-context.md - Testing patterns]
- [Source: StationCard.tsx:25-32 - Existing implementation]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

N/A

### Completion Notes List

- Added `isIOSDevice()` platform detection utility function that checks navigator.userAgent for iOS devices
- Enhanced `handleOpenMaps()` to prefer coordinates over address for more accurate navigation
- iOS devices now open Apple Maps with `maps://maps.apple.com/?daddr=lat,lng` scheme
- Non-iOS devices use Google Maps directions API with coordinates: `https://www.google.com/maps/dir/?api=1&destination=lat,lng`
- Falls back to address-based Google Maps search when coordinates unavailable
- Added 5 comprehensive unit tests covering iOS detection, coordinate-based URLs, and address fallback

### File List

- src/components/stations/StationCard.tsx (modified)
- src/components/stations/__tests__/StationCard.test.tsx (modified)

## Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.5
**Date:** 2026-01-27
**Outcome:** APPROVED with fixes applied

### Issues Found & Fixed

1. **[HIGH] Missing aria-label on directions button** - FIXED
   - Added `aria-label="Ouvrir dans l'application de navigation"` to directions button
   - Updated tests to use aria-label for button selection

2. **[MEDIUM] Magic number for feedback timeout** - FIXED
   - Extracted `FEEDBACK_TIMEOUT_MS = 2000` constant
   - Applied across all setTimeout calls in component

3. **[LOW] Platform detection uses userAgent** - NOTED
   - `isIOSDevice()` relies on userAgent string which can be spoofed
   - Acceptable for this use case; modern feature detection not required

### Verification

- ✅ All 5 Story 4-1 tests pass
- ✅ ESLint passes
- ✅ Build passes
- ✅ All ACs implemented and verified


