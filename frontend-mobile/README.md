# SkillSwap Mobile App

React Native mobile application built with Expo 54 for SkillSwap platform.

## Features

- Dark theme with light highlights
- Native mobile app experience
- Animated discover cards with swipe gestures
- Complete profile editing
- Mobile keyboard optimization
- Easy testing on physical devices

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npx expo start
```

3. Scan the QR code with:
   - **iOS**: Camera app or Expo Go app
   - **Android**: Expo Go app

## Testing on Your Phone

### Option 1: Expo Go (Easiest)
1. Install Expo Go from App Store (iOS) or Play Store (Android)
2. Run `npx expo start`
3. Scan the QR code with Expo Go

### Option 2: Development Build
1. Run `npx expo run:ios` or `npx expo run:android`
2. App will be installed on connected device/simulator

## Configuration

Update the API URL in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://YOUR_IP:8080'; // Use your computer's IP for physical device testing
```

For physical device testing, make sure:
- Your phone and computer are on the same WiFi network
- Your backend is accessible from your phone's network
- Firewall allows connections on port 8080

## Tech Stack

- Expo 54
- React Native 0.76.5
- React Navigation
- React Native Reanimated (for animations)
- React Native Gesture Handler (for swipe gestures)
- Expo Location (for location features)
- Expo Image Picker (for photo uploads)

## Mobile Optimizations

- Input fields use `fontSize: 16` to prevent iOS zoom
- KeyboardAvoidingView for proper keyboard handling
- Touch-optimized button sizes
- Native animations with Reanimated
- Gesture-based swipe interactions

