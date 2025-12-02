# SkillSwap Troubleshooting Guide

Comprehensive troubleshooting guide for all SkillSwap components.

---

## 📱 Mobile App Issues

### Network Connection Errors

#### Error: "Network Error" or "ECONNREFUSED"

**Quick Fix Checklist:**
1. ✅ Verify backend is running: `http://YOUR_IP:8080/api/users` in browser
2. ✅ Check API URL in `frontend-mobile/src/services/api.js`
3. ✅ Ensure phone and computer are on same Wi-Fi network
4. ✅ Check firewall settings (allow port 8080)
5. ✅ Test URL in phone browser first

**Step-by-Step Solution:**

**Step 1: Verify Backend is Running**
1. Open your browser and go to: `http://YOUR_IP:8080/api/users`
   - Replace `YOUR_IP` with your computer's IP (e.g., `http://192.168.1.100:8080/api/users`)
2. You should see JSON data or an empty array `[]`
3. If this doesn't work, your backend isn't running or accessible

**Step 2: Configure API URL in Mobile App**
1. Open `frontend-mobile/src/services/api.js`
2. Find line ~10-11: `const PHYSICAL_DEVICE_IP = 'http://YOUR_IP:8080';`
3. Replace `YOUR_IP` with YOUR computer's IP address
4. Make sure line ~15: `const IS_PHYSICAL_DEVICE = true;` is set to `true`
5. **IMPORTANT:** Include `http://` prefix and `:8080` port

**Step 3: Find Your Computer's IP Address**

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually Wi-Fi or Ethernet)

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```
Look for your active network interface (usually `en0` or `wlan0`)

**Step 4: Test Connection from Phone Browser**
1. On your phone, open a web browser
2. Navigate to: `http://YOUR_IP:8080/api/users`
3. If you see JSON data, the connection works!
4. If you get an error, the problem is network/firewall, not the app

**Step 5: Check Windows Firewall**
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Check "Inbound Rules" for port 8080
4. If missing, create a new rule:
   - Allow TCP port 8080
   - Apply to all profiles

**Step 6: Verify Same Network**
- Phone and computer must be on the **same Wi-Fi network**
- Not on different networks or VPNs

**Common Causes:**
- ❌ Wrong IP address in `api.js`
- ❌ Backend not running
- ❌ Firewall blocking port 8080
- ❌ Phone and computer on different networks
- ❌ Missing `http://` prefix in IP address

**Solutions:**
1. Double-check IP address format: `http://192.168.1.100:8080` (not `192.168.1.100:8080`)
2. Test URL in phone browser first
3. Check firewall settings
4. Verify backend is running: `mvn spring-boot:run`

#### Error: "CORS Error"
- Check your Spring Boot backend CORS configuration
- Make sure it allows requests from your mobile app
- Backend CORS config should allow all origins (already configured)

#### Error: "404 Not Found"
**Causes:**
- Wrong API endpoint
- Backend route doesn't exist

**Solution:**
- Check backend controller routes match `/api/users`, `/api/profiles`, etc.

### API Configuration by Platform

**Android Emulator:**
- **Use:** `http://10.0.2.2:8080`
- This is automatically configured in the code

**iOS Simulator:**
- **Use:** `http://localhost:8080`
- This is automatically configured in the code

**Physical Device (Android or iOS):**
- You need to use your **computer's local IP address**
- See Step 3 above for finding your IP
- Update `PHYSICAL_DEVICE_IP` in `frontend-mobile/src/services/api.js`

### Swipe Function Errors

#### Error: 500 Internal Server Error on Swipe

**Problem:**
The backend is receiving a swipe request but throwing a 500 error, likely due to:
1. Null pointer exception when accessing `swipe.getSwiper().getUserId()`
2. User IDs not being properly deserialized
3. User objects not being found in the database

**Current Request Format:**
```javascript
{
  swiper: { userId: 1 },
  swipee: { userId: 2 },
  isLike: true
}
```

**Backend Expectation:**
The backend code expects:
- `swipe.getSwiper()` to return a User object (not null)
- `swipe.getSwiper().getUserId()` to return a Long userId
- Then it fetches the full User from the repository

**Possible Issues:**
1. **Null swiper/swipee**: If Spring doesn't deserialize the nested objects, they could be null
2. **Wrong data type**: userId might be sent as string instead of number
3. **User not found**: The user IDs might not exist in the database

**Debugging Steps:**
1. Check console logs for the exact swipe data being sent
2. Verify user IDs are valid numbers (not strings)
3. Check backend logs for the actual error message
4. Verify both users exist in the database

**Solution Applied:**
- Added validation to ensure user IDs are numbers
- Added detailed error logging
- Added user-friendly error messages
- Ensured proper data type conversion

**Next Steps if Still Failing:**
1. Check backend server logs for the exact exception
2. Verify the user IDs exist in the database
3. Test with the web frontend to see if it works there
4. Consider modifying backend to add null checks (if possible)

### Mobile App Debugging Tips

**Enable Console Logging:**
The app logs:
- API URL being used
- Full request URLs
- Detailed error information

Check your Expo/Metro console for these logs.

**Test API Endpoints Manually:**
Try these URLs in your phone's browser:
- `http://YOUR_IP:8080/api/users` - Should return user list
- `http://YOUR_IP:8080/api/profiles` - Should return profile list

If these work in browser but not in app, it's an app configuration issue.

**Example Working Configuration:**
```javascript
// In frontend-mobile/src/services/api.js
const PHYSICAL_DEVICE_IP = 'http://192.168.1.100:8080'; // Your IP
const IS_PHYSICAL_DEVICE = true; // true for physical device
```

Make sure:
- ✅ IP address is correct
- ✅ Includes `http://` prefix
- ✅ Includes `:8080` port
- ✅ Backend is running
- ✅ Same Wi-Fi network
- ✅ Firewall allows port 8080

---

## 🌐 Web App Issues

### Proxy Error: "Could not proxy request /manifest.json"
- This is handled by `setupProxy.js` - the error is expected if the backend doesn't serve `/manifest.json`
- The app will continue to work normally
- No action needed

### Port 3000 Already in Use

**Solution:**
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace <PID> with the number from above)
taskkill /PID <PID> /F
```

### Port 8080 Already in Use

**Solution:**
```powershell
# Find what's using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with the actual process ID)
taskkill /PID <PID> /F
```

### ESLint Warnings

**Common warnings:**
- `useEffect` missing dependencies
- Unused variables

**Solution:**
- These are typically intentional (e.g., `eslint-disable-next-line` comments)
- Can be safely ignored for now
- Or fix by adding proper dependencies or removing unused code

---

## 🗄️ Database Issues

### Database Connection Errors

**Error:** `Connection refused` or `Connection timed out`

**Solutions:**
1. Make sure the database container is running:
   ```powershell
   docker ps
   # Should show skillswap-db
   ```

2. If not running, start it:
   ```powershell
   docker-compose up -d db
   ```

3. Check if PostgreSQL is accessible:
   ```powershell
   docker exec -it skillswap-db psql -U postgres -d skillswap
   ```

### Schema Errors on Startup

If you see errors about tables already existing:

1. The schema uses `CREATE TABLE IF NOT EXISTS` for most tables
2. If you still get errors, you can reset the database:
   ```powershell
   # Stop and remove the database container and volume
   docker-compose down -v
   
   # Start fresh
   docker-compose up -d db
   ```

**⚠️ Warning:** This will delete all database data!

---

## 🔐 Authentication Issues

### "User not found" Error on Profile Save

**Solution:** Make sure you're logged in. Go to http://localhost:8080/login.html (web) or use the login screen (mobile) and log in first.

### Auto-Login Issues

**Current Implementation:**
Both apps are configured to **NOT auto-login** on startup. They will:
- Clear any stored user data on app load
- Always start at the login screen
- Require users to manually log in

**To re-enable auto-login:**
Uncomment the code in:
- `frontend-mobile/src/contexts/AuthContext.js` (line ~22-40)
- `frontend-web/src/contexts/AuthContext.js` (line ~17-35)

### Clearing Storage for Testing

See the "Clearing Storage" section in [`FRONTEND.md`](FRONTEND.md) for detailed instructions on clearing storage for both mobile and web apps.

---

## 🚀 Application Startup Issues

### Application Won't Start

1. **Check Java version:**
   ```powershell
   java -version
   # Should be Java 21
   ```

2. **Clean and rebuild:**
   ```powershell
   .\mvnw.cmd clean compile
   ```

3. **Check for compilation errors** in the console output

4. **Verify database is running** (see Database Issues above)

### Spring Boot Won't Start

**Common causes:**
- Port 8080 already in use (see above)
- Database not running
- Java version mismatch
- Maven dependencies not installed

**Solution:**
```powershell
# Clean and rebuild
.\mvnw.cmd clean compile

# Then run
.\mvnw.cmd spring-boot:run
```

---

## 📦 Dependency Issues

### npm Install Errors

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Mobile App: Missing Dependencies

If you see errors about missing modules:
1. Make sure you're in the `frontend-mobile` directory
2. Run `npm install`
3. Check `package.json` for the required dependency
4. If missing, add it and run `npm install` again

### Mobile App: Babel/Worklets Errors

**Common errors:**
- `Cannot find module 'babel-preset-expo'`
- `Cannot find module 'react-native-worklets/plugin'`

**Solution:**
1. Make sure `babel-preset-expo` is in `devDependencies`
2. Make sure `react-native-worklets` and `react-native-worklets-core` are in `dependencies`
3. Run `npm install`
4. Clear Metro cache: `npx expo start --clear`

---

## 🐛 Still Not Working?

### General Debugging Steps

1. **Check console/terminal** for error messages
2. **Check backend logs** to see if requests are reaching the server
3. **Verify prerequisites** are installed correctly
4. **Try cleaning and rebuilding:**
   ```powershell
   # Web
   cd frontend-web
   npm install
   
   # Mobile
   cd frontend-mobile
   npm install
   
   # Backend
   .\mvnw.cmd clean compile
   ```

5. **Check network connectivity:**
   - Test API endpoints in browser
   - Verify backend is accessible
   - Check firewall settings

### Getting Help

1. **Check the main README**: See `README.md` for setup instructions
2. **Check frontend docs**: See `FRONTEND.md` for frontend-specific information
3. **Check console logs**: Look for detailed error messages
4. **Check backend logs**: See if requests are reaching the server
5. **Test in browser first**: Verify API endpoints work before testing in app

---

## 📚 Related Documentation

- **Main README**: [`README.md`](README.md) - Full project documentation
- **Frontend Docs**: [`FRONTEND.md`](FRONTEND.md) - Frontend setup and configuration
- **Setup Guide**: [`SETUP_GUIDE.md`](SETUP_GUIDE.md) - Quick setup instructions

---

**Last Updated:** Based on latest troubleshooting experiences

