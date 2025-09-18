import { reactive, computed } from 'vue'
import { readMe } from '@directus/sdk'
import directus from '@/services/directus'

const state = reactive({
  user: null,
  loading: false,
  error: null
})

export const useAuthStore = () => {
  const isAuthenticated = computed(() => !!state.user)

  const login = async (email, password, rememberMe = false) => {
    state.loading = true
    state.error = null
    
    try {
      console.log('Attempting login to:', import.meta.env.VITE_DIRECTUS_URL)
      console.log('Email:', email, 'Remember me:', rememberMe)
      
      // Try manual login using fetch to avoid SDK issues
      const loginResponse = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })
      
      const loginData = await loginResponse.json()
      console.log('Login response:', loginData)
      
      if (!loginResponse.ok) {
        throw new Error(loginData.errors?.[0]?.message || 'Login failed')
      }
      
      // Store both access and refresh tokens
      if (loginData.data?.access_token) {
        await directus.setToken(loginData.data.access_token)
        
        console.log('=== Login Token Storage Debug ===')
        console.log('Remember me:', rememberMe)
        console.log('Access token expires:', loginData.data.expires)
        console.log('Refresh token available:', !!loginData.data.refresh_token)
        
        // Store tokens with remember me preference
        if (rememberMe) {
          // Store in localStorage for persistent login
          localStorage.setItem('directus_token', loginData.data.access_token)
          localStorage.setItem('remember_me', 'true')
          
          // Store refresh token for token renewal
          if (loginData.data.refresh_token) {
            localStorage.setItem('directus_refresh_token', loginData.data.refresh_token)
          }
          
          // Store expiration time for proactive refresh
          if (loginData.data.expires) {
            localStorage.setItem('directus_token_expires', loginData.data.expires.toString())
          }
          
          // Clear any session storage tokens
          sessionStorage.removeItem('directus_token')
          sessionStorage.removeItem('directus_refresh_token')
          sessionStorage.removeItem('directus_token_expires')
          console.log('Tokens stored in localStorage with remember me enabled')
        } else {
          // Store in sessionStorage for session-only login
          sessionStorage.setItem('directus_token', loginData.data.access_token)
          
          // Store refresh token for session
          if (loginData.data.refresh_token) {
            sessionStorage.setItem('directus_refresh_token', loginData.data.refresh_token)
          }
          
          // Store expiration time
          if (loginData.data.expires) {
            sessionStorage.setItem('directus_token_expires', loginData.data.expires.toString())
          }
          
          // Clear any localStorage tokens
          localStorage.removeItem('directus_token')
          localStorage.removeItem('directus_refresh_token')
          localStorage.removeItem('directus_token_expires')
          localStorage.removeItem('remember_me')
          console.log('Tokens stored in sessionStorage for session only')
        }
        
        // Verify storage immediately
        const verifyLocalToken = localStorage.getItem('directus_token')
        const verifySessionToken = sessionStorage.getItem('directus_token')
        console.log('Verification - Local token:', verifyLocalToken ? 'exists' : 'null')
        console.log('Verification - Session token:', verifySessionToken ? 'exists' : 'null')
        console.log('=== End Token Storage Debug ===')
      }
      
      // Get current user info
      const user = await directus.request(
        readMe({
          fields: ['id', 'first_name', 'last_name', 'email', 'role', 'avatar']
        })
      )
      
      console.log('User data:', user)
      state.user = user
      
      console.log('Login successful, redirecting to dashboard')
      
      // Redirect to dashboard using window.location to avoid circular dependency
      window.location.href = '/dashboard'
      
    } catch (error) {
      console.error('Login error details:', error)
      
      let errorMessage = 'Login failed'
      
      if (error.message) {
        errorMessage = error.message
      } else if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        errorMessage = error.errors[0].message || error.errors[0]
      }
      
      state.error = errorMessage
      throw error
    } finally {
      state.loading = false
    }
  }

  const refreshToken = async () => {
    try {
      console.log('=== Refreshing Token ===')
      
      // Get refresh token from either storage location
      const refreshTokenValue = localStorage.getItem('directus_refresh_token') || sessionStorage.getItem('directus_refresh_token')
      const isRemembered = localStorage.getItem('remember_me') === 'true'
      
      if (!refreshTokenValue) {
        console.log('No refresh token available')
        return false
      }
      
      console.log('Using refresh token to get new access token')
      
      const refreshResponse = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshTokenValue
        })
      })
      
      const refreshData = await refreshResponse.json()
      console.log('Refresh response:', refreshData)
      
      if (!refreshResponse.ok) {
        console.error('Token refresh failed:', refreshData)
        // Clear invalid tokens
        await logout()
        return false
      }
      
      // Update tokens with new values
      if (refreshData.data?.access_token) {
        await directus.setToken(refreshData.data.access_token)
        
        const storageType = isRemembered ? localStorage : sessionStorage
        
        // Store new access token
        storageType.setItem('directus_token', refreshData.data.access_token)
        
        // Update refresh token if provided
        if (refreshData.data.refresh_token) {
          storageType.setItem('directus_refresh_token', refreshData.data.refresh_token)
        }
        
        // Update expiration time
        if (refreshData.data.expires) {
          storageType.setItem('directus_token_expires', refreshData.data.expires.toString())
        }
        
        console.log('Tokens refreshed successfully')
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error refreshing token:', error)
      await logout()
      return false
    }
  }

  const logout = async () => {
    try {
      await directus.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local state
      state.user = null
      
      // Clear all tokens from both storage locations
      localStorage.removeItem('directus_token')
      localStorage.removeItem('directus_refresh_token')
      localStorage.removeItem('directus_token_expires')
      localStorage.removeItem('remember_me')
      sessionStorage.removeItem('directus_token')
      sessionStorage.removeItem('directus_refresh_token')
      sessionStorage.removeItem('directus_token_expires')
      await directus.setToken(null)
      
      // Redirect to login using window.location to avoid circular dependency
      window.location.href = '/login'
    }
  }

  // Helper function to ensure valid token before API calls
  const ensureValidToken = async () => {
    const token = localStorage.getItem('directus_token') || sessionStorage.getItem('directus_token')
    const expires = localStorage.getItem('directus_token_expires') || sessionStorage.getItem('directus_token_expires')
    
    if (!token) {
      return false
    }

    // Check if token will expire within 2 minutes
    if (expires) {
      const expirationTime = parseInt(expires)
      const currentTime = Date.now()
      const twoMinutesFromNow = currentTime + (2 * 60 * 1000)
      
      if (expirationTime < twoMinutesFromNow) {
        console.log('Token expiring soon, refreshing...')
        const refreshed = await refreshToken()
        
        if (!refreshed) {
          return false
        }
        
        // Update client with new token
        const newToken = localStorage.getItem('directus_token') || sessionStorage.getItem('directus_token')
        if (newToken) {
          await directus.setToken(newToken)
        }
      }
    }

    return true
  }

  const checkAuth = async () => {
    console.log('=== CheckAuth Debug ===')
    
    // Check for token in both storage locations with detailed logging
    const localToken = localStorage.getItem('directus_token')
    const sessionToken = sessionStorage.getItem('directus_token')
    const rememberMe = localStorage.getItem('remember_me')
    
    // Check expiration times
    const localExpires = localStorage.getItem('directus_token_expires')
    const sessionExpires = sessionStorage.getItem('directus_token_expires')
    
    console.log('Local storage token:', localToken ? localToken.substring(0, 20) + '...' : 'null')
    console.log('Session storage token:', sessionToken ? sessionToken.substring(0, 20) + '...' : 'null')
    console.log('Remember me flag:', rememberMe)
    
    const token = localToken || sessionToken
    const expires = localExpires || sessionExpires
    
    if (!token) {
      console.log('No authentication token found in either storage')
      return false
    }

    console.log('Using token from:', localToken ? 'localStorage' : 'sessionStorage')
    
    // Check if token is expired or will expire soon (within 5 minutes)
    if (expires) {
      const expirationTime = parseInt(expires)
      const currentTime = Date.now()
      const fiveMinutesFromNow = currentTime + (5 * 60 * 1000)
      
      console.log('Token expires at:', new Date(expirationTime).toISOString())
      console.log('Current time:', new Date(currentTime).toISOString())
      console.log('Will expire soon:', expirationTime < fiveMinutesFromNow)
      
      if (expirationTime < fiveMinutesFromNow) {
        console.log('Token expired or expiring soon, attempting refresh...')
        const refreshed = await refreshToken()
        
        if (!refreshed) {
          console.log('Token refresh failed, redirecting to login')
          return false
        }
        
        // Get the new token after refresh
        const newToken = localStorage.getItem('directus_token') || sessionStorage.getItem('directus_token')
        if (newToken) {
          await directus.setToken(newToken)
        }
      }
    }

    try {
      // Set the token in the client
      await directus.setToken(token)
      
      // Try to get user info to validate token
      const user = await directus.request(
        readMe({
          fields: ['id', 'first_name', 'last_name', 'email', 'role', 'avatar']
        })
      )
      
      state.user = user
      console.log('Authentication validated for user:', user.email)
      console.log('=== CheckAuth Success ===')
      return true
    } catch (error) {
      console.error('Token validation failed:', error)
      console.log('=== CheckAuth Failed ===')
      
      // Try to refresh token if validation failed
      console.log('Attempting token refresh after validation failure...')
      const refreshed = await refreshToken()
      
      if (refreshed) {
        // Try validation again with new token
        try {
          const user = await directus.request(
            readMe({
              fields: ['id', 'first_name', 'last_name', 'email', 'role', 'avatar']
            })
          )
          
          state.user = user
          console.log('Authentication validated after refresh for user:', user.email)
          return true
        } catch (refreshError) {
          console.error('Validation failed even after refresh:', refreshError)
        }
      }
      
      // Clear invalid tokens from both storage locations
      localStorage.removeItem('directus_token')
      localStorage.removeItem('directus_refresh_token')
      localStorage.removeItem('directus_token_expires')
      localStorage.removeItem('remember_me')
      sessionStorage.removeItem('directus_token')
      sessionStorage.removeItem('directus_refresh_token')
      sessionStorage.removeItem('directus_token_expires')
      state.user = null
      await directus.setToken(null)
      return false
    }
  }

  return {
    // State
    user: computed(() => state.user),
    loading: computed(() => state.loading),
    error: computed(() => state.error),
    isAuthenticated,
    
    // Actions
    login,
    logout,
    checkAuth,
    refreshToken,
    ensureValidToken
  }
}
