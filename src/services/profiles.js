// Helper function to get authentication token from either storage location
const getAuthToken = () => {
  return localStorage.getItem('directus_token') || sessionStorage.getItem('directus_token')
}

export const profilesService = {
  /**
   * Get user profile information
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(userId) {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const url = `${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/users/${userId}?fields=*`
      
      console.log('Fetching user profile...')
      console.log('URL:', url)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  },

  /**
   * Get employee profile information
   * @param {string} userId - The user ID
   * @returns {Promise<Object|null>} Employee profile data or null if not found
   */
  async getEmployeeProfile(userId) {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      // First, get the user to find their employee_profile_id
      const userUrl = `${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/users/${userId}?fields=employee_profile_id`

      const userResponse = await fetch(userUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!userResponse.ok) {
        throw new Error(`HTTP error fetching user! status: ${userResponse.status}`)
      }

      const userData = await userResponse.json()
      const employeeProfileId = userData.data?.employee_profile_id

      if (!employeeProfileId) {
        return null
      }

      // Now fetch the employee profile
      const profileUrl = `${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/items/employee_profile/${employeeProfileId}`

      const response = await fetch(profileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // Handle collection not found or permission denied
      if (response.status === 403) {
        console.warn('Employee profile collection not accessible (403). Collection may not exist or user lacks permissions.')
        return null
      }

      if (response.status === 404) {
        console.warn('Employee profile not found (404). Profile may not exist.')
        return null
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Error fetching employee profile:', error)
      
      // Don't throw error for collection access issues - just return null
      if (error.message.includes('403') || error.message.includes('404')) {
        return null
      }
      
      throw error
    }
  },

  /**
   * Create a new employee profile
   * @param {string} userId - The user ID
   * @param {Object} profileData - Employee profile data
   * @returns {Promise<Object>} Created employee profile
   */
  async createEmployeeProfile(userId, profileData) {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Create employee profile without user_id field
      const payload = {
        mobile_number: profileData.mobile_number || '',
        ewallet_number: profileData.ewallet_number || '',
        ewallet_type: profileData.ewallet_type || 'gcash',
        hourly_rate: parseFloat(profileData.hourly_rate) || 0,
        overtime_multiplier: parseFloat(profileData.overtime_multiplier) || 1.5,
        wallet_balance: 0 // Initialize wallet balance to 0
      }

      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/items/employee_profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        
        // Handle collection not found or permission denied
        if (response.status === 403) {
          throw new Error('Permission denied. The employee_profile collection may not exist or you lack permissions to create records.')
        }
        
        if (response.status === 404) {
          throw new Error('Collection not found. The employee_profile collection may not exist in Directus.')
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      // Now link the employee profile to the user
      const profileId = data.data.id
      await this.linkEmployeeProfileToUser(userId, profileId)
      
      return data.data
    } catch (error) {
      console.error('Error creating employee profile:', error)
      throw error
    }
  },

  /**
   * Link employee profile to user
   * @param {string} userId - The user ID
   * @param {string} profileId - The employee profile ID
   * @returns {Promise<void>}
   */
  async linkEmployeeProfileToUser(userId, profileId) {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employee_profile_id: profileId
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error('Error linking employee profile to user:', error)
      throw error
    }
  },

  /**
   * Update employee profile
   * @param {string} profileId - The employee profile ID
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated employee profile
   */
  async updateEmployeeProfile(profileId, profileData) {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const payload = {
        mobile_number: profileData.mobile_number,
        ewallet_number: profileData.ewallet_number,
        ewallet_type: profileData.ewallet_type,
        hourly_rate: parseFloat(profileData.hourly_rate),
        overtime_multiplier: parseFloat(profileData.overtime_multiplier)
      }

      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/items/employee_profile/${profileId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Error updating employee profile:', error)
      throw error
    }
  },

  /**
   * Update user profile (basic info)
   * @param {string} userId - The user ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user profile
   */
  async updateUserProfile(userId, userData) {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const payload = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email
      }

      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  },

  /**
   * Upload avatar image
   * @param {File} file - The image file
   * @returns {Promise<Object>} Uploaded file data
   */
  async uploadAvatar(file) {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Error uploading avatar:', error)
      throw error
    }
  },

  /**
   * Update user avatar
   * @param {string} userId - The user ID
   * @param {string} fileId - The uploaded file ID
   * @returns {Promise<Object>} Updated user data
   */
  async updateUserAvatar(userId, fileId) {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const payload = { avatar: fileId }

      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Error updating user avatar:', error)
      throw error
    }
  },

  /**
   * Format currency value
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount || 0)
  },

  /**
   * Get avatar URL
   * @param {string} fileId - File ID from Directus
   * @returns {string} Full avatar URL
   */
  getAvatarUrl(fileId) {
    if (!fileId) return null
    return `${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/assets/${fileId}?width=200&height=200&fit=cover`
  }
}
