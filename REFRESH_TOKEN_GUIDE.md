# Directus Refresh Token Implementation Guide

## Overview

The TimeKeeper application now implements Directus refresh token functionality for enhanced security and seamless user experience. This prevents users from being logged out unexpectedly and provides automatic token renewal.

## Key Features

### 1. **Dual Token Storage**
- Access tokens and refresh tokens are stored in both `localStorage` (for "Remember Me") and `sessionStorage` (for session-only logins)
- Expiration timestamps are tracked to enable proactive token refresh

### 2. **Automatic Token Refresh**
- Tokens are automatically refreshed when they expire or are about to expire (within 5 minutes)
- Proactive refresh occurs 2 minutes before expiration for API calls
- Fallback refresh attempts if API calls fail due to expired tokens

### 3. **Enhanced Authentication Flow**
```javascript
// Login now stores additional token data
{
  access_token: "jwt-token-here",
  refresh_token: "refresh-token-here", 
  expires: 1703980800000  // Unix timestamp
}
```

## Implementation Details

### Auth Store Functions

#### `login(email, password, rememberMe)`
- Stores access token, refresh token, and expiration time
- Uses `localStorage` for persistent login, `sessionStorage` for session-only
- Automatically redirects to dashboard on success

#### `refreshToken()`
- Calls Directus `/auth/refresh` endpoint
- Updates stored tokens with new values
- Returns `true` on success, `false` on failure
- Automatically handles token storage based on original login preference

#### `checkAuth()`
- Validates current token with Directus API
- Automatically refreshes expired or expiring tokens
- Clears invalid tokens and redirects to login if refresh fails

#### `ensureValidToken()`
- Helper function for API services
- Checks token expiration (2-minute buffer)
- Proactively refreshes tokens before API calls
- Returns `true` if valid token available, `false` otherwise

### Service Integration Example

```javascript
// Updated service pattern
import { useAuth } from '../stores/auth.js'

const { ensureValidToken } = useAuth()

export const myService = {
  async apiCall() {
    // Ensure valid token before API call
    const hasValidToken = await ensureValidToken()
    
    if (!hasValidToken) {
      throw new Error('Unable to authenticate request')
    }
    
    // Get fresh token after validation
    const token = localStorage.getItem('directus_token') || sessionStorage.getItem('directus_token')
    
    // Make API call with fresh token
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }
}
```

## Security Benefits

1. **Short-lived Access Tokens**: Reduces risk if tokens are compromised
2. **Automatic Renewal**: Prevents forced re-authentication during active sessions
3. **Proper Token Cleanup**: All token types cleared on logout
4. **Expiration Tracking**: Prevents API calls with expired tokens

## User Experience Improvements

1. **Seamless Sessions**: Users stay logged in without interruption
2. **Background Refresh**: Token renewal happens transparently
3. **Persistent Login**: "Remember Me" functionality works correctly
4. **Graceful Fallbacks**: Automatic logout only if refresh completely fails

## Token Lifecycle

```
1. User Login
   ↓
2. Store access_token + refresh_token + expires
   ↓
3. API calls check token expiration
   ↓
4. Auto-refresh if expiring soon (< 2 minutes)
   ↓
5. Continue with fresh token
   ↓
6. Repeat until logout or refresh fails
```

## Configuration

Tokens are stored with these keys:
- `directus_token` - Access token for API calls
- `directus_refresh_token` - Refresh token for renewal  
- `directus_token_expires` - Unix timestamp of expiration
- `remember_me` - Flag indicating storage preference

## Testing

To test the refresh functionality:

1. Login with a short token expiration (if possible in Directus config)
2. Monitor browser DevTools → Application → Storage to see tokens
3. Wait for token to approach expiration
4. Make API calls and observe automatic refresh in Network tab
5. Verify seamless operation without user intervention

## Migration Notes

Existing services should be updated to use `ensureValidToken()` before API calls for optimal user experience. The implementation is backward compatible with existing authentication flows.