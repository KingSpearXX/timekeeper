// Helper function to get authentication token from either storage location
const getAuthToken = () => {
  return localStorage.getItem('directus_token') || sessionStorage.getItem('directus_token')
}

export const schedulesService = {
  /**
   * Get all schedules for a specific user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Array of employee schedules
   */
  async getUserSchedules(userId) {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Try filtering by employee_schedule_id first, but this might need adjustment
      // depending on your actual Directus field configuration
      const url = `${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/items/employee_schedules?filter[employee_schedule_id][_eq]=${userId}&sort=day_of_week`
      
      console.log('Fetching user schedules...')
      console.log('URL:', url)
      console.log('User ID:', userId)
      console.log('Filter field: employee_schedule_id')

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Schedules response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log('Schedules error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Schedules response:', data)
      console.log('Number of schedules found:', data.data?.length || 0)
      
      // Log the structure of the first schedule for debugging
      if (data.data && data.data.length > 0) {
        console.log('First schedule structure:', data.data[0])
      }
      
      return data.data || []
    } catch (error) {
      console.error('Error fetching user schedules:', error)
      throw error
    }
  },

  /**
   * Format day of week number to day name
   * @param {number|string} dayNumber - Day number (0=Sunday, 1=Monday, etc.) or day name
   * @returns {string} Day name
   */
  formatDayName(dayNumber) {
    console.log('Formatting day:', dayNumber, 'Type:', typeof dayNumber)
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    // If it's already a string (day name), return it
    if (typeof dayNumber === 'string') {
      // Check if it's a valid day name
      const dayName = dayNumber.charAt(0).toUpperCase() + dayNumber.slice(1).toLowerCase()
      if (days.includes(dayName)) {
        return dayName
      }
      // If it's a string number, convert to integer
      const parsed = parseInt(dayNumber)
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 6) {
        return days[parsed]
      }
    }
    
    // If it's a number
    if (typeof dayNumber === 'number' && dayNumber >= 0 && dayNumber <= 6) {
      return days[dayNumber]
    }
    
    // If it's a string that can be parsed as a number
    const parsed = parseInt(dayNumber)
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 6) {
      return days[parsed]
    }
    
    console.warn('Invalid day value:', dayNumber)
    return `Unknown (${dayNumber})`
  },

  /**
   * Format time string to 12-hour format
   * @param {string} timeString - Time in 24-hour format (HH:MM or HH:MM:SS)
   * @returns {string} Time in 12-hour format
   */
  formatTime(timeString) {
    if (!timeString) return 'N/A'
    
    try {
      // Handle both HH:MM and HH:MM:SS formats
      const timeParts = timeString.split(':')
      const hours = parseInt(timeParts[0])
      const minutes = timeParts[1]
      
      const period = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
      
      return `${displayHours}:${minutes} ${period}`
    } catch (error) {
      console.error('Error formatting time:', error)
      return timeString
    }
  },

  /**
   * Calculate total scheduled hours for a day
   * @param {string} timeStart - Start time
   * @param {string} timeEnd - End time  
   * @returns {number} Hours duration
   */
  calculateDayHours(timeStart, timeEnd) {
    if (!timeStart || !timeEnd) return 0
    
    try {
      const startParts = timeStart.split(':')
      const endParts = timeEnd.split(':')
      
      const startMinutes = (parseInt(startParts[0]) * 60) + parseInt(startParts[1])
      const endMinutes = (parseInt(endParts[0]) * 60) + parseInt(endParts[1])
      
      const totalMinutes = endMinutes - startMinutes
      return totalMinutes / 60 // Convert to hours
    } catch (error) {
      console.error('Error calculating day hours:', error)
      return 0
    }
  },

  /**
   * Get total weekly scheduled hours
   * @param {Array} schedules - Array of schedule objects
   * @returns {number} Total weekly hours
   */
  calculateWeeklyHours(schedules) {
    return schedules.reduce((total, schedule) => {
      return total + this.calculateDayHours(schedule.time_start, schedule.time_end)
    }, 0)
  },

  /**
   * Sort schedules by day of week (Monday first)
   * @param {Array} schedules - Array of schedule objects
   * @returns {Array} Sorted schedules
   */
  sortSchedulesByDay(schedules) {
    return schedules.sort((a, b) => {
      // Convert day values to numbers if they're strings
      let dayA = parseInt(a.day_of_week)
      let dayB = parseInt(b.day_of_week)
      
      // Handle invalid values
      if (isNaN(dayA)) dayA = 0
      if (isNaN(dayB)) dayB = 0
      
      // Convert Sunday (0) to 7 to make Monday (1) first
      dayA = dayA === 0 ? 7 : dayA
      dayB = dayB === 0 ? 7 : dayB
      
      console.log('Sorting:', a.day_of_week, '→', dayA, 'vs', b.day_of_week, '→', dayB)
      
      return dayA - dayB
    })
  }
}
