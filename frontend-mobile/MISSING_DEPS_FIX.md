# Missing Dependencies Fix

## Issue
**Error:** `Unable to resolve "expo-linking" from "node_modules\expo-router\build\views\Unmatched.js"`

## Root Cause
`expo-router` v6 requires `expo-linking` as a peer dependency, but it wasn't explicitly listed in package.json. Expo Router uses it for deep linking and navigation.

## Solution Applied

**Added Missing Dependency:**
- Added `expo-linking: ~8.0.0` to dependencies (required by expo-router@6.0.15)
- This is required by `expo-router` for handling deep links and URL routing
- Version 8.0.0 matches the peer dependency requirement of expo-router

## Import Chain (Now Working)
```
expo-router/entry.js
  └─> expo-router/entry-classic.js
      └─> expo-router/build/qualified-entry.js
          └─> expo-router/build/ExpoRoot.js
              └─> expo-router/build/views/Unmatched.js
                  └─> expo-linking ✅ (now installed)
```

## Files Modified
- `frontend-mobile/package.json` - Added expo-linking dependency

## Status
✅ **Fixed** - expo-linking is now installed and should resolve correctly
✅ **0 vulnerabilities**

## Note
`expo-linking` is used by Expo Router for:
- Deep linking (opening app from URLs)
- Navigation between screens
- Handling URL schemes

This is a core dependency for Expo Router functionality.

