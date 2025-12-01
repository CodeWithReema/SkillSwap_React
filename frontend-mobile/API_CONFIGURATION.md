# API Configuration Guide for Mobile App

## The Problem
When testing on a **physical device**, `localhost:8080` refers to the device itself, not your development machine where the backend is running. This causes network errors.

## Solutions by Platform

### 1. Android Emulator
The Android emulator has a special IP that maps to your host machine's localhost:
- **Use:** `http://10.0.2.2:8080`
- This is automatically configured in the code

### 2. iOS Simulator
The iOS simulator can access your Mac's localhost directly:
- **Use:** `http://localhost:8080`
- This is automatically configured in the code

### 3. Physical Device (Android or iOS)
You need to use your **computer's local IP address**:

#### Find Your IP Address:
- **Windows:** Open Command Prompt and run `ipconfig`
  - Look for "IPv4 Address" under your active network adapter
  - Example: `192.168.1.100`
- **Mac/Linux:** Open Terminal and run `ifconfig` or `ip addr`
  - Look for your active network interface (usually `en0` or `wlan0`)
  - Example: `192.168.1.100`

#### Update the API URL:
1. Open `frontend-mobile/src/services/api.js`
2. Find the `getApiBaseUrl()` function
3. For physical device testing, temporarily change:
   ```javascript
   return 'http://YOUR_IP_ADDRESS:8080';
   // Example: return 'http://192.168.1.100:8080';
   ```

#### Alternative: Use AsyncStorage (Runtime Configuration)
You can set a custom API URL at runtime:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set custom API URL
await AsyncStorage.setItem('API_BASE_URL', 'http://192.168.1.100:8080');
```

## Important Notes

1. **Backend Must Be Running:** Make sure your Spring Boot backend is running on port 8080
2. **Same Network:** Your phone and computer must be on the same Wi-Fi network
3. **Firewall:** Make sure your firewall allows connections on port 8080
4. **Backend CORS:** Ensure your backend allows requests from your mobile app

## Testing Steps

1. Start your backend server: `mvn spring-boot:run` (or your preferred method)
2. Find your computer's IP address (see above)
3. Update `src/services/api.js` with your IP
4. Restart the Expo app
5. Try registering again

## Current Configuration

The code automatically detects:
- **Android Emulator:** Uses `10.0.2.2:8080`
- **iOS Simulator:** Uses `localhost:8080`
- **Physical Device:** You need to manually set your IP (see above)

## Troubleshooting

### Error: "Network Error" or "ECONNREFUSED"
- ✅ Check backend is running: `http://localhost:8080/api/users` in browser
- ✅ Verify IP address is correct
- ✅ Ensure phone and computer are on same Wi-Fi
- ✅ Check firewall settings
- ✅ Try accessing `http://YOUR_IP:8080/api/users` from your phone's browser

### Error: "CORS" or "Cross-Origin"
- Check your Spring Boot backend CORS configuration
- Make sure it allows requests from your mobile app

