---
project_name: 'lepleink'
date: '2026-01-25'
status: 'complete'
---

# Project Context for AI Agents

_Critical rules and patterns for implementing lepleink. Read before writing any code._

---

## Technology Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4.x
- **Data Fetching:** SWR
- **State:** React Context (geolocation only)
- **Deploy:** Vercel

---

## Critical Implementation Rules

### Exports & Imports

- **ALWAYS use named exports**, never `export default`
- Import order: React/Next → Third-party → Internal (`@/`) → Types → Relative

```typescript
import { useState } from 'react';
import useSWR from 'swr';
import { useGeolocation } from '@/contexts/GeolocationContext';
import type { Station } from '@/types/station';
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `StationCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useStations.ts`)
- Utils/Types: `camelCase.ts` (e.g., `formatPrice.ts`)
- Folders: `kebab-case` (e.g., `station-list/`)

### Data Fetching

- **ALL API data via SWR hooks** - never `fetch` in components
- **NEVER use `useState` for server data** - SWR handles it
- Fetcher MUST include `Accept: application/json` header

```typescript
const API_BASE = 'https://api.prix-carburants.2aaz.fr';

const fetcher = (url: string) => 
  fetch(url, { headers: { 'Accept': 'application/json' } })
    .then(res => res.json());

export function useStations(lat: number, lng: number) {
  return useSWR<Station[]>(
    lat && lng ? `${API_BASE}/stations/around/${lat},${lng}` : null,
    fetcher
  );
}
```

### State Management

- **React Context:** Only for geolocation state
- **SWR:** All server/API data
- **localStorage:** User preferences (default fuel type)
- **NO Redux** - not needed for this app

### Component Structure

```typescript
// Single component per file, props interface co-located
interface StationCardProps {
  station: Station;
  onSelect: (id: number) => void;
}

export function StationCard({ station, onSelect }: StationCardProps) {
  // implementation
}
```

### Tailwind Class Order

1. Layout (flex, grid)
2. Positioning (relative, absolute)
3. Box model (w, h, p, m)
4. Typography (text, font)
5. Visual (bg, border, shadow)
6. Interactive (hover, focus)

```tsx
<div className="flex items-center p-4 text-sm bg-white border rounded-lg hover:bg-gray-50">
```

### Responsive Design

- **Mobile-first** - base styles for mobile, add `md:` and `lg:` for larger
- Minimum touch target: `44x44px`
- No horizontal scroll on any viewport

---

## Anti-Patterns (NEVER DO)

| Don't | Do Instead |
|-------|------------|
| `export default function` | `export function Name` |
| `useState` for API data | `useSWR` hook |
| `fetch()` in components | Create hook in `/hooks` |
| Types in component files | Put in `/types` directory |
| Direct API calls to 2aaz.fr in components | Use SWR hooks |

---

## API Reference

**Base URL:** `https://api.prix-carburants.2aaz.fr`

**Endpoints:**
- `GET /stations/around/{lat},{lng}` - Stations near location
- `GET /fuels/` - Fuel type reference data

**Required Header:** `Accept: application/json`

**No API key needed** - public API

---

## Project Structure

```
src/
├── app/           # Next.js pages + layout
├── components/    # React components (ui/, stations/, filters/, location/)
├── hooks/         # SWR hooks (useStations, useFuels)
├── contexts/      # React Context (GeolocationContext)
├── lib/           # Utils (fetcher, formatPrice, api)
└── types/         # TypeScript interfaces
```
