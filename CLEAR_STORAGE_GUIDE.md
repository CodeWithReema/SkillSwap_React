# How to Clear Storage for Testing

## Mobile App (React Native/Expo)

### Method 1: Clear via Code (Already Implemented)
The app now automatically clears storage on startup. If you want to manually clear:

### Method 2: Clear via Expo Dev Tools
1. Open Expo Dev Tools (shake device or press `m` in terminal)
2. Go to "Debug" → "Clear AsyncStorage"
3. Reload the app

### Method 3: Clear via Code (Temporary)
Add this to your app startup:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.clear(); // Clears all storage
```

### Method 4: Uninstall and Reinstall
- Uninstall the app from your device/emulator
- Reinstall it
- All storage will be cleared

### Method 5: Clear via React Native Debugger
1. Open React Native Debugger
2. In console, type: `AsyncStorage.clear()`
3. Reload app

## Web App (React)

### Method 1: Browser DevTools
1. Open browser DevTools (F12)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Click "Local Storage" → your domain
4. Right-click → "Clear" or delete `currentUser` key
5. Refresh the page

### Method 2: Browser Console
1. Open browser console (F12)
2. Type: `localStorage.removeItem('currentUser')`
3. Press Enter
4. Refresh the page

### Method 3: Clear All Browser Data
1. Open browser settings
2. Clear browsing data
3. Select "Cookies and other site data"
4. Clear data
5. Refresh the page

## Current Implementation

Both apps are now configured to **NOT auto-login** on startup. They will:
- Clear any stored user data on app load
- Always start at the login screen
- Require users to manually log in

To re-enable auto-login, uncomment the code in:
- `frontend-mobile/src/contexts/AuthContext.js` (line ~22-40)
- `frontend-web/src/contexts/AuthContext.js` (line ~17-35)

## Testing Flow

1. **Start fresh**: App clears storage automatically
2. **Register/Login**: User must manually authenticate
3. **Test features**: Use the app normally
4. **Logout**: Use logout button to clear session
5. **Restart**: App will start at login screen again

