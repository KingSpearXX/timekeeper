<template>
  <div class="time-entry">
    <header class="page-header">
      <div class="header-content">
        <router-link to="/dashboard" class="back-button">
          ← Back to Dashboard
        </router-link>
        <h1 class="page-title">Time Entry</h1>
      </div>
    </header>
    
    <main class="time-entry-main">
      <div class="time-entry-container">
        <div class="current-status-card">
          <div class="status-header">
            <h2>Current Status</h2>
            <div class="status-indicator">
              <div class="status-dot" :class="currentStatus"></div>
              <span class="status-text">{{ statusText }}</span>
            </div>
          </div>
          
          <div class="time-display">
            <div class="current-time">{{ currentTime }}</div>
            <div class="current-date">{{ currentDate }}</div>
          </div>
          
          <div class="action-section">
            <button 
              @click="toggleTimeEntry"
              class="time-action-button"
              :class="currentStatus"
              :disabled="loading"
            >
              <span v-if="loading" class="loading-spinner"></span>
              {{ actionButtonText }}
            </button>
          </div>
        </div>
        
        <!-- Today's entries -->
        <div class="entries-card">
          <h2 class="card-title">Today's Entries</h2>
          <div v-if="todayEntries.length === 0" class="no-entries">
            No time entries for today
          </div>
          <div v-else class="entries-list">
            <div 
              v-for="entry in todayEntries" 
              :key="entry.id"
              class="entry-item"
            >
              <div class="entry-type">{{ entry.type }}</div>
              <div class="entry-time">{{ formatTime(entry.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Reactive data
const currentTime = ref('')
const currentDate = ref('')
const currentStatus = ref('clocked-out') // 'clocked-in' | 'clocked-out'
const loading = ref(false)
const todayEntries = ref([])

// Computed properties
const statusText = computed(() => {
  return currentStatus.value === 'clocked-in' ? 'Clocked In' : 'Clocked Out'
})

const actionButtonText = computed(() => {
  if (loading.value) return 'Processing...'
  return currentStatus.value === 'clocked-in' ? 'Clock Out' : 'Clock In'
})

// Methods
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  currentDate.value = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  })
}

const toggleTimeEntry = async () => {
  loading.value = true
  
  try {
    // TODO: Implement actual API calls to Directus
    // For now, just simulate the action
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newEntry = {
      id: Date.now(),
      type: currentStatus.value === 'clocked-in' ? 'Clock Out' : 'Clock In',
      timestamp: new Date().toISOString()
    }
    
    todayEntries.value.push(newEntry)
    currentStatus.value = currentStatus.value === 'clocked-in' ? 'clocked-out' : 'clocked-in'
    
  } catch (error) {
    console.error('Error toggling time entry:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
let timeInterval

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  
  // TODO: Load today's entries from Directus
  // TODO: Check current status from last entry
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.time-entry {
  min-height: 100vh;
  background-color: #f9fafb;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 0;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.back-button:hover {
  color: #374151;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.time-entry-main {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.time-entry-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.current-status-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.status-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-dot.clocked-in {
  background: #10b981;
}

.status-dot.clocked-out {
  background: #ef4444;
}

.status-text {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.time-display {
  margin-bottom: 2rem;
}

.current-time {
  font-size: 3rem;
  font-weight: 700;
  color: #1f2937;
  font-family: 'Monaco', 'Menlo', monospace;
  margin-bottom: 0.5rem;
}

.current-date {
  color: #6b7280;
  font-size: 1rem;
}

.time-action-button {
  padding: 1rem 3rem;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 200px;
}

.time-action-button.clocked-out {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.time-action-button.clocked-in {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.time-action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.time-action-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.entries-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.no-entries {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
  font-style: italic;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.entry-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
}

.entry-type {
  font-weight: 500;
  color: #374151;
}

.entry-time {
  font-family: 'Monaco', 'Menlo', monospace;
  color: #6b7280;
  font-size: 0.875rem;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .status-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .current-time {
    font-size: 2.5rem;
  }
  
  .time-action-button {
    width: 100%;
    min-width: auto;
  }
}
</style>
