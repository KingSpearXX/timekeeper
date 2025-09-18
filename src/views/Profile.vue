<template>
  <div class="dashboard-layout">
    <!-- Mobile Header -->
    <header class="mobile-header">
      <button @click="toggleMobileMenu" class="menu-toggle" aria-label="Toggle menu">
        <svg class="menu-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </button>
      <h1 class="mobile-title">TimeKeeper</h1>
      <button @click="authStore.logout" class="mobile-logout">
        <svg class="logout-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
        </svg>
      </button>
    </header>

    <!-- Mobile Drawer Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="mobile-overlay"
      @click="toggleMobileMenu"
    ></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'mobile-open': isMobileMenuOpen }">
      <div class="sidebar-header">
        <h2 class="sidebar-title">TimeKeeper</h2>
        <p class="sidebar-subtitle">Welcome, {{ authStore.user.value?.first_name }}!</p>
      </div>
      
      <nav class="sidebar-nav">
        <a 
          v-for="item in menuItems" 
          :key="item.name"
          href="#"
          class="nav-item"
          :class="{ 'active': item.name === 'Profile' }"
          @click.prevent="setCurrentPage(item.name)"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path :d="item.icon"/>
          </svg>
          <span class="nav-text">{{ item.name }}</span>
        </a>
        
        <!-- Sign Out Menu Item -->
        <a 
          href="#"
          class="nav-item nav-item-signout"
          @click.prevent="authStore.logout"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          <span class="nav-text">Sign Out</span>
        </a>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-header">
        <h1 class="page-title">Profile Settings</h1>
        <p class="page-subtitle">Manage your account information and preferences</p>
      </div>
      
      <div class="content-body">
        <!-- Main Loading State -->
        <LoadingSpinner 
          v-if="isLoading" 
          text="Loading profile data..." 
          size="medium"
          :fullscreen="false"
        />
        
        <!-- Profile Content -->
        <div v-else>
          <!-- Message Display -->
          <div v-if="message" class="message" :class="messageType">
            {{ message }}
          </div>

          <!-- Profile Layout Grid -->
        <div class="profile-layout">
          <!-- Left Column - Main Profile Form -->
          <div class="profile-main">
            <div class="profile-card">
              <form @submit.prevent="saveProfile" class="profile-form">
                <!-- Avatar Section -->
                <div class="avatar-section">
                  <div class="avatar-container">
                    <img 
                      v-if="form.avatar && !avatarError" 
                      :src="getAvatarUrl(form.avatar)"
                      :alt="`${form.first_name} ${form.last_name}`"
                      class="avatar-image"
                      @error="handleAvatarError"
                      @load="handleAvatarLoad"
                    />
                    <div v-else class="avatar-placeholder">
                      <svg class="avatar-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                    <div class="avatar-overlay">
                      <label for="avatar-upload" class="avatar-upload-btn" :disabled="isUploadingAvatar">
                        <svg v-if="!isUploadingAvatar" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                        <div v-else class="upload-spinner"></div>
                      </label>
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        @change="handleAvatarUpload"
                        style="display: none;"
                      />
                    </div>
                  </div>
                  <p class="avatar-hint">
                    <span v-if="avatarError" class="avatar-error">
                      ⚠️ Avatar could not be loaded. Click to upload a new one.
                    </span>
                    <span v-else>
                      Click to upload new avatar (max 5MB)
                    </span>
                  </p>
                </div>

                <!-- Personal Information -->
                <div class="form-section">
                  <h3 class="section-title">Personal Information</h3>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label for="first_name">First Name</label>
                      <input 
                        id="first_name"
                        v-model="form.first_name" 
                        type="text" 
                        required
                        class="form-input"
                        :disabled="isLoading"
                      />
                    </div>
                    <div class="form-group">
                      <label for="last_name">Last Name</label>
                      <input 
                        id="last_name"
                        v-model="form.last_name" 
                        type="text" 
                        required
                        class="form-input"
                        :disabled="isLoading"
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="email">Email Address</label>
                    <input 
                      id="email"
                      v-model="form.email" 
                      type="email" 
                      required
                      class="form-input"
                      disabled
                      title="Email cannot be changed"
                    />
                  </div>
                </div>

                <!-- Password Section -->
                <div class="form-section">
                  <h3 class="section-title">Change Password</h3>
                  <p class="section-subtitle">Leave blank to keep current password</p>
                  
                  <div class="form-group">
                    <label for="current_password">Current Password</label>
                    <input 
                      id="current_password"
                      v-model="form.current_password" 
                      type="password" 
                      class="form-input"
                      :disabled="isLoading"
                      placeholder="Enter current password to change"
                    />
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="new_password">New Password</label>
                      <input 
                        id="new_password"
                        v-model="form.new_password" 
                        type="password" 
                        class="form-input"
                        :disabled="isLoading"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div class="form-group">
                      <label for="confirm_password">Confirm New Password</label>
                      <input 
                        id="confirm_password"
                        v-model="form.confirm_password" 
                        type="password" 
                        class="form-input"
                        :disabled="isLoading"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                <!-- Form Actions -->
                <div class="form-actions">
                  <button type="submit" :disabled="isLoading" class="btn primary">
                    <span v-if="isLoading">Saving...</span>
                    <span v-else>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Right Column - Employee Profile -->
          <div class="profile-sidebar">
            <div class="profile-card">
              <div class="form-section">
                <h3 class="section-title">Employee Profile</h3>
                <p class="section-subtitle">Employment and payment information</p>
                
                <div v-if="!employeeProfile && !isLoadingEmployeeProfile" class="placeholder-content">
                  <svg class="placeholder-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <h4>No Employee Profile Found</h4>
                  <p>Your employee profile has not been set up yet. Please contact your administrator.</p>
                </div>

                <LoadingSpinner 
                  v-else-if="isLoadingEmployeeProfile" 
                  text="Loading Employee Profile..." 
                  size="medium"
                  :fullscreen="false"
                />

                <div v-else-if="employeeProfile" class="employee-profile-form">
                  <div class="form-group">
                    <label for="mobile_number">Mobile Number</label>
                    <input 
                      id="mobile_number"
                      v-model="employeeProfile.mobile_number" 
                      type="tel" 
                      class="form-input"
                      :disabled="isLoadingEmployeeProfile"
                      placeholder="Enter your mobile number"
                    />
                  </div>
                  
                  <div class="form-group">
                    <label for="ewallet_type">E-Wallet Type</label>
                    <select 
                      id="ewallet_type"
                      v-model="employeeProfile.ewallet_type" 
                      class="form-input"
                      :disabled="isLoadingEmployeeProfile"
                    >
                      <option value="gcash">GCash</option>
                      <option value="maya">Maya</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="ewallet_number">E-Wallet Number</label>
                    <input 
                      id="ewallet_number"
                      v-model="employeeProfile.ewallet_number" 
                      type="text" 
                      class="form-input"
                      :disabled="isLoadingEmployeeProfile"
                      placeholder="Enter your e-wallet number"
                    />
                  </div>

                  <div class="form-group">
                    <label for="hourly_rate">Hourly Rate</label>
                    <div class="input-with-prefix">
                      <span class="input-prefix">₱</span>
                      <input 
                        id="hourly_rate"
                        v-model="employeeProfile.hourly_rate" 
                        type="number" 
                        step="0.01"
                        class="form-input with-prefix"
                        disabled
                        placeholder="0.00"
                        title="Only administrators can change hourly rate"
                      />
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="overtime_multiplier">Overtime Multiplier</label>
                    <div class="input-with-suffix">
                      <input 
                        id="overtime_multiplier"
                        v-model="employeeProfile.overtime_multiplier" 
                        type="number" 
                        step="0.1"
                        class="form-input with-suffix"
                        disabled
                        placeholder="1.5"
                        title="Only administrators can change overtime multiplier"
                      />
                      <span class="input-suffix">x</span>
                    </div>
                  </div>

                  <!-- Save Button for Employee Profile -->
                  <div class="form-actions" style="margin-top: 1.5rem;">
                    <button 
                      @click="saveEmployeeProfile" 
                      :disabled="isLoadingEmployeeProfile || !employeeProfile" 
                      class="btn primary"
                      style="min-width: 160px;"
                    >
                      <span v-if="isLoadingEmployeeProfile">Saving...</span>
                      <span v-else>Save Profile</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div> <!-- Close profile content div -->
      </div>
    </main>
</div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAuth } from '@/composables/useAuth'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()
const { getAuthToken } = useAuth()

// Mobile menu state
const isMobileMenuOpen = ref(false)

// Menu items with icons
const menuItems = reactive([
  {
    name: 'Dashboard',
    icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z'
  },
  {
    name: 'Schedule',
    icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z'
  },
  {
    name: 'Wallet',
    icon: 'M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z'
  },
  {
    name: 'Profile',
    icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
  }
])

// State
const isLoading = ref(true) // Changed from false to true
const isUploadingAvatar = ref(false)
const avatarError = ref(false)
const message = ref('')
const messageType = ref('') // 'success' or 'error'

// Form data
const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  avatar: null,
  current_password: '',
  new_password: '',
  confirm_password: ''
})

// Employee profile data
const employeeProfile = ref(null)
const isLoadingEmployeeProfile = ref(false)

// Test results
const testResults = ref([])
const isTestingCollections = ref(false)

// Watch for changes in employee profile e-wallet type
watch(() => employeeProfile.value?.ewallet_type, (newValue, oldValue) => {
  console.log('E-wallet type changed:', { oldValue, newValue })
}, { deep: true })

// Test function for collection access
const testCollectionAccess = async () => {
  const token = getAuthToken()
  const baseUrl = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'
  
  isTestingCollections.value = true
  testResults.value = []
  
  console.log('=== COLLECTION ACCESS TEST ===')
  console.log('Base URL:', baseUrl)
  console.log('Token exists:', !!token)
  console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'No token')
  
  if (!token) {
    console.error('No token available for testing')
    showMessage('No authentication token found', 'error')
    testResults.value.push({
      name: 'Authentication',
      status: 'error',
      message: 'No token found'
    })
    isTestingCollections.value = false
    return
  }

  const tests = [
    { name: 'Current User', endpoint: '/users/me' },
    { name: 'Server Info', endpoint: '/server/info' },
    { name: 'Collections Info', endpoint: '/collections' },
    { name: 'All Users', endpoint: '/users' },
    { name: 'Employee Profile Collection', endpoint: '/items/employee_profile' },
    { name: 'Employee Profile Schema', endpoint: '/collections/employee_profile' },
    { name: 'My Permissions', endpoint: '/permissions/me' }
  ]

  for (const test of tests) {
    try {
      console.log(`\n--- Testing: ${test.name} ---`)
      console.log(`URL: ${baseUrl}${test.endpoint}`)
      
      const response = await fetch(`${baseUrl}${test.endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log(`Status: ${response.status} ${response.statusText}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Success! Data preview:', data)
        testResults.value.push({
          name: test.name,
          status: 'success',
          message: `${response.status} ${response.statusText}`,
          data: data
        })
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Could not parse error' }))
        console.log('❌ Failed! Error:', errorData)
        testResults.value.push({
          name: test.name,
          status: 'error',
          message: `${response.status} ${response.statusText}`,
          error: errorData
        })
      }
    } catch (error) {
      console.error(`❌ Test failed for ${test.name}:`, error)
      testResults.value.push({
        name: test.name,
        status: 'error',
        message: 'Network/Parse Error',
        error: error.message
      })
    }
  }
  
  console.log('=== END TEST ===\n')
  isTestingCollections.value = false
}

// Methods
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const setCurrentPage = (page) => {
  if (page === 'Profile') {
    // Already on profile page, just close menu
    isMobileMenuOpen.value = false
    return
  }
  
  // Route to other pages
  if (page === 'Dashboard') {
    router.push('/')
  } else if (page === 'Schedule') {
    router.push('/?tab=schedule') // Navigate to dashboard with schedule tab
  } else if (page === 'Wallet') {
    router.push('/?tab=wallet') // Navigate to dashboard with wallet tab
  }
  
  isMobileMenuOpen.value = false
}

const loadUserProfile = async () => {
  try {
    console.log('Loading user profile...')
    isLoading.value = true
    
    // Test token validity first
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found')
    }
    
    // Test with a simple "me" endpoint first
    console.log('Testing token with /users/me endpoint...')
    const testResponse = await fetch(`${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Test response status:', testResponse.status)
    
    if (!testResponse.ok) {
      const errorData = await testResponse.json().catch(() => ({}))
      console.error('Token test failed:', errorData)
      
      if (testResponse.status === 401 || testResponse.status === 403) {
        // Token is invalid, redirect to login
        console.log('Invalid token, redirecting to login')
        localStorage.removeItem('directus_token')
        router.push('/login')
        return
      }
      throw new Error('Authentication failed')
    }
    
    const userData = await testResponse.json()
    console.log('User data from API:', userData)
    
    // Ensure we have fresh user data
    await authStore.checkAuth()
    
    // Get the user with proper unwrapping
    const userRef = authStore.user
    const user = userRef.value
    
    console.log('User reference:', userRef)
    console.log('User data:', user)

    if (!user) {
      throw new Error('No user data found')
    }

    // Use nextTick to ensure Vue reactivity
    await nextTick()

    // Populate form with current user data using direct assignment
    const firstName = user.first_name || ''
    const lastName = user.last_name || ''
    const email = user.email || ''
    const avatar = user.avatar || null
    
    console.log('Extracted user data:', { firstName, lastName, email, avatar })

    // Clear form first
    form.first_name = ''
    form.last_name = ''
    form.email = ''
    form.avatar = null
    form.current_password = ''
    form.new_password = ''
    form.confirm_password = ''

    // Wait a tick
    await nextTick()

    // Now assign the new values
    form.first_name = firstName
    form.last_name = lastName
    form.email = email
    form.avatar = avatar
    
    console.log('Form populated with:', form)
    
    avatarError.value = false // Reset avatar error state

    // Ensure the updates are processed
    await nextTick()

  } catch (error) {
    console.error('Error loading profile:', error)
    showMessage('Failed to load profile data', 'error')
  } finally {
    isLoading.value = false
  }
}

const loadEmployeeProfile = async () => {
  try {
    console.log('=== LOADING EMPLOYEE PROFILE ===')
    isLoadingEmployeeProfile.value = true
    employeeProfile.value = null // Reset first
    
    const userId = authStore.user.value?.id
    const token = getAuthToken()
    
    console.log('User ID:', userId)
    console.log('Token exists:', !!token)

    if (!userId) {
      console.error('No user ID found for employee profile')
      showMessage('No user ID found', 'error')
      return
    }

    if (!token) {
      console.error('No authentication token found for employee profile')
      showMessage('No authentication token found', 'error')
      return
    }

    // Fetch employee profile data
    const url = `${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/items/employee_profile?filter[employee_profile_id][_eq]=${userId}`
    console.log('Fetching from URL:', url)
    
    const response = await fetch(url, {
       method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Employee profile response status:', response.status)
    console.log('Employee profile response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Employee profile fetch failed:', response.status, response.statusText, errorText)
      
      if (response.status === 404) {
        // No employee profile found - this is okay
        console.log('No employee profile found (404)')
        employeeProfile.value = null
        showMessage('No employee profile found. Contact your administrator to set one up.', 'error')
        return
      }
      
      if (response.status === 403) {
        console.error('Access denied to employee profile collection')
        showMessage('Access denied to employee profile. Check permissions.', 'error')
        return
      }
      
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Employee profile response data (full):', JSON.stringify(data, null, 2))
    
    if (data.data && data.data.length > 0) {
      // Employee profile found
      const profileData = data.data[0]
      console.log('Found employee profile:', profileData)
      
      // Use nextTick to ensure proper Vue reactivity
      await nextTick()
      
      employeeProfile.value = {
        employee_profile_id: profileData.id,
        mobile_number: profileData.mobile_number || '',
        ewallet_number: profileData.ewallet_number || '',
        ewallet_type: profileData.ewallet_Type || '', // Note: API uses capital T
        hourly_rate: profileData.hourly_rate || 0,
        overtime_multiplier: profileData.overtime_multiplier || 1.5,
        wallet: profileData.wallet || 0
      }
      
      // Wait another tick for the DOM to update
      await nextTick()
      
      console.log('Employee profile set to:', employeeProfile.value)
      console.log('E-wallet type value:', employeeProfile.value.ewallet_type)
      console.log('E-wallet type typeof:', typeof employeeProfile.value.ewallet_type)
      
    } else {
      // No employee profile found
      console.log('No employee profile data in response - data array is empty')
      employeeProfile.value = null
      showMessage('No employee profile data found. Contact your administrator.', 'error')
    }

  } catch (error) {
    console.error('Error loading employee profile:', error)
    employeeProfile.value = null
    showMessage(`Failed to load employee profile: ${error.message}`, 'error')
  } finally {
    isLoadingEmployeeProfile.value = false
    console.log('=== END LOADING EMPLOYEE PROFILE ===')
  }
}

const saveEmployeeProfile = async () => {
  try {
    console.log('=== SAVING EMPLOYEE PROFILE ===')
    
    if (!employeeProfile.value) {
      showMessage('No employee profile to save', 'error')
      return
    }

    isLoadingEmployeeProfile.value = true
    const token = getAuthToken()
    
    if (!token) {
      throw new Error('No authentication token found')
    }

    const profileId = employeeProfile.value.employee_profile_id
    console.log('Saving profile ID:', profileId)
    console.log('Profile data to save:', employeeProfile.value)

    const updateData = {
      mobile_number: employeeProfile.value.mobile_number || null,
      ewallet_Type: employeeProfile.value.ewallet_type || null, // Note: API expects capital T
      ewallet_number: employeeProfile.value.ewallet_number || null
    }

    console.log('Update data:', updateData)

    const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/items/employee_profile/${profileId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })

    console.log('Save response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Employee profile save failed:', response.status, response.statusText, errorText)
      throw new Error(`Failed to save employee profile: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('Save result:', result)

    showMessage('Employee profile saved successfully!', 'success')

  } catch (error) {
    console.error('Error saving employee profile:', error)
    showMessage(`Failed to save employee profile: ${error.message}`, 'error')
  } finally {
    isLoadingEmployeeProfile.value = false
    console.log('=== END SAVING EMPLOYEE PROFILE ===')
  }
}

const saveProfile = async () => {
  try {
    // Validate password fields if changing password
    if (form.current_password || form.new_password || form.confirm_password) {
      if (!form.current_password) {
        showMessage('Current password is required to change password', 'error')
        return
      }
      if (!form.new_password) {
        showMessage('New password is required', 'error')
        return
      }
      if (form.new_password !== form.confirm_password) {
        showMessage('New passwords do not match', 'error')
        return
      }
      if (form.new_password.length < 6) {
        showMessage('New password must be at least 6 characters', 'error')
        return
      }
    }

    isLoading.value = true
    const userId = authStore.user.value?.id

    if (!userId) {
      throw new Error('No user ID found')
    }

    // Prepare update data
    const updateData = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email
    }

    // Add password fields if changing password
    if (form.current_password && form.new_password) {
      updateData.password = form.new_password
    }

    await updateUserProfile(userId, updateData)
    
    // Clear password fields after successful update
    form.current_password = ''
    form.new_password = ''
    form.confirm_password = ''

    showMessage('Profile updated successfully!', 'success')

    // Update the auth store with new user data
    await authStore.checkAuth()

  } catch (error) {
    console.error('Error saving profile:', error)
    showMessage(error.message || 'Failed to save profile', 'error')
  } finally {
    isLoading.value = false
  }
}

const updateUserProfile = async (userId, updateData) => {
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
    body: JSON.stringify(updateData)
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('Profile update error:', errorData)
    
    if (response.status === 400 && errorData.errors?.[0]?.message?.includes('password')) {
      throw new Error('Invalid current password')
    }
    
    throw new Error(errorData.errors?.[0]?.message || `HTTP error! status: ${response.status}`)
  }

  const result = await response.json()
  return result
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showMessage('Please select a valid image file', 'error')
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showMessage('Image file must be less than 5MB', 'error')
    return
  }

  try {
    isUploadingAvatar.value = true
    const userId = authStore.user.value?.id

    if (!userId) {
      throw new Error('No user ID found')
    }

    // Upload the file
    const uploadedFile = await uploadFile(file)
    
    // Update user profile with new avatar
    await updateUserProfile(userId, { avatar: uploadedFile.id })
    
    // Update form and local state
    form.avatar = uploadedFile.id
    avatarError.value = false // Reset error state
    
    showMessage('Avatar updated successfully!', 'success')
    
    // Update auth store
    await authStore.checkAuth()

  } catch (error) {
    console.error('Error uploading avatar:', error)
    showMessage(error.message || 'Failed to upload avatar', 'error')
  } finally {
    isUploadingAvatar.value = false
    // Clear the file input
    event.target.value = ''
  }
}

const uploadFile = async (file) => {
  const token = getAuthToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const formData = new FormData()
  formData.append('file', file)
  
  // Add metadata to make the file accessible
  formData.append('folder', '') // Optional: specify a folder
  formData.append('title', `Avatar for ${authStore.user.value?.first_name || 'User'}`)

  const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('Upload error response:', errorData)
    throw new Error(errorData.errors?.[0]?.message || `Upload failed! status: ${response.status}`)
  }

  const data = await response.json()
  
  // If the upload was successful but we need to update permissions, do it here
  const fileId = data.data.id
  await updateFilePermissions(fileId)
  
  return data.data
}

const updateFilePermissions = async (fileId) => {
  const token = getAuthToken()
  
  if (!token) {
    console.warn('No token available for updating file permissions')
    return
  }

  try {
    // Update the file to ensure it's accessible
    const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/files/${fileId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Ensure the file is accessible to authenticated users
        access: 'public'
      })
    })

    if (response.ok) {
      // File permissions updated successfully
    } else {
      console.warn('Could not update file permissions, but upload was successful')
    }
  } catch (error) {
    console.warn('Error updating file permissions:', error)
    // Don't throw here as the upload was successful
  }
}

const getAvatarUrl = (avatarId) => {
  if (!avatarId) {
    return null
  }
  
  const token = getAuthToken()
  const baseUrl = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'
  
  // Include the token as a query parameter for authenticated access
  const url = `${baseUrl}/assets/${avatarId}?width=200&height=200&fit=cover&quality=80&access_token=${token}`
  return url
}

const handleAvatarError = (event) => {
  console.error('Avatar failed to load:', event)
  avatarError.value = true
  
  // Try to reload with a different approach - using a direct fetch with auth headers
  tryAlternativeAvatarLoad()
}

const handleAvatarLoad = () => {
  avatarError.value = false
}

const tryAlternativeAvatarLoad = async () => {
  if (!form.avatar) return
  
  try {
    const token = getAuthToken()
    const baseUrl = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'
    
    // Try to fetch the avatar with proper authentication headers
    const response = await fetch(`${baseUrl}/assets/${form.avatar}?width=200&height=200&fit=cover&quality=80`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)
      
      // Update the image src to use the blob URL
      const imgElement = document.querySelector('.avatar-image')
      if (imgElement) {
        imgElement.src = imageUrl
        avatarError.value = false
      }
    } else {
      console.error('Alternative avatar load failed:', response.status)
    }
  } catch (error) {
    console.error('Error in alternative avatar load:', error)
  }
}

const showMessage = (text, type) => {
  message.value = text
  messageType.value = type
  
  // Clear message after 5 seconds
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, 5000)
}

// Lifecycle
onMounted(async () => {
  console.log('Profile component mounted')
  console.log('Auth store:', authStore)
  console.log('Auth store user:', authStore.user)
  console.log('Auth store user value:', authStore.user.value)
  
  // Check token first
  const token = getAuthToken()
  console.log('Token exists:', !!token)
  console.log('Token value:', token ? `${token.substring(0, 20)}...` : 'No token')
  
  // Run collection access test
  await testCollectionAccess()
  
  // Check if user is authenticated
  if (!authStore.user.value) {
    console.log('No user found, checking auth...')
    const isAuthenticated = await authStore.checkAuth()
    console.log('Auth check result:', isAuthenticated)
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login')
      router.push('/login')
      return
    }
  }
  
  console.log('User found, loading profile data...')
  await loadUserProfile()
  await loadEmployeeProfile()
})
</script>

<style scoped>
/* Layout */
.dashboard-layout {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  box-sizing: border-box;
}

/* Mobile Header */
.mobile-header {
  display: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.menu-toggle,
.mobile-logout {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.menu-toggle:hover,
.mobile-logout:hover {
  background: rgba(102, 126, 234, 0.1);
}

.menu-icon,
.logout-icon {
  width: 24px;
  height: 24px;
  color: #667eea;
}

.mobile-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #667eea;
  margin: 0;
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 1001;
}

/* Sidebar */
.sidebar {
  width: 280px;
  min-width: 280px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 1002;
}

.sidebar-header {
  padding: 2rem 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.sidebar-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  margin: 0 0 0.5rem 0;
}

.sidebar-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: #374151;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.nav-item.active {
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
  border-left-color: #667eea;
  font-weight: 500;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-text {
  font-size: 0.925rem;
}

.nav-item-signout {
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  color: #ef4444 !important;
}

.nav-item-signout:hover {
  background: rgba(239, 68, 68, 0.1) !important;
  color: #dc2626 !important;
}

.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  background: none;
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.logout-button:hover {
  background: #ef4444;
  color: white;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

.content-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 1rem;
}

.content-body {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  min-height: calc(100vh - 200px);
  width: 100%;
  box-sizing: border-box;
}

/* Message */
.message {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.message.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* Test Results */
.test-results {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.test-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.test-item {
  background: white;
  border-radius: 6px;
  padding: 1rem;
  border: 1px solid #e5e7eb;
}

.test-item.success {
  border-left: 4px solid #10b981;
}

.test-item.error {
  border-left: 4px solid #ef4444;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.test-name {
  font-weight: 500;
  color: #374151;
}

.test-status {
  font-size: 0.875rem;
  font-weight: 500;
}

.test-status.success {
  color: #059669;
}

.test-status.error {
  color: #dc2626;
}

.test-error {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #991b1b;
}

/* Profile Layout */
.profile-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  width: 100%;
}

.profile-main {
  min-width: 0;
}

.profile-sidebar {
  min-width: 0;
}

/* Profile Card */
.profile-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: fit-content;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Avatar Section */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 1rem;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.avatar-icon {
  width: 48px;
  height: 48px;
  color: #9ca3af;
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #667eea;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 3px solid white;
  cursor: pointer;
  transition: all 0.2s;
}

.avatar-overlay:hover {
  background: #5a67d8;
  transform: scale(1.05);
}

.avatar-upload-btn {
  background: none;
  border: none;
  cursor: pointer;
  width: 20px;
  height: 20px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-upload-btn:disabled {
  cursor: not-allowed;
}

.avatar-upload-btn svg {
  width: 16px;
  height: 16px;
}

.upload-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.avatar-hint {
  color: #6b7280;
  font-size: 0.8125rem;
  text-align: center;
  margin: 0;
}

.avatar-error {
  color: #dc2626;
  font-weight: 500;
}

/* Form Sections */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.section-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
  margin: -0.5rem 0 0 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.925rem;
  transition: all 0.2s;
  background: white;
  color: #1f2937;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

/* Input with prefix/suffix */
.input-with-prefix,
.input-with-suffix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix {
  position: absolute;
  left: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  z-index: 1;
  pointer-events: none;
}

.input-suffix {
  position: absolute;
  right: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  z-index: 1;
  pointer-events: none;
}

.form-input.with-prefix {
  padding-left: 2rem;
}

.form-input.with-suffix {
  padding-right: 2rem;
}

/* Employee Profile */
.employee-profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.placeholder-content {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
}

.placeholder-content .placeholder-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  color: #d1d5db;
}

.placeholder-content h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.placeholder-content p {
  margin: 0;
  font-size: 0.925rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-size: 0.925rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  min-width: 140px;
}

.btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn.secondary:hover:not(:disabled) {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 280px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
    padding: 1rem;
    padding-top: calc(70px + 1rem);
  }

  .page-title {
    font-size: 1.5rem;
  }

  .content-body {
    padding: 1.5rem;
    border-radius: 12px;
  }

  .profile-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .profile-card {
    padding: 1.5rem;
    border-radius: 12px;
  }

  .avatar-container {
    width: 100px;
    height: 100px;
  }

  .avatar-icon {
    width: 40px;
    height: 40px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
    padding-top: calc(70px + 0.75rem);
  }

  .content-body {
    padding: 1rem;
  }

  .sidebar {
    width: 100vw;
  }

  .profile-card {
    padding: 1rem;
  }

  .avatar-container {
    width: 80px;
    height: 80px;
  }

  .avatar-overlay {
    width: 28px;
    height: 28px;
  }

  .avatar-upload-btn svg {
    width: 14px;
    height: 14px;
  }
}
</style>
