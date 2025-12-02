# SkillSwap Frontend Documentation

Complete documentation for both web and mobile frontend applications.

## 📱 Overview

SkillSwap has two frontend applications:
- **Web Frontend**: React-based web application (desktop-optimized)
- **Mobile Frontend**: React Native mobile app built with Expo 54

Both applications share:
- Dark theme with light highlights (purple/blue gradient accents)
- React Context API for state management
- Axios for HTTP requests
- Custom theme system

---

## 🌐 Web Frontend

### Features

- Dark theme with light highlights
- Responsive design (optimized for desktop)
- Animated discover cards with drag-to-swipe
- Complete profile editing with all features
- Mobile keyboard optimization
- Modern UI with smooth animations
- Real-time notifications (toast notifications)
- Badge notifications for matches and messages

### Tech Stack

- **React**: 18.3.1
- **React Router DOM**: 6.28.0
- **Framer Motion**: 11.15.0 (for animations)
- **Axios**: 1.7.9
- **CSS Variables**: For theming
- **Create React App**: 5.0.1 (build tool)

### Setup

1. **Install dependencies:**
   ```bash
   cd frontend-web
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Access the application:**
   - The app will run on http://localhost:3000
   - API requests are proxied to http://localhost:8080

### Environment Variables

Create a `.env` file in the `frontend-web` directory (optional):

```
REACT_APP_API_URL=http://localhost:8080
```

### Project Structure

```
frontend-web/
├── src/
│   ├── components/      # Reusable components (Navbar, DiscoverCard, etc.)
│   ├── contexts/        # React Context providers (Auth, Notifications)
│   ├── pages/          # Page components (Login, Discover, Profile, etc.)
│   ├── services/       # API service layer
│   ├── styles/         # Global styles and theme
│   ├── App.js         # Main app component with routing
│   └── index.js       # Entry point
├── public/            # Static assets
└── package.json       # Dependencies
```

### Mobile Optimization

- Input fields use `font-size: 16px` to prevent iOS zoom
- Touch-friendly button sizes
- Responsive layouts for mobile devices
- Keyboard-aware layouts

### Security Notes

**Current Status:** 9 vulnerabilities in development dependencies only (not in production builds).

These vulnerabilities are in:
- `nth-check` (high) - Inefficient Regular Expression Complexity
- `postcss` (moderate) - Line return parsing error
- `webpack-dev-server` (moderate) - Source code exposure

**Impact:**
- ✅ Production builds are completely safe
- ✅ All runtime dependencies are up to date
- ⚠️ Only affects development server (local development)

**Recommendations:**
- Accept the risk (recommended for now) - these only affect dev server
- Future consideration: Migrate to Vite for better security

See `frontend-web/SECURITY_NOTES.md` for detailed information.

---

## 📱 Mobile Frontend

### Features

- Dark theme with light highlights
- Native mobile app experience
- Animated discover cards with swipe gestures
- Complete profile editing (photos, skills, interests, organizations, languages)
- Mobile keyboard optimization
- Easy testing on physical devices
- Photo upload with device camera/gallery
- Precise location using device GPS
- Pull-to-refresh on matches and messages
- Badge notifications for matches and messages
- State persistence (remembers last viewed conversation)

### Tech Stack

- **Expo**: ~54.0.0
- **React**: 19.1.0
- **React Native**: 0.81.5
- **Expo Router**: ~6.0.15 (file-based routing)
- **React Navigation**: 7.x (Bottom Tabs, Stack Navigator)
- **React Native Reanimated**: ~4.1.1 (animations)
- **React Native Gesture Handler**: ~2.28.0 (swipe gestures)
- **Expo Location**: ~19.0.7 (GPS location)
- **Expo Image Picker**: ~17.0.8 (photo uploads)
- **AsyncStorage**: 2.2.0 (local storage)
- **Axios**: 1.13.2

### Setup

1. **Install dependencies:**
   ```bash
   cd frontend-mobile
   npm install
   ```

2. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

3. **Scan the QR code with:**
   - **iOS**: Camera app or Expo Go app
   - **Android**: Expo Go app

### Testing on Your Phone

#### Option 1: Expo Go (Easiest)
1. Install Expo Go from App Store (iOS) or Play Store (Android)
2. Run `npx expo start`
3. Scan the QR code with Expo Go

#### Option 2: Development Build
1. Run `npx expo run:ios` or `npx expo run:android`
2. App will be installed on connected device/simulator

### API Configuration

**Important:** When testing on a physical device, you need to configure the API URL.

#### The Problem
When testing on a **physical device**, `localhost:8080` refers to the device itself, not your development machine where the backend is running. This causes network errors.

#### Solutions by Platform

**1. Android Emulator**
- **Use:** `http://10.0.2.2:8080`
- This is automatically configured in the code

**2. iOS Simulator**
- **Use:** `http://localhost:8080`
- This is automatically configured in the code

**3. Physical Device (Android or iOS)**
You need to use your **computer's local IP address**:

**Find Your IP Address:**
- **Windows:** Open Command Prompt and run `ipconfig`
  - Look for "IPv4 Address" under your active network adapter
  - Example: `192.168.1.100`
- **Mac/Linux:** Open Terminal and run `ifconfig` or `ip addr`
  - Look for your active network interface (usually `en0` or `wlan0`)
  - Example: `192.168.1.100`

**Update the API URL:**
1. Open `frontend-mobile/src/services/api.js`
2. Find the `PHYSICAL_DEVICE_IP` constant (around line 10-11)
3. Update it with your computer's IP:
   ```javascript
   const PHYSICAL_DEVICE_IP = 'http://192.168.1.100:8080'; // Your IP
   const IS_PHYSICAL_DEVICE = true; // Set to true for physical device
   ```

**Important Notes:**
1. **Backend Must Be Running:** Make sure your Spring Boot backend is running on port 8080
2. **Same Network:** Your phone and computer must be on the same Wi-Fi network
3. **Firewall:** Make sure your firewall allows connections on port 8080
4. **Backend CORS:** Ensure your backend allows requests from your mobile app

**Testing Steps:**
1. Start your backend server: `mvn spring-boot:run`
2. Find your computer's IP address (see above)
3. Update `src/services/api.js` with your IP
4. Restart the Expo app
5. Test the connection

### Project Structure

```
frontend-mobile/
├── app/                # Expo Router pages (file-based routing)
│   ├── (tabs)/        # Tab navigation screens
│   ├── login.js       # Login screen
│   ├── register.js    # Registration screen
│   └── profile/       # Profile viewing screens
├── src/
│   ├── components/    # Reusable components (DiscoverCard)
│   ├── contexts/      # React Context providers (Auth, Notifications)
│   ├── services/      # API service layer
│   └── styles/        # Theme configuration
├── assets/            # Image assets (icon, splash, etc.)
├── app.json          # Expo configuration
└── package.json      # Dependencies
```

### Mobile Optimizations

- Input fields use `fontSize: 16` to prevent iOS zoom
- `KeyboardAvoidingView` for proper keyboard handling
- Touch-optimized button sizes
- Native animations with Reanimated
- Gesture-based swipe interactions
- Pull-to-refresh functionality
- State persistence with AsyncStorage

### Assets

The `assets/` folder should contain:
- `icon.png` - App icon (1024x1024px recommended)
- `splash.png` - Splash screen image
- `adaptive-icon.png` - Android adaptive icon (1024x1024px)
- `favicon.png` - Web favicon

**Note:** The app will work without these, but you'll see warnings. You can add actual images later using:
- Expo's asset generator: `npx expo-asset-generator`
- Or create simple colored squares as placeholders

---

## 🎨 Design System

### Color Scheme

**Background Colors:**
- Primary: `#0f0f1e` (dark navy)
- Secondary: `#1a1a2e` (darker navy)
- Tertiary: `#16213e` (blue-gray)
- Card: `#1e2746` (card background)

**Accent Colors:**
- Primary: `#667eea` (purple-blue)
- Secondary: `#764ba2` (purple)
- Success: `#48bb78` (green)
- Warning: `#ed8936` (orange)
- Danger: `#f56565` (red)

**Text Colors:**
- Primary: `#e2e8f0` (light gray)
- Secondary: `#a0aec0` (medium gray)
- Muted: `#718096` (dark gray)

### Spacing System

- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `xxl`: 48px

### Border Radius

- `sm`: 6px
- `md`: 8px
- `lg`: 12px
- `xl`: 16px

---

## 🔧 Common Configuration

### Clearing Storage for Testing

#### Mobile App (React Native/Expo)

**Method 1: Clear via Expo Dev Tools**
1. Open Expo Dev Tools (shake device or press `m` in terminal)
2. Go to "Debug" → "Clear AsyncStorage"
3. Reload the app

**Method 2: Uninstall and Reinstall**
- Uninstall the app from your device/emulator
- Reinstall it
- All storage will be cleared

**Method 3: Clear via React Native Debugger**
1. Open React Native Debugger
2. In console, type: `AsyncStorage.clear()`
3. Reload app

#### Web App (React)

**Method 1: Browser DevTools**
1. Open browser DevTools (F12)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Click "Local Storage" → your domain
4. Right-click → "Clear" or delete `currentUser` key
5. Refresh the page

**Method 2: Browser Console**
1. Open browser console (F12)
2. Type: `localStorage.removeItem('currentUser')`
3. Press Enter
4. Refresh the page

**Current Implementation:**
Both apps are configured to **NOT auto-login** on startup. They will:
- Clear any stored user data on app load
- Always start at the login screen
- Require users to manually log in

---

## 🐛 Troubleshooting

### Mobile App Network Issues

#### Error: "Network Error" or "ECONNREFUSED"

**Quick Fix Checklist:**
1. ✅ Verify backend is running: `http://YOUR_IP:8080/api/users` in browser
2. ✅ Check API URL in `frontend-mobile/src/services/api.js`
3. ✅ Ensure phone and computer are on same Wi-Fi network
4. ✅ Check firewall settings (allow port 8080)
5. ✅ Test URL in phone browser first

**Common Causes:**
- Wrong IP address in `api.js`
- Backend not running
- Firewall blocking port 8080
- Phone and computer on different networks
- Missing `http://` prefix in IP address

**Solutions:**
1. Double-check IP address format: `http://192.168.1.100:8080` (not `192.168.1.100:8080`)
2. Test URL in phone browser first
3. Check firewall settings
4. Verify backend is running: `mvn spring-boot:run`

#### Error: "CORS Error"
- Check your Spring Boot backend CORS configuration
- Make sure it allows requests from your mobile app

#### Error: "404 Not Found"
- Check backend controller routes match `/api/users`, `/api/profiles`, etc.

### Web App Issues

#### Proxy Error: "Could not proxy request /manifest.json"
- This is handled by `setupProxy.js` - the error is expected if the backend doesn't serve `/manifest.json`
- The app will continue to work normally

#### Port 3000 Already in Use
```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace <PID> with the number from above)
taskkill /PID <PID> /F
```

---

## 📚 Additional Resources

- **Main README**: See `README.md` for backend setup and full project documentation
- **Security Notes**: See `frontend-web/SECURITY_NOTES.md` for detailed security information
- **Troubleshooting**: See `TROUBLESHOOTING.md` for more detailed troubleshooting guides

---

## 🚀 Development Workflow

### Web Frontend

1. **Start development server:**
   ```bash
   cd frontend-web
   npm start
   ```

2. **Make changes** - Hot reload is enabled
3. **Test in browser** - App runs on http://localhost:3000

### Mobile Frontend

1. **Start Expo server:**
   ```bash
   cd frontend-mobile
   npx expo start
   ```

2. **Scan QR code** with Expo Go app
3. **Make changes** - Fast Refresh is enabled
4. **Test on device** - Changes appear automatically

---

**Last Updated:** Based on latest frontend implementations with Expo 54 and React 18.3.1

