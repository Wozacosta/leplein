---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
status: complete
inputDocuments: ['prd.md', 'swagger.yaml']
workflowType: 'architecture'
project_name: 'lepleink'
user_name: 'Samy.rabah-montarou'
date: '2026-01-25'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (22 total):**
- **Location & Discovery (FR1-FR4):** Geolocation permission flow, nearby station discovery within configurable radius, location context display, manual city/postcode fallback
- **Station Listing & Sorting (FR5-FR9):** Station list with brand/address/distance, price per fuel type, sort by price (default) or distance
- **Fuel Type Filtering (FR10-FR12):** Filter by 6 fuel types (Gazole, SP95, SP98, E10, E85, GPLc), display EU picto codes, persist default fuel preference
- **Data Quality (FR13-FR15):** Price update timestamps, stale data visual indicators, stock rupture status
- **Navigation & Actions (FR16-FR18):** External maps integration (Google/Apple/Waze), address copy, share functionality
- **System Behavior (FR19-FR22):** API consumption, distance calculation, error handling, result caching

**Non-Functional Requirements (17 total):**
- **Performance (NFR1-5):** < 2s page load on 4G, < 3s to results, instant filtering (< 100ms), Lighthouse 90+
- **Accessibility (NFR6-10):** WCAG 2.1 AA, keyboard navigation, 4.5:1 contrast, ARIA labels, 44x44px touch targets
- **Reliability (NFR11-14):** Graceful API degradation, rate limit handling with backoff, offline with cached data
- **Browser Support (NFR15-17):** Chrome/Safari/Firefox/Edge latest 2, iOS 14+, no horizontal scroll ≥320px

**Scale & Complexity:**

- Primary domain: Frontend web application
- Complexity level: Low
- Estimated architectural components: ~8-10 (geolocation service, API client, station list, filters, sorting, caching layer, error boundaries, UI components)

### Technical Constraints & Dependencies

**External API Constraints:**
- French Government Fuel Prices API (prix-carburants.gouv.fr via 2aaz.fr wrapper)
- Authentication: None required (public API)
- Requires `Accept: application/json` header
- Rate limits: 429 responses possible, requires retry with exponential backoff
- Pagination: Max 20 stations per request via Range header
- Geosearch: Max 10km radius, returns distance in response

**Browser API Dependencies:**
- Geolocation API (with permission handling)
- Clipboard API (address copy)
- Web Share API (native sharing where supported)

**Stack Constraints (from PRD):**
- Next.js 14+ with App Router
- Tailwind CSS
- React hooks for state (no Redux)
- Native fetch or SWR for API calls

### Cross-Cutting Concerns Identified

1. **Error Handling & Graceful Degradation:** Must handle API unavailability, rate limits, geolocation denial consistently across all components
2. **Caching Strategy:** Balance freshness with offline capability and performance
3. **Loading States:** Consistent UX during geolocation acquisition and API calls
4. **Geolocation State:** Permission status affects entire app flow (granted → auto-discovery, denied → manual entry)
5. **Data Freshness:** Staleness indicators need consistent visual treatment across station listings

## Starter Template Evaluation

### Primary Technology Domain

Frontend web application (Next.js) based on project requirements analysis.

### Starter Options Considered

1. **Official create-next-app** - Maintained by Vercel, minimal footprint, includes all needed options
2. **ixartz/Next-js-Boilerplate** - Full-featured but overkill for this low-complexity project
3. **Community starters** - Good but may lag behind Next.js updates

### Selected Starter: Official create-next-app

**Rationale for Selection:**
- Maintained by Vercel (guaranteed compatibility with latest Next.js)
- Includes Tailwind CSS option built-in
- App Router is default (matches PRD requirement)
- Minimal setup = fewer dependencies = faster builds
- Project complexity is low - no need for enterprise boilerplate

**Initialization Command:**

```bash
pnpm create next-app . --typescript --tailwind --eslint --app --src-dir
pnpm add swr
```

**Architectural Decisions Provided by Starter:**

| Category | Decision |
|----------|----------|
| **Language & Runtime** | TypeScript with strict mode, Node.js runtime |
| **Styling Solution** | Tailwind CSS 4.x with PostCSS |
| **Build Tooling** | Next.js built-in (Turbopack for dev, Webpack for prod) |
| **Testing Framework** | None included (add as needed) |
| **Code Organization** | `src/` directory with `app/` router structure |
| **Development Experience** | Hot reload, TypeScript checking, ESLint |

**Additional Setup Required (First Implementation Story):**
- Install SWR: `npm install swr` (for API caching per PRD)
- Set up basic error boundary component

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- API client architecture (SWR)
- Geolocation state management (React Context)
- Deployment platform (Vercel)

**Important Decisions (Shape Architecture):**
- Error handling patterns
- Caching strategy

**Deferred Decisions (Post-MVP):**
- Offline service worker (evaluate after MVP based on user feedback)
- Analytics integration
- Monetization integration (ads/tips jar)

### Data Architecture

**No Database Required**
- This is a read-only consumer of an external API
- No user accounts, no persistent data storage
- User preferences (default fuel type) stored in localStorage

**Caching Strategy:**
- SWR for client-side caching with stale-while-revalidate pattern
- Next.js API route can add response caching headers
- localStorage for user preferences persistence (FR12)

### Authentication & Security

**No User Authentication Required**
- Zero friction experience per PRD - no signup/login

**No API Key Required**
- 2aaz.fr API is public, no authentication needed
- Only requires `Accept: application/json` header
- Can call directly from client or use API route proxy for caching

### API & Communication Patterns

**Internal API Design:**
```
GET /api/stations?lat={lat}&lng={lng}&fuel={fuelId}
GET /api/fuels (reference data, cacheable)
```

**External API Integration:**
- Single integration point: Fuel Prices API via 2aaz.fr
- Retry with exponential backoff on 429 (rate limit)
- Graceful fallback to cached data on API failure

**Error Handling Standards:**
- Consistent error response shape from API routes
- Client-side error boundaries for React component failures
- User-friendly error messages (not technical jargon)

### Frontend Architecture

**State Management:**
- React Context for geolocation state (permission status, coordinates)
- SWR for server state (stations, fuels)
- localStorage for user preferences (default fuel type)

**Component Architecture:**
- Functional components with hooks only
- Co-located styles using Tailwind utility classes
- No CSS modules or styled-components

**Performance Optimization:**
- SWR deduplication prevents redundant API calls
- Next.js automatic code splitting
- Tailwind CSS purging for minimal CSS bundle

### Infrastructure & Deployment

**Hosting: Vercel**
- Native Next.js support with zero configuration
- Automatic HTTPS and CDN
- Preview deployments for PRs
- Free tier sufficient for MVP

**Environment Configuration:**
- `NEXT_PUBLIC_DEFAULT_RADIUS` - Default search radius in meters (optional)

**CI/CD:**
- Vercel automatic deployments on push to main
- Preview deployments on PRs
- No additional CI setup required for MVP

### Decision Impact Analysis

**Implementation Sequence:**
1. Project initialization (create-next-app)
2. SWR configuration and API client hooks
3. Geolocation context provider
4. UI components

**Cross-Component Dependencies:**
- All station data flows through SWR hooks
- Geolocation context wraps entire app
- API routes are the single source of external data

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 9 areas where AI agents could make different choices

### Naming Patterns

**File & Folder Naming:**
- Components: `PascalCase.tsx` (e.g., `StationCard.tsx`, `FuelFilter.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useStations.ts`, `useGeolocation.ts`)
- Utilities: `camelCase.ts` (e.g., `formatPrice.ts`, `calculateDistance.ts`)
- Types: `camelCase.ts` (e.g., `station.ts`, `fuel.ts`)
- API routes: `kebab-case` folders (e.g., `api/stations/route.ts`)
- Folders: `kebab-case` (e.g., `station-list/`, `fuel-filter/`)

**Component Naming:**
- React components: `PascalCase` (e.g., `StationCard`, `FuelFilter`)
- Props interfaces: `{ComponentName}Props` (e.g., `StationCardProps`)
- Event handlers: `handle{Event}` (e.g., `handleFilterChange`, `handleStationClick`)

**Variable & Function Naming:**
- Variables: `camelCase` (e.g., `stationList`, `selectedFuel`)
- Functions: `camelCase` with verb prefix (e.g., `getStations`, `formatPrice`)
- Constants: `SCREAMING_SNAKE_CASE` for true constants (e.g., `DEFAULT_RADIUS`, `FUEL_TYPES`)
- Booleans: `is/has/should` prefix (e.g., `isLoading`, `hasError`, `shouldRefetch`)

### Structure Patterns

**Project Organization (feature-based):**
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── stations/      # /api/stations
│   │   └── fuels/         # /api/fuels
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/            # React components
│   ├── ui/               # Generic UI components (Button, Card, etc.)
│   └── stations/         # Feature-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities, helpers, API clients
├── types/                # TypeScript type definitions
└── contexts/             # React Context providers
```

**Component File Structure:**
```typescript
// Single component per file
// Named export (not default)
// Props interface co-located

interface StationCardProps {
  station: Station;
  onSelect: (id: number) => void;
}

export function StationCard({ station, onSelect }: StationCardProps) {
  // component implementation
}
```

### Format Patterns

**API Response Format:**
```typescript
// Success response
{ data: T }

// Error response
{ error: { message: string; code?: string } }

// Never mix data and error in same response
```

**TypeScript Types:**
```typescript
// Use interfaces for object shapes
interface Station {
  id: number;
  name: string;
  // ...
}

// Use type for unions, primitives, functions
type FuelType = 'gazole' | 'sp95' | 'sp98' | 'e10' | 'e85' | 'gplc';
type SortOrder = 'price' | 'distance';
```

**Date/Time Handling:**
- Store as ISO 8601 strings from API
- Display using `Intl.DateTimeFormat` for localization
- Staleness calculation in component, not API

### Communication Patterns

**SWR Hook Pattern:**
```typescript
// All API data access through custom hooks
// Hook returns: { data, error, isLoading, mutate }
// Calls 2aaz.fr directly (public API, no key needed)

const API_BASE = 'https://api.prix-carburants.2aaz.fr';

export function useStations(lat: number, lng: number) {
  return useSWR<Station[]>(
    lat && lng ? `${API_BASE}/stations/around/${lat},${lng}` : null,
    fetcher
  );
}

// Fetcher must include Accept header
const fetcher = (url: string) => 
  fetch(url, { headers: { 'Accept': 'application/json' } })
    .then(res => res.json());
}
```

**Context Pattern:**
```typescript
// Context for cross-cutting state only (geolocation, preferences)
// Never for server data (use SWR)

interface GeolocationContextValue {
  coordinates: { lat: number; lng: number } | null;
  status: 'idle' | 'requesting' | 'granted' | 'denied';
  requestPermission: () => void;
}
```

### Process Patterns

**Error Handling:**
```typescript
// API routes: Always return structured error
if (!response.ok) {
  return NextResponse.json(
    { error: { message: 'Failed to fetch stations', code: 'FETCH_ERROR' } },
    { status: response.status }
  );
}

// Components: Use error boundary for unexpected errors
// Use conditional rendering for expected errors (API failures)
{error && <ErrorMessage message={error.message} />}
```

**Loading States:**
```typescript
// Use SWR's isLoading (not custom state)
// Show skeleton UI, not spinners, for content areas
// Minimum 3 skeleton items to prevent layout shift

{isLoading && <StationListSkeleton count={3} />}
{data && <StationList stations={data.stations} />}
```

**Retry Pattern (API routes only):**
```typescript
// Exponential backoff for 429 responses
// Max 3 retries
// Initial delay: 1000ms, multiplier: 2

async function fetchWithRetry(url: string, retries = 3, delay = 1000) {
  // implementation
}
```

### Tailwind Patterns

**Class Ordering:**
Follow official Tailwind CSS class order:
1. Layout (flex, grid, block)
2. Positioning (relative, absolute)
3. Box model (w, h, p, m)
4. Typography (text, font)
5. Visual (bg, border, shadow)
6. Interactive (hover, focus)

**Example:**
```tsx
<div className="flex items-center justify-between p-4 text-sm bg-white border rounded-lg hover:bg-gray-50">
```

**Responsive Pattern:**
- Mobile-first: Start with mobile styles, add `md:` and `lg:` for larger
- Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px)

### Import Ordering

```typescript
// 1. React/Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import useSWR from 'swr';

// 3. Internal absolute imports
import { useGeolocation } from '@/contexts/GeolocationContext';
import { formatPrice } from '@/lib/formatPrice';

// 4. Types
import type { Station } from '@/types/station';

// 5. Relative imports (components in same feature)
import { StationCard } from './StationCard';
```

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow file naming conventions exactly (PascalCase for components, camelCase for hooks/utils)
- Use named exports, never default exports
- Access API data only through SWR hooks, never direct fetch in components
- Use the established API response format (`{ data }` or `{ error }`)
- Follow the import ordering pattern
- Use Tailwind classes in the specified order

**Anti-Patterns (NEVER DO):**
- `export default function` - Always use named exports
- `useState` for server data - Use SWR hooks
- Inline API calls in components - Create hooks in `/hooks`
- Mixed kebab-case and PascalCase filenames
- Putting types in component files - Use `/types` directory

## Project Structure & Boundaries

### Complete Project Directory Structure

```
lepleink/
├── README.md
├── package.json
├── package-lock.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── .eslintrc.json
├── .gitignore
├── .env.local                    # Local dev (not committed, optional)
├── .env.example                  # Template for env vars (optional)
│
├── public/
│   ├── favicon.ico
│   └── manifest.json             # PWA manifest (future)
│
└── src/
    ├── app/
    │   ├── globals.css           # Tailwind imports + global styles
    │   ├── layout.tsx            # Root layout with providers
    │   ├── page.tsx              # Home page (station list)
    │   ├── error.tsx             # Error boundary
    │   └── loading.tsx           # Loading state
    │
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Skeleton.tsx
    │   │   └── ErrorMessage.tsx
    │   ├── stations/
    │   │   ├── StationList.tsx
    │   │   ├── StationCard.tsx
    │   │   ├── StationListSkeleton.tsx
    │   │   └── StationActions.tsx    # Maps link, copy, share
    │   ├── filters/
    │   │   ├── FuelFilter.tsx
    │   │   ├── SortSelector.tsx
    │   │   └── RadiusSelector.tsx
    │   ├── location/
    │   │   ├── LocationPrompt.tsx    # Permission request UI
    │   │   ├── LocationStatus.tsx    # Current location display
    │   │   └── ManualLocationInput.tsx
    │   └── layout/
    │       ├── Header.tsx
    │       └── Footer.tsx
    │
    ├── hooks/
    │   ├── useStations.ts            # SWR hook for stations
    │   ├── useFuels.ts               # SWR hook for fuel types
    │   └── useLocalStorage.ts        # Preference persistence
    │
    ├── contexts/
    │   └── GeolocationContext.tsx    # Geolocation state provider
    │
    ├── lib/
    │   ├── fetcher.ts                # SWR fetcher with Accept header
    │   ├── api.ts                    # API base URL and endpoints
    │   ├── formatPrice.ts            # Price formatting (€1.72/L)
    │   ├── formatDistance.ts         # Distance formatting (1.2 km)
    │   ├── formatTimestamp.ts        # Relative time ("2h ago")
    │   ├── isStale.ts                # Staleness calculation
    │   └── constants.ts              # FUEL_TYPES, DEFAULT_RADIUS, etc.
    │
    └── types/
        ├── station.ts                # Station, StationFuel interfaces
        ├── fuel.ts                   # Fuel, FuelType interfaces
        ├── api.ts                    # API response types
        └── geolocation.ts            # Geolocation state types
```

### Architectural Boundaries

**API Boundaries:**
```
Browser (SWR hooks) → External Fuel Prices API (2aaz.fr)

Direct calls to:
- https://api.prix-carburants.2aaz.fr/stations/around/{lat},{lng}
- https://api.prix-carburants.2aaz.fr/fuels/
```

- No API key needed - public API
- Requires `Accept: application/json` header
- SWR handles caching client-side

**Component Boundaries:**
```
                    ┌─────────────────────┐
                    │   GeolocationContext │
                    │   (wraps entire app) │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   ┌────▼────┐           ┌─────▼─────┐         ┌──────▼──────┐
   │ Location │           │  Filters  │         │ StationList │
   │ Components│           │ Components│         │ Components  │
   └──────────┘           └───────────┘         └─────────────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │    SWR Hooks        │
                    │ (useStations, etc.) │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    API Routes       │
                    └─────────────────────┘
```

**Data Flow:**
1. User grants location permission → `GeolocationContext` updates
2. Context provides coordinates → `useStations` hook fetches
3. SWR caches response → components render station list
4. User changes filter → URL params update → SWR refetches

### Requirements to Structure Mapping

| FR Category | Components | Hooks | API Routes |
|-------------|------------|-------|------------|
| **Location & Discovery (FR1-4)** | `location/*` | - | - |
| **Station Listing (FR5-9)** | `stations/*` | `useStations` | 2aaz.fr direct |
| **Fuel Filtering (FR10-12)** | `filters/*` | `useFuels` | 2aaz.fr direct |
| **Data Quality (FR13-15)** | `StationCard` (badges) | - | - |
| **Navigation (FR16-18)** | `StationActions` | - | - |
| **System Behavior (FR19-22)** | - | all hooks | 2aaz.fr direct |

**Cross-Cutting Concerns Mapping:**

| Concern | Location |
|---------|----------|
| Error handling | `src/app/error.tsx`, `ErrorMessage.tsx` |
| Loading states | `src/app/loading.tsx`, `*Skeleton.tsx` |
| Geolocation state | `src/contexts/GeolocationContext.tsx` |
| API caching | `src/hooks/useStations.ts` (SWR) |
| User preferences | `src/hooks/useLocalStorage.ts` |
| API config | `src/lib/api.ts` |

### Environment Configuration

**.env.example:**
```bash
# Optional - Default search radius in meters (default: 5000)
NEXT_PUBLIC_DEFAULT_RADIUS=5000
```

**Note:** No API keys required - the 2aaz.fr API is public.

### File Responsibilities

| File | Single Responsibility |
|------|----------------------|
| `useStations.ts` | Fetch stations via SWR from 2aaz.fr |
| `GeolocationContext.tsx` | Manage permission state, provide coordinates |
| `StationCard.tsx` | Display single station with all info |
| `FuelFilter.tsx` | Fuel type selection UI |
| `fetcher.ts` | SWR fetcher with Accept: application/json header |
| `api.ts` | API base URL and endpoint builders |
| `formatPrice.ts` | Format price as "1,72 €/L" |
