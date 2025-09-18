<template>
  <div class="loading-overlay" :class="{ 'fullscreen': fullscreen, 'inline': !fullscreen }">
    <div class="loading-container">
      <!-- Spinner -->
      <div class="loading-spinner" :class="size">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      
      <!-- Loading Text -->
      <div v-if="text" class="loading-text">{{ text }}</div>
      
      <!-- Progress Bar (optional) -->
      <div v-if="showProgress" class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <div class="progress-text">{{ progress }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  fullscreen: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100
  }
})
</script>

<style scoped>
.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-overlay.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
}

.loading-overlay.inline {
  position: relative;
  min-height: 200px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
}

.loading-container {
  text-align: center;
  padding: 2rem;
}

.loading-spinner {
  display: inline-block;
  position: relative;
  margin-bottom: 1rem;
}

.loading-spinner.small {
  width: 40px;
  height: 40px;
}

.loading-spinner.medium {
  width: 60px;
  height: 60px;
}

.loading-spinner.large {
  width: 80px;
  height: 80px;
}

.spinner-ring {
  box-sizing: border-box;
  display: block;
  position: absolute;
  border: 3px solid transparent;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.loading-spinner.small .spinner-ring {
  width: 32px;
  height: 32px;
  margin: 4px;
  border-width: 2px;
}

.loading-spinner.medium .spinner-ring {
  width: 48px;
  height: 48px;
  margin: 6px;
  border-width: 3px;
}

.loading-spinner.large .spinner-ring {
  width: 64px;
  height: 64px;
  margin: 8px;
  border-width: 4px;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
  border-top-color: #667eea;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
  border-top-color: #764ba2;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
  border-top-color: #f093fb;
}

.spinner-ring:nth-child(4) {
  border-top-color: #f5576c;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 1rem;
}

.progress-container {
  max-width: 300px;
  margin: 0 auto;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .loading-overlay.fullscreen {
    background: rgba(17, 24, 39, 0.95);
  }
  
  .loading-overlay.inline {
    background: rgba(31, 41, 55, 0.8);
  }
  
  .loading-text {
    color: #f3f4f6;
  }
  
  .progress-text {
    color: #d1d5db;
  }
  
  .progress-bar {
    background: #374151;
  }
}
</style>
