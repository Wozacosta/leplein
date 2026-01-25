---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments: ['prd.md', 'architecture.md']
status: complete
---

# lepleink - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for lepleink, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: User can grant location permission to enable nearby station discovery
- FR2: User can view fuel stations within a configurable radius of their current location
- FR3: User can see their approximate current location context (city/area name)
- FR4: User can manually search for stations by city or postcode if geolocation is unavailable
- FR5: User can view a list of nearby fuel stations with essential details (brand, address, distance)
- FR6: User can see the current price per liter for each fuel type at each station
- FR7: User can sort stations by price (lowest first - default)
- FR8: User can sort stations by distance (closest first)
- FR9: User can see how far each station is from their current location
- FR10: User can filter stations by fuel type (Gazole, SP95, SP98, E10, E85, GPLc)
- FR11: User can see both the common name and EU picto code for each fuel type (e.g., "SP95 (E5)")
- FR12: User can select a default fuel type that persists across sessions
- FR13: User can see when each station's price was last updated
- FR14: User can identify stations with stale data (visual indicator for old updates)
- FR15: User can see if a fuel type is marked as "rupture" (out of stock) at a station
- FR16: User can tap a station to open directions in their preferred maps app (Google Maps, Apple Maps, Waze)
- FR17: User can copy a station's address to clipboard
- FR18: User can share a station link with others
- FR19: System retrieves station data from the French government Fuel Prices API
- FR20: System calculates distance between user location and each station
- FR21: System handles API unavailability gracefully with appropriate user messaging
- FR22: System caches recent results to enable faster subsequent loads

### NonFunctional Requirements

- NFR1: Initial page load completes in < 2 seconds on 4G mobile connection
- NFR2: Station list renders within 3 seconds of location permission granted
- NFR3: Fuel type filter changes reflect instantly (< 100ms)
- NFR4: Sort order changes reflect instantly (< 100ms)
- NFR5: Lighthouse Mobile Performance score ≥ 90
- NFR6: WCAG 2.1 Level AA compliance
- NFR7: All interactive elements keyboard-navigable
- NFR8: Color contrast ratio minimum 4.5:1 for text
- NFR9: Screen reader compatible with proper ARIA labels
- NFR10: Touch targets minimum 44x44px on mobile
- NFR11: Graceful degradation when Fuel Prices API is unavailable (show cached data or error message)
- NFR12: Handle API rate limiting without crashing (retry with backoff)
- NFR13: Geolocation fallback to manual city/postcode entry if browser permission denied
- NFR14: Works offline with last-cached results (if previously loaded)
- NFR15: Full functionality in Chrome, Safari, Firefox, Edge (latest 2 versions)
- NFR16: Mobile Safari (iOS 14+) and Chrome Mobile fully supported
- NFR17: No horizontal scrolling on any viewport width ≥ 320px

### Additional Requirements

- Starter Template: `pnpm create next-app . --typescript --tailwind --eslint --app --src-dir` + `pnpm add swr` (Epic 1 Story 1)
- Named exports only, never `export default`
- SWR for all API data fetching (never useState for server data)
- React Context only for geolocation state
- Direct API calls to `https://api.prix-carburants.2aaz.fr` (public, no API key needed)
- Fetcher must include `Accept: application/json` header
- Tailwind CSS class ordering: Layout → Positioning → Box model → Typography → Visual → Interactive
- Mobile-first responsive design
- File naming: PascalCase for components, camelCase for hooks/utils
- Import ordering: React/Next → Third-party → Internal (@/) → Types → Relative

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | Location permission for nearby discovery |
| FR2 | Epic 1 | View stations within configurable radius |
| FR5 | Epic 1 | Station list with brand, address, distance |
| FR6 | Epic 1 | Price per liter for each fuel type |
| FR9 | Epic 1 | Distance from current location |
| FR19 | Epic 1 | System retrieves data from Fuel Prices API |
| FR20 | Epic 1 | System calculates distance |
| FR22 | Epic 1 | System caches results (SWR) |
| FR7 | Epic 2 | Sort by price (default) |
| FR8 | Epic 2 | Sort by distance |
| FR10 | Epic 2 | Filter by fuel type |
| FR11 | Epic 2 | Show common name + EU picto code |
| FR12 | Epic 2 | Default fuel type persists across sessions |
| FR3 | Epic 3 | Location context (city/area name) |
| FR13 | Epic 3 | Price last updated timestamp |
| FR14 | Epic 3 | Stale data visual indicator |
| FR15 | Epic 3 | Rupture (out of stock) indicator |
| FR16 | Epic 4 | Open directions in maps app |
| FR17 | Epic 4 | Copy address to clipboard |
| FR18 | Epic 4 | Share station link |
| FR4 | Epic 5 | Manual search by city/postcode |
| FR21 | Epic 5 | Graceful API unavailability handling |

## Epic List

### Epic 1: Project Foundation & Core Station Discovery
User can open the app, grant location permission, and see nearby fuel stations with prices.
**FRs covered:** FR1, FR2, FR5, FR6, FR9, FR19, FR20, FR22

### Epic 2: Fuel Filtering & Sorting
User can filter stations by their preferred fuel type and sort by price or distance to find the best option quickly.
**FRs covered:** FR7, FR8, FR10, FR11, FR12

### Epic 3: Data Transparency & Quality Indicators
User can see data freshness, identify stale prices, and know when fuel is out of stock - enabling informed decisions.
**FRs covered:** FR3, FR13, FR14, FR15

### Epic 4: Navigation & Sharing Actions
User can navigate to a station via their preferred maps app, copy addresses, and share stations with others.
**FRs covered:** FR16, FR17, FR18

### Epic 5: Fallback & Resilience
User can still find stations even when geolocation is denied or API is unavailable.
**FRs covered:** FR4, FR21

---

## Epic 1: Project Foundation & Core Station Discovery

User can open the app, grant location permission, and see nearby fuel stations with prices.

### Story 1.1: Project Initialization

As a developer,
I want a properly configured Next.js project with TypeScript, Tailwind CSS, and SWR,
So that I have a solid foundation to build the application.

**Acceptance Criteria:**

**Given** a new project directory
**When** the initialization command is run
**Then** the project uses Next.js 14+ with App Router, TypeScript strict mode, Tailwind CSS, ESLint, and src/ directory structure
**And** SWR is installed as a dependency
**And** the project builds and runs without errors
**And** basic folder structure is created (components/, hooks/, lib/, types/, contexts/)

### Story 1.2: Geolocation Context & Permission Flow

As a user,
I want to grant location permission when I open the app,
So that I can discover nearby fuel stations.

**Acceptance Criteria:**

**Given** the user opens the app for the first time
**When** the app loads
**Then** a location permission prompt is displayed with clear explanation
**And** the user can grant or deny permission

**Given** the user grants location permission
**When** the browser provides coordinates
**Then** the coordinates are stored in GeolocationContext
**And** the permission status is set to "granted"

**Given** the user denies location permission
**When** the permission is denied
**Then** the permission status is set to "denied"
**And** a helpful message is shown (fallback addressed in Epic 5)

### Story 1.3: Station API Integration & SWR Hook

As a user,
I want the app to fetch nearby fuel stations from the API,
So that I can see stations close to my location.

**Acceptance Criteria:**

**Given** valid coordinates are available in GeolocationContext
**When** the useStations hook is called
**Then** stations are fetched from `https://api.prix-carburants.2aaz.fr/stations/around/{lat},{lng}`
**And** the request includes `Accept: application/json` header
**And** results are cached by SWR

**Given** the API returns station data
**When** the data is processed
**Then** each station has id, name/brand, address, coordinates, and fuel prices
**And** distance from user is included in the response (API provides this)

### Story 1.4: Station List UI with Prices

As a user,
I want to see a list of nearby fuel stations with their prices,
So that I can quickly identify where to get fuel.

**Acceptance Criteria:**

**Given** stations data is loaded from the API
**When** the station list renders
**Then** each station card shows: brand/name, address, distance (formatted as "1.2 km"), and fuel prices
**And** prices are formatted as "1,72 €/L" (French locale)
**And** the list is mobile-first responsive (works on 320px+ viewports)
**And** loading skeleton is shown while data is fetching
**And** touch targets are minimum 44x44px

**Given** the user is on a larger screen (tablet/desktop)
**When** viewing the station list
**Then** the layout adapts appropriately (responsive breakpoints)

---

## Epic 2: Fuel Filtering & Sorting

User can filter stations by their preferred fuel type and sort by price or distance to find the best option quickly.

### Story 2.1: Fuel Type Filter

As a user,
I want to filter stations by fuel type,
So that I only see prices for the fuel my car uses.

**Acceptance Criteria:**

**Given** the station list is displayed
**When** the user views the fuel filter
**Then** all 6 fuel types are available: Gazole, SP95, SP98, E10, E85, GPLc
**And** each fuel type shows both common name and EU picto code (e.g., "SP95 (E5)", "Gazole (B7)")

**Given** the user selects a fuel type
**When** the filter is applied
**Then** stations are filtered to show only those with the selected fuel available
**And** station cards display the price for the selected fuel prominently
**And** filter changes reflect instantly (< 100ms)

### Story 2.2: Sort by Price or Distance

As a user,
I want to sort stations by price or distance,
So that I can find the cheapest or closest station.

**Acceptance Criteria:**

**Given** the station list is displayed
**When** the user views sort options
**Then** two options are available: "Price (lowest)" and "Distance (closest)"
**And** "Price (lowest)" is the default sort order

**Given** the user selects "Price (lowest)"
**When** the sort is applied
**Then** stations are ordered from cheapest to most expensive (for selected fuel type)
**And** sort changes reflect instantly (< 100ms)

**Given** the user selects "Distance (closest)"
**When** the sort is applied
**Then** stations are ordered from nearest to farthest
**And** sort changes reflect instantly (< 100ms)

### Story 2.3: Persistent Default Fuel Type

As a user,
I want my preferred fuel type to be remembered,
So that I don't have to select it every time I open the app.

**Acceptance Criteria:**

**Given** the user selects a fuel type
**When** the selection is made
**Then** the preference is saved to localStorage

**Given** the user returns to the app later
**When** the app loads
**Then** the previously selected fuel type is automatically applied
**And** the filter shows the saved preference as selected

**Given** the user has never selected a fuel type
**When** the app loads for the first time
**Then** no fuel filter is pre-selected (show all fuels) OR a sensible default is used

---

## Epic 3: Data Transparency & Quality Indicators

User can see data freshness, identify stale prices, and know when fuel is out of stock - enabling informed decisions.

### Story 3.1: Location Context Display

As a user,
I want to see my approximate location context,
So that I know where the app thinks I am.

**Acceptance Criteria:**

**Given** the user has granted location permission
**When** coordinates are available
**Then** the app displays the approximate area/city name (e.g., "Near Créteil")
**And** the location context is visible in the header or near the station list

### Story 3.2: Price Update Timestamps

As a user,
I want to see when each station's price was last updated,
So that I know how fresh the data is.

**Acceptance Criteria:**

**Given** a station card is displayed
**When** the user views the station details
**Then** the last price update time is shown in relative format (e.g., "Updated 2h ago", "Updated yesterday")
**And** the timestamp uses French locale formatting

### Story 3.3: Stale Data Visual Indicator

As a user,
I want to visually identify stations with outdated prices,
So that I can avoid relying on potentially inaccurate data.

**Acceptance Criteria:**

**Given** a station's price data is older than 48 hours
**When** the station card is displayed
**Then** a visual indicator marks the data as stale (e.g., warning icon, muted styling)
**And** the staleness is obvious but not alarming

**Given** a station's price data is fresh (within 48 hours)
**When** the station card is displayed
**Then** no staleness indicator is shown

### Story 3.4: Out of Stock (Rupture) Indicator

As a user,
I want to know if a fuel type is out of stock at a station,
So that I don't drive there for nothing.

**Acceptance Criteria:**

**Given** a fuel type is marked as "rupture" (out of stock) in the API
**When** the station card is displayed
**Then** the out-of-stock fuel is clearly indicated (e.g., "Rupture", strikethrough, or grayed out)
**And** the user understands they cannot get that fuel at this station

**Given** a station has no fuel in stock for the selected filter
**When** filtering by that fuel type
**Then** the station is either hidden from results or shown with clear "unavailable" status

---

## Epic 4: Navigation & Sharing Actions

User can navigate to a station via their preferred maps app, copy addresses, and share stations with others.

### Story 4.1: Open Directions in Maps App

As a user,
I want to tap a station to get directions,
So that I can navigate there easily.

**Acceptance Criteria:**

**Given** a station card is displayed
**When** the user taps the directions/navigate button
**Then** the device's default maps app opens with directions to the station
**And** on iOS, Apple Maps or user's default is used
**And** on Android/other, Google Maps link is used
**And** the link includes station coordinates for accurate navigation

### Story 4.2: Copy Address to Clipboard

As a user,
I want to copy a station's address,
So that I can paste it elsewhere or share it manually.

**Acceptance Criteria:**

**Given** a station card is displayed
**When** the user taps the copy address button
**Then** the station's full address is copied to clipboard
**And** a brief confirmation is shown (e.g., toast "Address copied")
**And** the Clipboard API is used with graceful fallback for unsupported browsers

### Story 4.3: Share Station Link

As a user,
I want to share a station with friends or family,
So that they can also benefit from the good price.

**Acceptance Criteria:**

**Given** a station card is displayed
**When** the user taps the share button
**Then** the native share dialog opens (on supported devices via Web Share API)
**And** the shared content includes station name, address, and current price

**Given** the Web Share API is not supported
**When** the user taps the share button
**Then** a fallback is provided (copy link to clipboard)

---

## Epic 5: Fallback & Resilience

User can still find stations even when geolocation is denied or API is unavailable.

### Story 5.1: Manual Location Search

As a user,
I want to search for stations by city or postcode,
So that I can find fuel even if I deny location permission or want to search elsewhere.

**Acceptance Criteria:**

**Given** the user has denied location permission OR wants to search another area
**When** the manual search input is available
**Then** the user can enter a city name or French postcode
**And** the app geocodes the input to coordinates
**And** stations near the searched location are displayed

**Given** the search input is invalid or not found
**When** the user submits the search
**Then** a helpful error message is shown (e.g., "Location not found, try another search")

### Story 5.2: API Error Handling & Graceful Degradation

As a user,
I want the app to handle errors gracefully,
So that I'm not stuck with a broken screen.

**Acceptance Criteria:**

**Given** the Fuel Prices API is unavailable or returns an error
**When** the app tries to fetch stations
**Then** a user-friendly error message is displayed (not technical jargon)
**And** the user is offered to retry
**And** if cached data exists, it is shown with a "data may be outdated" notice

**Given** the API returns a 429 (rate limit) response
**When** the app handles the error
**Then** automatic retry with exponential backoff is attempted (max 3 retries)
**And** the user is not aware of retries unless all fail

**Given** the user is offline
**When** previously cached data exists (from SWR)
**Then** the cached stations are displayed
**And** a notice indicates the data may be outdated
