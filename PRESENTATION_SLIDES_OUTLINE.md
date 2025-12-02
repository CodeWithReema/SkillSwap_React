# Presentation Slides Outline - Frontend & Geolocation

## Slide 1: Frontend Technologies Overview
- **React 18.3.1** - Modern component-based UI
- **Tailwind CSS 3.4.18** - Utility-first styling
- **Framer Motion 11.15.0** - Smooth animations
- **React Router 6.28.0** - Client-side routing
- **Axios 1.7.9** - HTTP client

## Slide 2: Architecture Pattern
- **Component-Based Architecture**
- **Context API for State Management**
  - AuthContext (user sessions)
  - NotificationContext (real-time updates)
- **Protected Routes** (authentication guards)
- **Service Layer** (centralized API calls)

## Slide 3: Design System
- **Glass Morphism Theme**
  - Backdrop blur effects
  - Purple/pink gradient accents
  - Custom Tailwind theme
- **Responsive Design**
  - Mobile-first approach
  - Breakpoint-based layouts

## Slide 4: Geolocation API - Overview
- **Two Approaches:**
  1. Browser/Device Geolocation API (GPS)
  2. Nominatim OpenStreetMap API (Geocoding)
- **Three Location Features:**
  1. Manual city input with autocomplete
  2. GPS-based precise location
  3. Distance-based filtering

## Slide 5: Browser Geolocation Implementation
- **Web:** `navigator.geolocation.getCurrentPosition()`
- **Mobile:** `expo-location` with native permissions
- **Features:**
  - High accuracy GPS coordinates
  - Automatic reverse geocoding
  - Privacy controls

## Slide 6: Backend Geolocation Service
- **GeolocationService.java**
  - `geocodeCity()` - City name → Coordinates
  - `getCitySuggestions()` - Autocomplete
  - `calculateDistance()` - Haversine formula
- **Smart Matching Algorithm**
  - Multiple query formats
  - Scoring system for best results
  - US location prioritization

## Slide 7: Location Features Demo
- **Profile Page:**
  - Location input with autocomplete
  - "Use My Location" button
  - Privacy toggle
- **Discover Page:**
  - Location filter
  - Distance display
  - Max distance slider (5-200 km)

## Slide 8: Data Flow Example
```
User clicks "Use My Location"
  → Browser requests GPS permission
  → Get coordinates (lat, lon)
  → Reverse geocode via Nominatim
  → Extract city and state
  → Save to backend
  → Update UI
```

## Slide 9: Key Metrics
- **Distance Calculation:** Haversine formula (accurate to ~0.5%)
- **Geocoding Accuracy:** Multiple query attempts for best match
- **Autocomplete:** 300ms debounce, 8 suggestions max
- **Privacy:** User-controlled location visibility

## Slide 10: Technology Stack Summary
| Frontend | Backend Integration | External APIs |
|----------|---------------------|---------------|
| React 18 | Spring Boot REST | Nominatim OSM |
| Tailwind CSS | PostgreSQL | Browser Geolocation |
| Framer Motion | JPA/Hibernate | |
| Axios | | |

---

## Quick Demo Script

1. **"Let me show you the modern glass morphism design..."**
   - Navigate to Profile page
   - Point out backdrop blur, gradients

2. **"Here's how geolocation works..."**
   - Click "Use My Location" button
   - Show permission prompt
   - Show coordinates being saved

3. **"The autocomplete feature..."**
   - Type in location field
   - Show suggestions dropdown
   - Select a city

4. **"Location-based matching..."**
   - Go to Discover page
   - Enable location filter
   - Show distance calculations
