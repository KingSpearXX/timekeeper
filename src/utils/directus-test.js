// Simple test utility to check Directus connection
import directus from '@/services/directus'

export const testDirectusConnection = async () => {
  try {
    console.log('Testing Directus connection...')
    console.log('Directus URL:', import.meta.env.VITE_DIRECTUS_URL)
    
    // Try to fetch server info (this doesn't require authentication)
    const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/server/info`)
    const data = await response.json()
    
    console.log('Directus server info:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Directus connection test failed:', error)
    return { success: false, error: error.message }
  }
}

// Test on page load in development
if (import.meta.env.DEV) {
  testDirectusConnection()
}
