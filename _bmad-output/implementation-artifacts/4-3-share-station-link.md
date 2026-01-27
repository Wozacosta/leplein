# Story 4.3: Share Station Link

Status: done

## Story

As a user,
I want to share a station with friends or family,
So that they can also benefit from the good price.

## Acceptance Criteria

1. **Given** a station card is displayed **When** the user taps the share button **Then** the native share dialog opens (on supported devices via Web Share API)
2. **And** the shared content includes station name, address, and current price
3. **Given** the Web Share API is not supported **When** the user taps the share button **Then** a fallback is provided (copy link to clipboard)

## Tasks / Subtasks

- [x] Task 1: Add share button to StationCard action row (AC: #1)
  - [x] Subtask 1.1: Add share button next to existing copy button
  - [x] Subtask 1.2: Use share icon (arrow pointing up/out)
  - [x] Subtask 1.3: Ensure 44px minimum touch target
  - [x] Subtask 1.4: Add appropriate aria-label for accessibility
- [x] Task 2: Implement Web Share API integration (AC: #1, #2)
  - [x] Subtask 2.1: Create handleShare function
  - [x] Subtask 2.2: Build share content with station name, address, price
  - [x] Subtask 2.3: Call navigator.share() with title, text, and optional URL
  - [x] Subtask 2.4: Handle share success/cancellation gracefully
- [x] Task 3: Implement fallback for unsupported browsers (AC: #3)
  - [x] Subtask 3.1: Check for navigator.share support before calling
  - [x] Subtask 3.2: Fall back to copying share text to clipboard
  - [x] Subtask 3.3: Show appropriate feedback message for fallback
- [x] Task 4: Write unit tests for share functionality (AC: all)
  - [x] Subtask 4.1: Test share button renders correctly
  - [x] Subtask 4.2: Test Web Share API is called with correct content
  - [x] Subtask 4.3: Test fallback triggers when Web Share API unavailable
  - [x] Subtask 4.4: Test share content includes station name, address, price
  - [x] Subtask 4.5: Test accessibility (button has proper aria-label)

## Dev Notes

### NEW IMPLEMENTATION REQUIRED

Unlike stories 4-1 and 4-2, the share functionality does **NOT** exist yet. This requires full implementation.

### Recommended Implementation

**1. Add state for share feedback:**
```typescript
const [shareFeedback, setShareFeedback] = useState<"idle" | "success" | "error">("idle");
```

**2. Create handleShare function:**
```typescript
const handleShare = async () => {
  // Build share content
  const selectedPrice = selectedFuel?.Price?.text || "Prix non disponible";
  const shareTitle = station.Brand?.shortName || station.name;
  const shareText = `${shareTitle}\n${station.Address.street_line}, ${station.Address.city_line}\n${selectedFuel?.shortName || "Carburant"}: ${selectedPrice}`;
  
  // Check Web Share API support
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Station ${shareTitle}`,
        text: shareText,
        // Note: URL would require deep linking which isn't implemented
      });
      // User completed share - no feedback needed as native UI handles it
    } catch (error) {
      // User cancelled share - not an error, silently ignore
      if ((error as Error).name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  } else {
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      setShareFeedback("success");
      setTimeout(() => setShareFeedback("idle"), 2000);
    } catch {
      setShareFeedback("error");
      setTimeout(() => setShareFeedback("idle"), 2000);
    }
  }
};
```

**3. Add share button to action row (after copy button):**
```tsx
<button
  type="button"
  onClick={handleShare}
  className={`flex items-center justify-center px-3 min-h-[44px] min-w-[44px] text-sm font-medium rounded-lg transition-colors ${
    shareFeedback === "success"
      ? "bg-green-100 text-green-700"
      : shareFeedback === "error"
        ? "bg-red-100 text-red-700"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
  }`}
  title={
    shareFeedback === "success"
      ? "Copié pour partage !"
      : shareFeedback === "error"
        ? "Erreur de partage"
        : "Partager la station"
  }
  aria-label={
    shareFeedback === "success"
      ? "Informations copiées"
      : shareFeedback === "error"
        ? "Erreur lors du partage"
        : "Partager cette station"
  }
>
  {shareFeedback === "success" ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ) : shareFeedback === "error" ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  )}
</button>
```

### Share Content Format

The shared message should be formatted for readability:
```
Total
123 Rue de Test, 75001 Paris
Gazole: 1,72 €/L
```

### Web Share API Notes

- Supported on: iOS Safari, Chrome Android, Chrome desktop (Windows/ChromeOS), Edge
- NOT supported on: Firefox desktop, Safari desktop (macOS)
- The API returns a Promise that:
  - Resolves when user completes share
  - Rejects with `AbortError` when user cancels (not a real error)
  - Rejects with other errors on actual failures

### Architecture Compliance

- Component location: `src/components/stations/StationCard.tsx`
- Test location: `src/components/stations/__tests__/StationCard.test.tsx`
- Pattern: Named exports, Tailwind classes, mobile-first responsive
- Touch target: 44px minimum (use `min-h-[44px] min-w-[44px]`)
- Accessibility: aria-label for all button states

### Testing Requirements

- Use Vitest + React Testing Library (already configured)
- Mock `navigator.share` for Web Share API tests
- Mock `navigator.clipboard.writeText` for fallback tests
- Test file: `src/components/stations/__tests__/StationCard.test.tsx`

**Test scenarios:**
```typescript
describe("share station functionality", () => {
  it("renders share button", () => { /* ... */ });
  
  it("calls Web Share API when supported", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share });
    // ... render and click share
    expect(share).toHaveBeenCalledWith({
      title: expect.stringContaining("Station"),
      text: expect.stringContaining("123 Rue de Test"),
    });
  });
  
  it("falls back to clipboard when Web Share not supported", async () => {
    Object.assign(navigator, { share: undefined });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    // ... render and click
    expect(writeText).toHaveBeenCalled();
  });
  
  it("includes station name, address, and price in share content", () => { /* ... */ });
  
  it("shows success feedback when fallback copy succeeds", () => { /* ... */ });
});
```

### Project Structure Notes

- Modify existing file: `src/components/stations/StationCard.tsx`
- Add tests to: `src/components/stations/__tests__/StationCard.test.tsx`
- No new files required

### Previous Story Intelligence

From 4-1 and 4-2 implementation:
- Copy feedback pattern already established (success/error/idle states)
- Button styling pattern established
- Icon pattern established (SVG inline)
- 2-second timeout for feedback clearing

### References

- [Source: architecture.md - Navigation & Actions FR18]
- [Source: architecture.md - Web Share API in Browser API Dependencies]
- [Source: epics.md - Epic 4 Story 4.3]
- [Source: StationCard.tsx - Existing copy button pattern to follow]
- [Source: project-context.md - Component patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

N/A

### Completion Notes List

- Added new `shareFeedback` state for tracking share button visual states (idle/success/error)
- Implemented `handleShare()` function with Web Share API integration
- Share content includes station name, full address, selected fuel type and price
- Gracefully handles AbortError when user cancels share (no error shown)
- Falls back to `copyToClipboard()` utility when Web Share API unavailable or fails
- Share button follows same visual pattern as copy button (green success, red error, gray idle)
- Uses share icon SVG with proper accessibility (aria-label for all states)
- Button meets 44px minimum touch target requirement
- Added 8 comprehensive unit tests covering Web Share API, fallback, error handling, and content validation

### File List

- src/components/stations/StationCard.tsx (modified)
- src/components/stations/__tests__/StationCard.test.tsx (modified)

## Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.5
**Date:** 2026-01-27
**Outcome:** APPROVED

### Issues Found

1. **[MEDIUM] Share content missing URL** - NOTED
   - Web Share API call doesn't include URL parameter
   - Known limitation documented in dev notes (deep linking not implemented)
   - AC met: station name, address, and price are included

### Verification

- ✅ All 8 Story 4-3 tests pass
- ✅ ESLint passes
- ✅ Build passes
- ✅ All ACs implemented
- ✅ AbortError (user cancel) handled gracefully
- ✅ Fallback to clipboard works when Web Share API unavailable


