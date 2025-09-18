/**
 * Authentication composable for accessing auth tokens and user data
 * Provides consistent token retrieval across all Vue components
 */

export const useAuth = () => {
  /**
   * Get authentication token from either localStorage or sessionStorage
   * @returns {string|null} The authentication token or null if not found
   */
  const getAuthToken = () => {
    return localStorage.getItem('directus_token') || sessionStorage.getItem('directus_token')
  }

  /**
   * Check if user has a valid authentication token
   * @returns {boolean} True if token exists, false otherwise
   */
  const hasAuthToken = () => {
    return !!getAuthToken()
  }

  /**
   * Clear all authentication data from both storage locations
   */
  const clearAuthData = () => {
    localStorage.removeItem('directus_token')
    localStorage.removeItem('remember_me')
    sessionStorage.removeItem('directus_token')
  }

  return {
    getAuthToken,
    hasAuthToken,
    clearAuthData
  }
}