# Story 1.1: Project Initialization

Status: done

## Story

As a developer,
I want a properly configured Next.js project with TypeScript, Tailwind CSS, and SWR,
So that I have a solid foundation to build the application.

## Acceptance Criteria

1. **Given** a new project directory
   **When** the initialization command is run
   **Then** the project uses Next.js 14+ with App Router, TypeScript strict mode, Tailwind CSS, ESLint, and src/ directory structure

2. **Given** the project is initialized
   **When** checking dependencies
   **Then** SWR is installed as a dependency

3. **Given** the project setup is complete
   **When** running build and dev commands
   **Then** the project builds and runs without errors

4. **Given** the project structure
   **When** checking folder organization
   **Then** basic folder structure is created: `components/`, `hooks/`, `lib/`, `types/`, `contexts/`

## Tasks / Subtasks

- [x] Task 1: Initialize Next.js project with correct configuration (AC: #1)
  - [x] 1.1: Run `pnpm create next-app . --typescript --tailwind --eslint --app --src-dir` (or verify existing setup matches)
  - [x] 1.2: Verify Next.js 14+ with App Router is configured
  - [x] 1.3: Verify TypeScript strict mode is enabled in tsconfig.json
  - [x] 1.4: Verify Tailwind CSS is configured with postcss
  - [x] 1.5: Verify ESLint is configured
  - [x] 1.6: Verify src/ directory structure exists

- [x] Task 2: Install SWR dependency (AC: #2)
  - [x] 2.1: Run `pnpm add swr`
  - [x] 2.2: Verify SWR is listed in package.json dependencies

- [x] Task 3: Create project folder structure (AC: #4)
  - [x] 3.1: Create `src/components/` directory with `ui/` and placeholder
  - [x] 3.2: Create `src/hooks/` directory with placeholder
  - [x] 3.3: Create `src/lib/` directory with placeholder
  - [x] 3.4: Create `src/types/` directory with placeholder
  - [x] 3.5: Create `src/contexts/` directory with placeholder

- [x] Task 4: Verify project builds and runs (AC: #3)
  - [x] 4.1: Run `pnpm build` and verify no errors
  - [x] 4.2: Run `pnpm dev` and verify dev server starts
  - [x] 4.3: Verify page loads at http://localhost:3000

## Dev Notes

### Architecture Requirements

**From architecture.md - Starter Template:**
```bash
pnpm create next-app . --typescript --tailwind --eslint --app --src-dir
pnpm add swr
```

**Required Project Structure (from architecture.md):**
```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/            # React components
│   └── ui/               # Generic UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities, helpers, API clients
├── types/                # TypeScript type definitions
└── contexts/             # React Context providers
```

### Critical Rules (from project-context.md)

1. **Named exports only** - NEVER use `export default`
2. **File naming:**
   - Components: `PascalCase.tsx`
   - Hooks: `camelCase.ts` with `use` prefix
   - Utils/Types: `camelCase.ts`
   - Folders: `kebab-case`

3. **TypeScript strict mode** must be enabled

### Technical Specifications

- **Next.js version:** 14+ with App Router
- **TypeScript:** Strict mode enabled
- **Tailwind CSS:** 4.x with PostCSS
- **Package manager:** pnpm
- **SWR:** For data fetching (to be used in later stories)

### Existing Project State

The project may already have some initialization done. Check existing:
- `package.json` - verify dependencies
- `tsconfig.json` - verify strict mode
- `tailwind.config.ts` - verify configuration
- `next.config.ts` - verify Next.js configuration

If setup already exists, verify it matches requirements rather than re-initializing.

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
- All folders should have a `.gitkeep` or placeholder file to ensure they're tracked

### References

- [Source: architecture.md#Starter Template Evaluation]
- [Source: architecture.md#Project Structure & Boundaries]
- [Source: project-context.md#Technology Stack]
- [Source: project-context.md#File Naming]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Build output: Compiled successfully in 1485.4ms, TypeScript in 1290.8ms

### Completion Notes List

- Project was already initialized with Next.js 16.1.4 (exceeds 14+ requirement)
- TypeScript strict mode confirmed enabled in tsconfig.json
- Tailwind CSS 4.x with @tailwindcss/postcss configured
- ESLint 9 with eslint-config-next configured
- SWR 2.3.8 already installed in dependencies
- All required folders already created with initial files:
  - src/components/ (with ui/, stations/, filters/, location/ subdirs)
  - src/hooks/ (useStations.ts, useFuels.ts, useLocalStorage.ts)
  - src/lib/ (api.ts, constants.ts, fetcher.ts, formatDistance.ts, formatPrice.ts, isStale.ts)
  - src/types/ (fuel.ts, geolocation.ts, station.ts)
  - src/contexts/ (GeolocationContext.tsx)
- Build completes without errors
- Dev server runs successfully (port 3000 or fallback)

### File List

- package.json (verified - contains all required dependencies)
- tsconfig.json (verified - strict mode enabled)
- next.config.ts (verified - Next.js configuration)
- postcss.config.mjs (verified - Tailwind PostCSS plugin)
- eslint.config.mjs (verified - ESLint configuration)
- src/app/ (existing App Router structure)
- src/app/page.tsx (MODIFIED - removed unused useState import)
- src/components/ (existing with subdirectories)
- src/components/stations/StationCard.tsx (MODIFIED - removed embedded FuelPriceRow)
- src/components/stations/FuelPriceRow.tsx (NEW - extracted from StationCard)
- src/hooks/ (existing with hook files)
- src/hooks/useLocalStorage.ts (MODIFIED - fixed setState in useEffect)
- src/lib/ (existing with utility files)
- src/types/ (existing with type files)
- src/contexts/ (existing with GeolocationContext)

## Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.5 (claude-opus-4-5-20251101)
**Date:** 2026-01-25
**Outcome:** APPROVED (with fixes applied)

### Issues Found and Fixed

| Severity | Issue | File | Resolution |
|----------|-------|------|------------|
| HIGH | ESLint error: setState called synchronously in useEffect causing cascading renders | `src/hooks/useLocalStorage.ts:12` | Refactored to use lazy initialization with `useState(() => ...)` pattern |
| MEDIUM | Unused import: `useState` imported but never used | `src/app/page.tsx:3` | Removed unused import |
| MEDIUM | `FuelPriceRow` component embedded in `StationCard.tsx` - violates single-component-per-file pattern | `src/components/stations/StationCard.tsx` | Extracted to new file `src/components/stations/FuelPriceRow.tsx` |

### Notes

- **export default in layout.tsx/page.tsx**: These files use `export default` which conflicts with project-context.md rule "ALWAYS use named exports". However, Next.js App Router **requires** default exports for these files. This is an architectural exception that should be documented.
- **package.json name**: Project is named "temp_init" instead of "lepleink" - cosmetic issue, not blocking.
- All Acceptance Criteria verified and passing after fixes.
- Build and lint both pass after fixes.

### Verification

- `pnpm lint`: ✅ Passes (0 errors, 0 warnings)
- `pnpm build`: ✅ Passes (compiled in 1676.8ms)

## Change Log

- 2026-01-25: Story verified complete - all acceptance criteria satisfied (existing project initialization confirmed)
- 2026-01-25: Code review completed - 3 issues fixed (1 HIGH, 2 MEDIUM), status updated to done
