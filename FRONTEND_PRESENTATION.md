# Frontend Technologies & Geolocation API - Presentation Guide

## 📱 Frontend Architecture Overview

SkillSwap has **two frontend applications**:
1. **Web Application** (React SPA)
2. **Mobile Application** (React Native with Expo)

---

## 🌐 Web Frontend Technologies

### Core Framework
- **React 18.3.1** - Component-based UI library
- **React Router DOM 6.28.0** - Client-side routing
- **React Scripts 5.0.1** - Build tooling (Create React App)

### Styling & UI
- **Tailwind CSS 3.4.18** - Utility-first CSS framework
- **Framer Motion 11.15.0** - Animation library
- **Custom Glass Morphism Design** - Modern UI aesthetic

### HTTP Client
- **Axios 1.7.9** - Promise-based HTTP client
- **Request/Response Interceptors** - Automatic auth handling

### State Management
- **React Context API** - Global state management
  - `AuthContext` - User authentication state
  - `NotificationContext` - Real-time notifications

---

## 📱 Mobile Frontend Technologies

### Core Framework
- **React Native 0.81.5** - Cross-platform mobile framework
- **Expo ~54.0.0** - Development platform
- **Expo Router ~6.0.15** - File-based routing

### Native Features
- **Expo Location ~19.0.7** - Native geolocation API
- **Expo Image Picker ~17.0.8** - Photo upload functionality
- **AsyncStorage 2.2.0** - Local data persistence

### Styling
- **NativeWind 4.2.1** - Tailwind CSS for React Native
- **React Native Reanimated ~4.1.1** - Smooth animations

---

## 🎨 Design System Implementation

### Glass Morphism Theme
The app uses a custom **glass morphism** design system with:

**Color Palette:**
- Primary Background: `#0a0a15` (Dark blue-black)
- Glass Cards: `rgba(139, 92, 246, 0.08)` with backdrop blur
- Accent Colors:
  - Primary Purple: `#a855f7`
  - Secondary Pink: `#ec4899`
  - Tertiary Blue: `#3b82f6`

**Key Design Elements:**
- **Backdrop Blur**: `blur(20px)` for glass effect
- **Gradient Backgrounds**: Multi-color gradients for depth
- **Asymmetric Cards**: Custom clip-path for unique shapes
- **Glow Effects**: Box shadows with purple/pink glows

### Tailwind Configuration
Custom theme extends Tailwind with:
- Glass color system (bg, border, text, accent)
- Custom gradients (primary, secondary, glass)
- Custom animations (fade-in, slide-up, float, glow)
- Custom shadows (glass, glass-lg, glow effects)

---

## 🏗️ Architecture Patterns

### 1. Component-Based Architecture
```
App.js
├── AuthProvider (Context)
├── Router
│   └── NotificationProvider (Context)
│       ├── ProtectedRoute
│       ├── Pages (Discover, Profile, Matches, Messages)
│       └── Components (Navbar, DiscoverCard, NotificationToast)
```

### 2. Context API for State Management

**AuthContext:**
- Manages user authentication state
- Provides `login()`, `logout()`, `updateUser()` methods
- Stores user in `localStorage` (web) or `AsyncStorage` (mobile)
- Provides `getCurrentUserId()` helper

**NotificationContext:**
- Polls for new matches and messages
- Provides real-time notification updates
- Auto-refreshes every 30 seconds

### 3. API Service Layer

Centralized API client (`services/api.js`):
- Axios instance with base URL configuration
- Request interceptor for auth tokens
- Response interceptor for error handling
- Modular API exports (userAPI, profileAPI, etc.)

### 4. Protected Routes

`ProtectedRoute` component:
- Checks authentication status
- Redirects to `/login` if not authenticated
- Wraps protected pages (Discover, Profile, Matches, Messages)

---

## 📍 Geolocation API Implementation

### Overview
The app uses **two geolocation approaches**:
1. **Browser/Device Geolocation API** - For precise location
2. **Nominatim OpenStreetMap API** - For geocoding and reverse geocoding

---

### 1. Browser Geolocation API (Frontend)

**Web Implementation** (`Profile.js`):
```javascript
navigator.geolocation.getCurrentPosition(
  async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    // Reverse geocode using Nominatim
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
      { headers: { 'User-Agent': 'SkillSwap/1.0' } }
    );
    const data = await response.json();
    
    // Extract city and state
    const city = data.address.city || data.address.town || '';
    const state = data.address.state_code || data.address.state || '';
    const locationText = `${city}, ${state}`;
    
    // Save to backend
    await profileAPI.updateLocation(profileId, {
      latitude: lat,
      longitude: lon,
      location: locationText
    });
  }
);
```

**Mobile Implementation** (`profile.js`):
```javascript
// Request permission
const { status } = await Location.requestForegroundPermissionsAsync();

// Get current position
const location = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.Highest,
});

// Reverse geocode using Expo
const [address] = await Location.reverseGeocodeAsync({ 
  latitude, 
  longitude 
});
```

**Features:**
- ✅ High accuracy GPS coordinates
- ✅ Automatic reverse geocoding to city/state
- ✅ Saves coordinates to both User and Profile tables
- ✅ Privacy control with `showLocation` flag

---

### 2. Backend Geolocation Service

**Service:** `GeolocationService.java`

**Key Methods:**

#### A. Geocode City (`geocodeCity()`)
Converts city names to coordinates:
```java
public Map<String, Double> geocodeCity(String cityName) {
    // Tries multiple query formats for accuracy:
    // 1. "City, State, USA"
    // 2. "City, State"
    // 3. "City, State, United States"
    
    // Uses Nominatim API with:
    // - addressdetails=1 for better matching
    // - countrycodes=us to prioritize US locations
    // - Scoring algorithm to find best match
}
```

**Scoring Algorithm:**
- +10 points for US locations
- +20 points for city name match
- +15 points for state match
- +5 points for city/town type

#### B. City Suggestions (`getCitySuggestions()`)
Autocomplete for location input:
```java
public List<String> getCitySuggestions(String query) {
    // Returns up to 8 suggestions
    // Format: "City, State"
    // Prioritizes US cities and towns
    // Filters by featuretype=city,town
}
```

**Frontend Integration:**
- Debounced input (300ms delay)
- Shows dropdown with suggestions
- Updates as user types

#### C. Distance Calculation (`calculateDistance()`)
Haversine formula for distance between coordinates:
```java
public double calculateDistance(double lat1, double lon1, 
                                double lat2, double lon2) {
    // Returns distance in kilometers
    // Uses Earth radius: 6371 km
}
```

**Frontend Usage:**
- Calculates distance between users
- Filters by max distance (5-200 km)
- Shows distance in discover cards

---

### 3. Location Features in App

#### Profile Page
- **Manual Input**: Type city name with autocomplete
- **Precise Location**: Button to use GPS coordinates
- **Location Privacy**: Toggle to show/hide location

#### Discover Page
- **Location Filter**: Show only nearby users
- **Distance Display**: Shows distance in kilometers
- **Max Distance Slider**: 5-200 km range

#### Backend Storage
- **User Table**: Stores coordinates and privacy setting
- **Profile Table**: Stores coordinates and privacy setting
- **Indexed Queries**: Optimized location-based searches

---

## 🔄 Data Flow Examples

### Example 1: User Updates Location

```
1. User clicks "Use My Location" button
   ↓
2. Browser requests GPS permission
   ↓
3. navigator.geolocation.getCurrentPosition()
   ↓
4. Get coordinates (lat, lon)
   ↓
5. Reverse geocode via Nominatim API
   ↓
6. Extract city and state
   ↓
7. POST to /api/profiles/{id}/location
   ↓
8. Backend saves to database
   ↓
9. UI updates with success message
```

### Example 2: Location-Based Matching

```
1. User enables location filter on Discover page
   ↓
2. Frontend gets current user's coordinates
   ↓
3. Fetches all users from /api/users
   ↓
4. Calculates distance using Haversine formula
   ↓
5. Filters users within max distance
   ↓
6. Sorts by distance (closest first)
   ↓
7. Displays filtered results
```

### Example 3: City Autocomplete

```
1. User types "Atl" in location field
   ↓
2. Debounce timer (300ms) starts
   ↓
3. After 300ms, calls /api/profiles/cities/suggestions?q=Atl
   ↓
4. Backend queries Nominatim API
   ↓
5. Returns: ["Atlanta, GA", "Atlanta, TX", ...]
   ↓
6. Frontend displays dropdown
   ↓
7. User selects "Atlanta, GA"
   ↓
8. Field updates, geocoding happens automatically
```

---

## 🎯 Key Implementation Highlights

### 1. Responsive Design
- **Mobile-first approach** with Tailwind breakpoints
- **Flexible layouts** using CSS Grid and Flexbox
- **Touch-friendly** buttons and inputs

### 2. Performance Optimizations
- **Debounced API calls** for location suggestions
- **Lazy loading** of images
- **Memoized calculations** for distance
- **Efficient re-renders** with React hooks

### 3. User Experience
- **Smooth animations** with Framer Motion
- **Loading states** for async operations
- **Error handling** with user-friendly messages
- **Accessibility** with focus states and ARIA labels

### 4. Security & Privacy
- **Location privacy toggle** - Users control visibility
- **HTTPS required** for geolocation API
- **Permission handling** - Graceful degradation
- **Data validation** - Server-side checks

---

## 📊 Technology Stack Summary

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React | 18.3.1 | UI components |
| **Routing** | React Router | 6.28.0 | Navigation |
| **Styling** | Tailwind CSS | 3.4.18 | Utility-first CSS |
| **Animations** | Framer Motion | 11.15.0 | Smooth transitions |
| **HTTP Client** | Axios | 1.7.9 | API communication |
| **State** | Context API | Built-in | Global state |
| **Geolocation** | Browser API | Native | GPS coordinates |
| **Geocoding** | Nominatim OSM | External | Address ↔ Coordinates |
| **Mobile** | React Native | 0.81.5 | Cross-platform |
| **Mobile Framework** | Expo | ~54.0.0 | Development platform |

---

## 🎤 Presentation Talking Points

### Frontend Technologies
1. **"We built a modern, responsive web application using React 18..."**
   - Component-based architecture
   - Reusable UI components
   - Single Page Application (SPA)

2. **"For styling, we implemented a custom glass morphism design system..."**
   - Tailwind CSS for rapid development
   - Custom theme with purple/pink gradients
   - Backdrop blur effects for modern look

3. **"State management is handled through React Context API..."**
   - AuthContext for user sessions
   - NotificationContext for real-time updates
   - No external state library needed

4. **"Animations are powered by Framer Motion..."**
   - Smooth page transitions
   - Card hover effects
   - Loading animations

### Geolocation Implementation
1. **"We implemented a dual-approach geolocation system..."**
   - Browser API for precise GPS coordinates
   - Nominatim for geocoding and reverse geocoding

2. **"Users can set their location in three ways..."**
   - Manual city input with autocomplete
   - GPS-based precise location
   - Privacy control to show/hide

3. **"The backend uses a smart geocoding service..."**
   - Multiple query formats for accuracy
   - Scoring algorithm for best matches
   - US location prioritization

4. **"Location-based features include..."**
   - Distance calculation between users
   - Filter by proximity (5-200 km)
   - Location privacy controls

---

## 🔍 Code Examples for Demo

### Show This: Glass Morphism Card
```css
.glass-card {
  background: rgba(139, 92, 246, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 92, 246, 0.2);
}
```

### Show This: Geolocation Usage
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    // Reverse geocode and save
  }
);
```

### Show This: Distance Calculation
```javascript
const distance = calculateDistance(
  currentLat, currentLon,
  userLat, userLon
); // Returns kilometers
```

---

## 📝 Additional Notes

- **API Base URL**: Configurable via `REACT_APP_API_URL` environment variable
- **CORS**: Configured to allow all origins in development
- **Error Handling**: Comprehensive try-catch blocks with user feedback
- **Loading States**: Spinner animations during async operations
- **Form Validation**: Client-side validation before API calls

---

## 🎯 Demo Flow Suggestions

1. **Show the glass morphism design** - Navigate to Profile page
2. **Demonstrate location features** - Use "Use My Location" button
3. **Show autocomplete** - Type in location field
4. **Display distance filtering** - Enable location filter on Discover
5. **Highlight animations** - Navigate between pages

---

This document provides a comprehensive overview of the frontend technologies and geolocation implementation for your presentation!
