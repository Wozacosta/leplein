# Story 4.2: Copy Address to Clipboard

Status: done

## Story

As a user,
I want to copy a station's address,
So that I can paste it elsewhere or share it manually.

## Acceptance Criteria

1. **Given** a station card is displayed **When** the user taps the copy address button **Then** the station's full address is copied to clipboard
2. **And** a brief confirmation is shown (e.g., toast "Address copied")
3. **And** the Clipboard API is used with graceful fallback for unsupported browsers

## Tasks / Subtasks

- [x] Task 1: Implement copy address functionality (AC: #1, #2)
  - [x] Subtask 1.1: Copy button exists in StationCard.tsx
  - [x] Subtask 1.2: handleCopyAddress function implemented with Clipboard API
  - [x] Subtask 1.3: Visual feedback states (success/error) implemented
- [x] Task 2: Add graceful fallback for unsupported browsers (AC: #3)
  - [x] Subtask 2.1: Implement document.execCommand fallback for older browsers
  - [x] Subtask 2.2: Test fallback triggers when Clipboard API unavailable
- [x] Task 3: Write unit tests for copy functionality (AC: all)
  - [x] Subtask 3.1: Test copy button renders correctly
  - [x] Subtask 3.2: Test successful copy shows success feedback
  - [x] Subtask 3.3: Test failed copy shows error feedback
  - [x] Subtask 3.4: Test correct address string is copied
  - [x] Subtask 3.5: Test accessibility (button has proper aria-label)
  - [x] Subtask 3.6: Test feedback clears after timeout

## Dev Notes

### CRITICAL: Implementation Already Complete!

The `handleCopyAddress()` function **already exists** in `src/components/stations/StationCard.tsx:34-44`:

```typescript
const handleCopyAddress = async () => {
  const address = `${station.Address.street_line}, ${station.Address.city_line}`;
  try {
    await navigator.clipboard.writeText(address);
    setCopyFeedback("success");
    setTimeout(() => setCopyFeedback("idle"), 2000);
  } catch {
    setCopyFeedback("error");
    setTimeout(() => setCopyFeedback("idle"), 2000);
  }
};
```

**Visual feedback states are implemented:**
- `copyFeedback` state: "idle" | "success" | "error"
- Button color changes: green for success, red for error, gray for idle
- Icon changes: checkmark for success, X for error, clipboard for idle
- Timeout: 2 seconds before returning to idle

**What's missing:**
1. **Tests** - No unit tests for copy functionality exist
2. **Fallback** - AC#3 mentions graceful fallback for unsupported browsers, but the current implementation only uses navigator.clipboard (modern API)

### Recommended Fallback Enhancement (Optional)

For browsers that don't support the Clipboard API:

```typescript
const handleCopyAddress = async () => {
  const address = `${station.Address.street_line}, ${station.Address.city_line}`;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(address);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = address;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopyFeedback("success");
    setTimeout(() => setCopyFeedback("idle"), 2000);
  } catch {
    setCopyFeedback("error");
    setTimeout(() => setCopyFeedback("idle"), 2000);
  }
};
```

**Note:** The fallback is likely unnecessary given NFR15 (latest 2 browser versions support Clipboard API). Discuss with PM if this complexity is warranted.

### Architecture Compliance

- Component location: `src/components/stations/StationCard.tsx` (exists)
- Test location: `src/components/stations/__tests__/StationCard.test.tsx`
- Pattern: Named exports, Tailwind classes, mobile-first responsive
- Touch target: Already 44px minimum height (compliant)
- Accessibility: aria-label implemented for all button states

### Testing Requirements

- Use Vitest + React Testing Library (already configured)
- Mock `navigator.clipboard.writeText` to verify copy behavior
- Use fake timers to test feedback timeout clearing
- Test file: `src/components/stations/__tests__/StationCard.test.tsx`

**Test scenarios to add:**
```typescript
describe("copy address functionality", () => {
  it("copies address when copy button is clicked", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    
    // ... render and click
    
    expect(writeText).toHaveBeenCalledWith("123 Rue de Test, 75001 Paris");
  });
  
  it("shows success feedback after successful copy", async () => { /* ... */ });
  it("shows error feedback when copy fails", async () => { /* ... */ });
  it("clears feedback after 2 seconds", async () => { /* ... */ });
});
```

### Project Structure Notes

- No new files required - functionality exists in StationCard.tsx
- Only test additions needed
- Fallback implementation optional based on browser support requirements

### References

- [Source: architecture.md - Navigation & Actions FR17]
- [Source: architecture.md - Browser Support NFR15-16]
- [Source: epics.md - Epic 4 Story 4.2]
- [Source: StationCard.tsx:34-44 - Existing implementation]
- [Source: StationCard.tsx:105-156 - Copy button JSX with feedback states]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

N/A

### Completion Notes List

- Created reusable `copyToClipboard()` utility function with automatic fallback
- Primary method: `navigator.clipboard.writeText()` for modern browsers
- Fallback method: Creates hidden textarea, uses `document.execCommand('copy')` for older browsers
- Updated `handleCopyAddress()` to use the new utility function
- Added 6 comprehensive unit tests covering success/error feedback, fallback behavior, and timeout clearing

### File List

- src/components/stations/StationCard.tsx (modified)
- src/components/stations/__tests__/StationCard.test.tsx (modified)

## Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.5
**Date:** 2026-01-27
**Outcome:** APPROVED

### Issues Found

1. **[MEDIUM] Copy fallback uses deprecated API** - NOTED
   - `document.execCommand("copy")` is deprecated but still functional
   - Low risk given NFR15 browser support requirements
   - Fallback implementation is correct and tested

### Verification

- ✅ All 6 Story 4-2 tests pass
- ✅ ESLint passes
- ✅ Build passes
- ✅ All ACs implemented including fallback behavior


