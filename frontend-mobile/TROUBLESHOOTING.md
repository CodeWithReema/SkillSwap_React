# Mobile App Network Troubleshooting Guide

## Quick Fix Checklist

### ✅ Step 1: Verify Backend is Running
1. Open your browser and go to: `http://YOUR_IP:8080/api/users`
   - Replace `YOUR_IP` with your computer's IP (e.g., `http://10.12.3.234:8080/api/users`)
2. You should see JSON data or an empty array `[]`
3. If this doesn't work, your backend isn't running or accessible

### ✅ Step 2: Configure API URL in Mobile App
1. Open `frontend-mobile/src/services/api.js`
2. Find line ~12: `const PHYSICAL_DEVICE_IP = 'http://10.12.3.234:8080';`
3. Replace `10.12.3.234` with YOUR computer's IP address
4. Make sure line ~15: `const IS_PHYSICAL_DEVICE = true;` is set to `true`
5. **IMPORTANT:** Include `http://` prefix and `:8080` port

### ✅ Step 3: Find Your Computer's IP Address

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

### ✅ Step 4: Test Connection from Phone Browser
1. On your phone, open a web browser
2. Navigate to: `http://YOUR_IP:8080/api/users`
3. If you see JSON data, the connection works!
4. If you get an error, the problem is network/firewall, not the app

### ✅ Step 5: Check Windows Firewall
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Check "Inbound Rules" for port 8080
4. If missing, create a new rule:
   - Allow TCP port 8080
   - Apply to all profiles

### ✅ Step 6: Verify Same Network
- Phone and computer must be on the **same Wi-Fi network**
- Not on different networks or VPNs

## Common Issues

### Issue: "Network Error" or "ECONNREFUSED"
**Causes:**
- ❌ Wrong IP address in `api.js`
- ❌ Backend not running
- ❌ Firewall blocking port 8080
- ❌ Phone and computer on different networks
- ❌ Missing `http://` prefix in IP address

**Solutions:**
1. Double-check IP address format: `http://10.12.3.234:8080` (not `10.12.3.234:8080`)
2. Test URL in phone browser first
3. Check firewall settings
4. Verify backend is running: `mvn spring-boot:run`

### Issue: "CORS Error"
**Solution:**
- Backend CORS config should allow all origins (already configured)
- If still seeing CORS errors, check backend logs

### Issue: "404 Not Found"
**Causes:**
- Wrong API endpoint
- Backend route doesn't exist

**Solution:**
- Check backend controller routes match `/api/users`, `/api/profiles`, etc.

## Debugging Tips

### Enable Console Logging
The app now logs:
- API URL being used
- Full request URLs
- Detailed error information

Check your Expo/Metro console for these logs.

### Test API Endpoints Manually
Try these URLs in your phone's browser:
- `http://YOUR_IP:8080/api/users` - Should return user list
- `http://YOUR_IP:8080/api/profiles` - Should return profile list

If these work in browser but not in app, it's an app configuration issue.

## Configuration File Location
`frontend-mobile/src/services/api.js`

Key variables to check:
- Line ~12: `PHYSICAL_DEVICE_IP` - Your computer's IP
- Line ~15: `IS_PHYSICAL_DEVICE` - Set to `true` for physical device

## Still Not Working?

1. **Check Expo Console:** Look for API request logs
2. **Check Backend Logs:** See if requests are reaching the server
3. **Try Emulator First:** Test with Android emulator using `10.0.2.2:8080`
4. **Network Test:** Use `ping YOUR_IP` from phone (if possible) or test in browser

## Example Working Configuration

```javascript
// In api.js
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

