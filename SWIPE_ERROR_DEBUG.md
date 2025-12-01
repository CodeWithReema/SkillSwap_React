# Swipe Error Debugging Guide

## Error: 500 Internal Server Error on Swipe

### Problem
The backend is receiving a swipe request but throwing a 500 error, likely due to:
1. Null pointer exception when accessing `swipe.getSwiper().getUserId()`
2. User IDs not being properly deserialized
3. User objects not being found in the database

### Current Request Format
```javascript
{
  swiper: { userId: 1 },
  swipee: { userId: 2 },
  isLike: true
}
```

### Backend Expectation
The backend code expects:
- `swipe.getSwiper()` to return a User object (not null)
- `swipe.getSwiper().getUserId()` to return a Long userId
- Then it fetches the full User from the repository

### Possible Issues
1. **Null swiper/swipee**: If Spring doesn't deserialize the nested objects, they could be null
2. **Wrong data type**: userId might be sent as string instead of number
3. **User not found**: The user IDs might not exist in the database

### Debugging Steps
1. Check console logs for the exact swipe data being sent
2. Verify user IDs are valid numbers (not strings)
3. Check backend logs for the actual error message
4. Verify both users exist in the database

### Solution Applied
- Added validation to ensure user IDs are numbers
- Added detailed error logging
- Added user-friendly error messages
- Ensured proper data type conversion

### Next Steps if Still Failing
1. Check backend server logs for the exact exception
2. Verify the user IDs exist in the database
3. Test with the web frontend to see if it works there
4. Consider modifying backend to add null checks (if possible)

