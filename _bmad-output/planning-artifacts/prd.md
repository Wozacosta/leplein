---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success']
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
---

# Product Requirements Document - lepleink

**Author:** Samy.rabah-montarou
**Date:** 2025-01-25

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

- Time to first useful result: < 3 seconds
- Mobile usability score: 90+ (Lighthouse)
- Zero authentication friction (no signup required)
- API uptime handling: graceful fallback when unavailable

## Product Scope

### MVP - Minimum Viable Product

- Show fuel stations near current location sorted by price (cheapest first)
- Filter by fuel type (Gazole, SP95, SP98, E10, E85, GPLc)
- Display distance to each station
- Basic list view with essential info (brand, address, price, distance)
- Mobile-first responsive design

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

