import directus from './directus.js'
import { useAuthStore } from '../stores/auth.js'

// Get auth store instance
const { ensureValidToken } = useAuthStore()

export const timeLogsService = {
  /**
   * Get all time logs for a specific user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Array of time logs
   */
  async getUserTimeLogs(userId) {
    try {
      // Ensure we have a valid token before making the API call
      const hasValidToken = await ensureValidToken()
      
      if (!hasValidToken) {
        throw new Error('Unable to authenticate request')
      }

      // Get current token after ensuring it's valid
      const token = localStorage.getItem('directus_token') || sessionStorage.getItem('directus_token')

      const url = `${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/items/time_logs?filter[user_created][_eq]=${userId}&sort=-time_in`
      
      console.log('Fetching time logs...')
      console.log('URL:', url)
      console.log('Token preview:', token.substring(0, 20) + '...')
      console.log('User ID:', userId)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.log('Error response body:', errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Time logs response:', data)
      return data.data || []
    } catch (error) {
      console.error('Error fetching user time logs:', error)
      throw error
    }
  },

  /**
   * Get the latest time log for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object|null>} Latest time log or null
   */
  async getLatestTimeLog(userId) {
    try {
      const timeLogs = await this.getUserTimeLogs(userId)
      return timeLogs.length > 0 ? timeLogs[0] : null
    } catch (error) {
      console.error('Error fetching latest time log:', error)
      throw error
    }
  },

  /**
   * Clock in - Create a new time log entry with time_in
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Created time log
   */
  async clockIn(userId) {
    try {
      // Ensure we have a valid token before making the API call
      const hasValidToken = await ensureValidToken()
      
      if (!hasValidToken) {
        throw new Error('Unable to authenticate request')
      }

      // Get current token after ensuring it's valid
      const token = localStorage.getItem('directus_token') || sessionStorage.getItem('directus_token')

      const currentTime = new Date().toLocaleString('sv-SE') // Returns YYYY-MM-DD HH:mm:ss format in local time
      const payload = {
        user_created: userId,
        time_in: currentTime,
        time_out: null // No time_out when clocking in
      }

      console.log('Clocking in user...')
      console.log('User ID:', userId)
      console.log('Time In:', currentTime)
      console.log('Payload:', payload)

      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/items/time_logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      console.log('Clock in response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log('Clock in error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Clock in successful:', data)
      return data.data
    } catch (error) {
      console.error('Error clocking in:', error)
      throw error
    }
  },

  /**
   * Clock out - Update the latest time log entry with time_out
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Updated time log
   */
  async clockOut(userId) {
    try {
      // Ensure we have a valid token before making the API call
      const hasValidToken = await ensureValidToken()
      
      if (!hasValidToken) {
        throw new Error('Unable to authenticate request')
      }

      // Get current token after ensuring it's valid
      const token = localStorage.getItem('directus_token') || sessionStorage.getItem('directus_token')

      // Get the latest time log to update
      const latestLog = await this.getLatestTimeLog(userId)
      
      if (!latestLog) {
        throw new Error('No active time log found to clock out from')
      }

      if (latestLog.time_out) {
        throw new Error('User is already clocked out')
      }

      const currentTime = new Date().toLocaleString('sv-SE') // Returns YYYY-MM-DD HH:mm:ss format in local time
      const payload = {
        time_out: currentTime
      }

      console.log('Clocking out user...')
      console.log('User ID:', userId)
      console.log('Time Log ID:', latestLog.id)
      console.log('Time Out:', currentTime)
      console.log('Payload:', payload)

      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/items/time_logs/${latestLog.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      console.log('Clock out response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log('Clock out error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Clock out successful:', data)
      return data.data
    } catch (error) {
      console.error('Error clocking out:', error)
      throw error
    }
  },

  /**
   * Determine user's current status based on latest time log
   * @param {Object|null} latestLog - The latest time log
   * @returns {Object} Status object with isClockedIn, status, and lastActivity
   */
  getCurrentStatus(latestLog) {
    if (!latestLog) {
      return {
        isClockedIn: false,
        status: 'Clocked Out',
        lastActivity: 'Never',
        statusClass: 'clocked-out'
      }
    }

    // User is clocked in if there's no time_out in the latest entry
    const isClockedIn = !latestLog.time_out
    const lastActivity = latestLog.time_out 
      ? new Date(latestLog.time_out).toLocaleString()
      : new Date(latestLog.time_in).toLocaleString()

    return {
      isClockedIn,
      status: isClockedIn ? 'Clocked In' : 'Clocked Out',
      lastActivity,
      statusClass: isClockedIn ? 'clocked-in' : 'clocked-out'
    }
  },

  /**
   * Calculate today's work hours for a user
   * @param {Array} timeLogs - Array of time logs
   * @returns {Object} Today's work statistics
   */
  calculateTodayStats(timeLogs) {
    const today = new Date().toDateString()
    console.log('Calculating today stats for date:', today)
    
    const todayLogs = timeLogs.filter(log => {
      const logDate = new Date(log.time_in).toDateString()
      console.log('Log time_in:', log.time_in, 'Log date:', logDate, 'Matches today:', logDate === today)
      return logDate === today
    }).sort((a, b) => new Date(a.time_in) - new Date(b.time_in))

    console.log('Today logs found:', todayLogs.length, todayLogs)

    let totalMinutes = 0

    // Process each log entry for today
    for (const log of todayLogs) {
      const timeIn = new Date(log.time_in)
      // For completed sessions use time_out, for active sessions use current time
      const timeOut = log.time_out ? new Date(log.time_out) : new Date()
      
      console.log('Processing log:', {
        id: log.id,
        time_in: log.time_in,
        time_out: log.time_out,
        timeIn: timeIn.toISOString(),
        timeOut: timeOut.toISOString(),
        isActive: !log.time_out
      })
      
      // Calculate session duration in minutes for better precision
      const sessionDurationMs = timeOut.getTime() - timeIn.getTime()
      const sessionMinutes = Math.floor(sessionDurationMs / (1000 * 60))
      
      console.log('Session duration:', {
        durationMs: sessionDurationMs,
        minutes: sessionMinutes,
        hours: (sessionMinutes / 60).toFixed(2)
      })
      
      if (sessionMinutes > 0) {
        totalMinutes += sessionMinutes
      }
    }

    // Convert total minutes to hours with decimal precision
    const totalHours = totalMinutes / 60

    console.log('Total calculated:', {
      totalMinutes,
      totalHours: totalHours.toFixed(2)
    })

    return {
      hoursWorked: totalHours.toFixed(2)
    }
  },

  /**
   * Handle clock action - automatically determines whether to clock in or out
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Result with action taken and data
   */
  async handleClockAction(userId) {
    try {
      const latestLog = await this.getLatestTimeLog(userId)
      const currentStatus = this.getCurrentStatus(latestLog)

      if (currentStatus.isClockedIn) {
        // User is clocked in, so clock them out
        const result = await this.clockOut(userId)
        return {
          action: 'clock_out',
          status: 'Clocked Out',
          data: result
        }
      } else {
        // User is clocked out, so clock them in
        const result = await this.clockIn(userId)
        return {
          action: 'clock_in',
          status: 'Clocked In',
          data: result
        }
      }
    } catch (error) {
      console.error('Error handling clock action:', error)
      throw error
    }
  }
}
