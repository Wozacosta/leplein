---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain-skipped', 'step-06-innovation-skipped', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
inputDocuments: ['swagger.yaml']
workflowType: 'prd'
documentCounts:
  briefs: 0
  research: 0
  projectDocs: 0
  apiSpecs: 1
projectType: 'greenfield'
classification:
  projectType: 'web_app'
  domain: 'general'
  complexity: 'low'
  projectContext: 'greenfield'
  characteristics:
    - 'browser-based'
    - 'responsive-design'
    - 'real-time-geolocation'
    - 'api-consumption'
    - 'consumer-facing'
    - 'performance-critical'
status: 'complete'
---

# Product Requirements Document - lepleink

**Author:** Samy.rabah-montarou
**Date:** 2025-01-25
**Status:** Complete

## Executive Summary

**lepleink** is a mobile-first web application that helps French drivers find the cheapest fuel near their current location. Users open the app, grant location permission, and instantly see nearby fuel stations sorted by price - enabling them to save money on every fill-up.

**Core Value Proposition:** Find the cheapest fuel nearby in under 3 seconds, with zero friction.

**Technical Approach:** Next.js web app consuming the French government's open Fuel Prices API (prix-carburants.gouv.fr).

**Target Users:** Everyday drivers in France looking to save money on fuel.

## Success Criteria

### User Success

- User finds cheapest fuel near them in **under 3 seconds**
- Results are accurate and up-to-date (fresh from government API)
- Works smoothly on mobile browsers (primary use case - users on their phone)
- No signup/login friction - just open and use immediately

### Business Success

- **3 months:** App is live, works reliably, founder uses it personally
- **6 months:** A few hundred organic users, some word-of-mouth traction
- **If it buzzes:** Add tips jar or non-intrusive ads for monetization

### Technical Success

- Fast load times (< 2s initial load)
- Geolocation works reliably across browsers
- Handles API rate limits gracefully
- Graceful degradation (show last known prices if API is unavailable)

### Measurable Outcomes

| Metric | Target |
|--------|--------|
| Time to first useful result | < 3 seconds |
| Mobile usability score | 90+ (Lighthouse) |
| Authentication friction | Zero (no signup required) |
| API uptime handling | Graceful fallback when unavailable |

## Product Scope

### MVP - Minimum Viable Product

- Show fuel stations near current location sorted by price (cheapest first)
- Filter by fuel type (Gazole, SP95, SP98, E10, E85, GPLc)
- Display distance to each station
- Basic list view with essential info (brand, address, price, distance)
- Mobile-first responsive design
- Data freshness indicators
- Link to external maps for navigation

### Growth Features (Post-MVP)

- Favorite stations (save frequently visited)
- Price alerts ("notify me when Gazole drops below €1.70")
- Route planning ("cheapest station on my way to Lyon")
- Price history charts (see trends over time)
- Map view with station pins

### Vision (Future)

- Community features (user-reported prices, queue times, station conditions)
- Partnerships with fuel station brands
- EV charging station integration
- Multi-country expansion (Belgium, Spain, etc.)

## User Journeys

### Journey 1: "Je suis à sec" (Core Experience)

**Persona:** Marie, 34, commutes daily from suburbs to Paris

**Opening Scene:**
Marie notices her fuel light just turned on while stuck in traffic near Créteil. She's stressed - she doesn't know this area well and doesn't want to overpay at the first station she sees.

**Rising Action:**
She pulls over safely, opens lepleink on her phone. The app asks for location permission - she grants it. Within 2 seconds, she sees 8 stations within 5km, sorted by price.

**Climax:**
The cheapest Gazole is €1.72/L at an Intermarché 1.2km away - €0.08 cheaper than the Total right next to her. On a 50L fill, that's €4 saved.

**Resolution:**
Marie taps the address, her maps app opens with directions. She fills up, feels smart for not panic-buying at the expensive station. She bookmarks the app for next time.

### Journey 2: "Quel carburant pour ma caisse?" (New Driver Confusion)

**Persona:** Thomas, 22, just bought his first car (used Peugeot 208)

**Opening Scene:**
Thomas is at a fuel station staring at 6 different pump options. His car manual says "SP95 or SP98" but the pumps show E5, E10, E85... He's confused and afraid of damaging his engine.

**Rising Action:**
He remembers lepleink from a friend. Opens the app, sees fuel types listed with their standard names AND the pump label codes (E5 = SP95, E10 = SP95-E10).

**Climax:**
He understands E10 is compatible and cheaper. He also sees the station he's at is overpriced - there's one 800m away that's €0.05/L cheaper.

**Resolution:**
Thomas drives to the cheaper station, fills with E10 confidently. He now understands fuel types and has a go-to app.

### Journey 3: "Station fermée" (Edge Case - Stale Data)

**Persona:** Ahmed, 45, truck driver doing regional deliveries

**Opening Scene:**
Ahmed's GPS sent him to a station that's closed for renovation. It's 10pm, he's in a rural area, fuel is low.

**Rising Action:**
He opens lepleink. The app shows nearby stations with their last price update timestamp. He notices one station hasn't updated in 3 weeks (suspicious) but two others updated today.

**Climax:**
He picks the second-closest station that has fresh data. It's open 24/7 (visible in the listing).

**Resolution:**
Ahmed refuels successfully. He appreciates that the app showed data freshness so he could make an informed choice.

### Journey Requirements Summary

| Journey | Capabilities Revealed |
|---------|----------------------|
| Marie (core) | Geolocation, price sorting, distance display, maps integration |
| Thomas (confusion) | Fuel type education, picto codes (E5, E10), clear labeling |
| Ahmed (edge case) | Data freshness indicator, last update timestamp, 24/7 info |

## Technical Requirements

### Technology Stack

- **Framework:** Next.js 14+ with App Router
- **Styling:** Tailwind CSS (utility-first, mobile-optimized)
- **State:** React hooks (no Redux needed)
- **API calls:** Native fetch or SWR for caching
- **Geolocation:** Browser Geolocation API
- **Maps:** Link to external apps (Google Maps, Apple Maps, Waze)

### Browser Support

| Browser | Version | Priority |
|---------|---------|----------|
| Chrome (Desktop/Mobile) | Latest 2 | Primary |
| Safari (Desktop/iOS) | Latest 2 | Primary |
| Firefox | Latest 2 | Secondary |
| Edge | Latest 2 | Secondary |
| Samsung Internet | Latest | Secondary |

**Not supported:** IE11, legacy mobile browsers

### Responsive Design

- **Mobile-first approach** - Primary use case is phone in hand at fuel station
- **Breakpoints:** Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)
- **Touch-friendly:** Minimum tap targets 44x44px
- **No horizontal scroll** on any viewport

### Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| Mobile Performance Score | 90+ (Lighthouse) |

### Accessibility

- **Target:** WCAG 2.1 Level AA
- Color contrast ratio 4.5:1 minimum
- Keyboard navigation support
- Screen reader compatible (ARIA labels)
- Focus indicators visible

## Functional Requirements

### Location & Discovery

- **FR1:** User can grant location permission to enable nearby station discovery
- **FR2:** User can view fuel stations within a configurable radius of their current location
- **FR3:** User can see their approximate current location context (city/area name)
- **FR4:** User can manually search for stations by city or postcode if geolocation is unavailable

### Station Listing & Sorting

- **FR5:** User can view a list of nearby fuel stations with essential details (brand, address, distance)
- **FR6:** User can see the current price per liter for each fuel type at each station
- **FR7:** User can sort stations by price (lowest first - default)
- **FR8:** User can sort stations by distance (closest first)
- **FR9:** User can see how far each station is from their current location

### Fuel Type Filtering

- **FR10:** User can filter stations by fuel type (Gazole, SP95, SP98, E10, E85, GPLc)
- **FR11:** User can see both the common name and EU picto code for each fuel type (e.g., "SP95 (E5)")
- **FR12:** User can select a default fuel type that persists across sessions

### Data Quality & Transparency

- **FR13:** User can see when each station's price was last updated
- **FR14:** User can identify stations with stale data (visual indicator for old updates)
- **FR15:** User can see if a fuel type is marked as "rupture" (out of stock) at a station

### Navigation & Actions

- **FR16:** User can tap a station to open directions in their preferred maps app (Google Maps, Apple Maps, Waze)
- **FR17:** User can copy a station's address to clipboard
- **FR18:** User can share a station link with others

### System Behavior

- **FR19:** System retrieves station data from the French government Fuel Prices API
- **FR20:** System calculates distance between user location and each station
- **FR21:** System handles API unavailability gracefully with appropriate user messaging
- **FR22:** System caches recent results to enable faster subsequent loads

## Non-Functional Requirements

### Performance

- **NFR1:** Initial page load completes in < 2 seconds on 4G mobile connection
- **NFR2:** Station list renders within 3 seconds of location permission granted
- **NFR3:** Fuel type filter changes reflect instantly (< 100ms)
- **NFR4:** Sort order changes reflect instantly (< 100ms)
- **NFR5:** Lighthouse Mobile Performance score ≥ 90

### Accessibility

- **NFR6:** WCAG 2.1 Level AA compliance
- **NFR7:** All interactive elements keyboard-navigable
- **NFR8:** Color contrast ratio minimum 4.5:1 for text
- **NFR9:** Screen reader compatible with proper ARIA labels
- **NFR10:** Touch targets minimum 44x44px on mobile

### Integration & Reliability

- **NFR11:** Graceful degradation when Fuel Prices API is unavailable (show cached data or error message)
- **NFR12:** Handle API rate limiting without crashing (retry with backoff)
- **NFR13:** Geolocation fallback to manual city/postcode entry if browser permission denied
- **NFR14:** Works offline with last-cached results (if previously loaded)

### Browser Compatibility

- **NFR15:** Full functionality in Chrome, Safari, Firefox, Edge (latest 2 versions)
- **NFR16:** Mobile Safari (iOS 14+) and Chrome Mobile fully supported
- **NFR17:** No horizontal scrolling on any viewport width ≥ 320px

## External Dependencies

### Fuel Prices API

- **Source:** French Government Open Data (prix-carburants.gouv.fr)
- **Authentication:** API Key (header or query parameter)
- **Rate Limits:** Subject to API provider limits
- **Data Format:** JSON, XML, or YAML responses supported
- **Key Endpoints:**
  - `/stations/around/{lat},{lng}` - Stations near location
  - `/fuels/` - Fuel type reference data
  - `/brands/` - Station brand reference data

### Browser APIs

- **Geolocation API:** For user location detection
- **Clipboard API:** For address copy functionality
- **Share API:** For native sharing (where supported)

## Appendix: Data Source Reference

The application consumes data from the French government's Fuel Prices API, which provides:
- Station locations (address, coordinates)
- Brand information
- Available fuel types per station
- Current prices per fuel type
- Price update timestamps
- Stock status (rupture indicators)

API documentation: swagger.yaml (included in project root)

