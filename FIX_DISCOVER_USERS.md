# Fix: Users Not Showing in Discover Page

## Problem
Test users were not appearing in the discover cards even though they were populated in the database.

## Root Cause
The `ProfileController.getAllProfiles()` method was using `repo.findAll()`, which doesn't eagerly load the `user` relationship. The frontend code checks `p.user?.userId` to match profiles to users, but if the user object isn't loaded, it will be `null` and the matching fails.

## Solution
Updated the code to eagerly fetch the user relationship when loading profiles:

1. **ProfileRepository.java** - Added a new method with `JOIN FETCH`:
   ```java
   @Query("SELECT p FROM Profile p JOIN FETCH p.user")
   List<Profile> findAllWithUser();
   ```

2. **ProfileController.java** - Updated to use the new method:
   ```java
   @GetMapping
   public List<Profile> getAllProfiles() {
       return repo.findAllWithUser();
   }
   ```

## Next Steps

1. **Restart your Spring Boot application** for the changes to take effect
2. **Clear browser cache** or do a hard refresh (Ctrl+Shift+R)
3. **Check the browser console** for any API errors
4. **Verify the data** by running the diagnostic script:
   ```powershell
   .\check-discover-users.ps1
   ```

## Verification

After restarting, you should see:
- Test users appearing in discover cards
- Profiles properly linked to users
- Photos loading correctly (if you've added them)

## Additional Debugging

If users still don't appear:

1. **Check browser console** for errors when loading the discover page
2. **Check Network tab** to see what data is being returned from `/api/profiles`
3. **Verify profiles have user relationship** by checking the API response - each profile should have a `user` object with a `userId`
4. **Check if you're logged in** - the discover page filters out the current user

## Common Issues

- **No profiles returned**: Check if profiles were created correctly in the database
- **Profiles without user objects**: The JOIN FETCH should fix this, but verify the database relationships
- **All users filtered out**: Check if you've swiped on all test users already
- **Location filter enabled**: If location filter is on and users don't have coordinates, they won't show
