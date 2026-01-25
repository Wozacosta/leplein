# Lepleink

A mobile-first web app for finding the cheapest fuel prices near you in France. Uses real-time data from the official French government fuel price API.

## Features

- **Geolocation-based search** - Automatically finds stations near you
- **Fuel type filtering** - Filter by Gazole, SP95, SP98, E10, E85, or GPLc
- **Price sorting** - Sort stations by price or distance
- **Real-time prices** - Data from the official prix-carburants API
- **Stock status** - Shows fuel availability (rupture indicators)
- **Quick actions** - Open directions in Maps, copy address

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Data Fetching:** SWR
- **State:** React Context (geolocation)

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Lint
pnpm lint
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
src/
├── app/           # Next.js pages + layout
├── components/    # React components
│   ├── ui/        # Generic UI components
│   ├── stations/  # Station list & cards
│   ├── filters/   # Fuel filter
│   └── location/  # Geolocation prompt
├── hooks/         # SWR hooks (useStations)
├── contexts/      # React Context (GeolocationContext)
├── lib/           # Utils (formatPrice, formatDistance, etc.)
└── types/         # TypeScript interfaces
```

## API

Uses the public French fuel price API:
- Base URL: `https://api.prix-carburants.2aaz.fr`
- Endpoint: `GET /stations/around/{lat},{lng}` - Stations near location

No API key required.

## License

MIT
