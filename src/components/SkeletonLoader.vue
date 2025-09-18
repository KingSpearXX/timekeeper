<template>
  <div class="skeleton-container">
    <!-- Avatar Skeleton -->
    <div v-if="type === 'profile'" class="skeleton-profile">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-profile-info">
        <div class="skeleton-line skeleton-name"></div>
        <div class="skeleton-line skeleton-email"></div>
      </div>
    </div>

    <!-- Card Skeleton -->
    <div v-else-if="type === 'card'" class="skeleton-card">
      <div class="skeleton-card-header">
        <div class="skeleton-line skeleton-title"></div>
      </div>
      <div class="skeleton-card-body">
        <div class="skeleton-line skeleton-text" v-for="i in lines" :key="i"></div>
      </div>
    </div>

    <!-- Table Skeleton -->
    <div v-else-if="type === 'table'" class="skeleton-table">
      <div class="skeleton-table-header">
        <div class="skeleton-line skeleton-th" v-for="i in columns" :key="i"></div>
      </div>
      <div class="skeleton-table-row" v-for="i in rows" :key="i">
        <div class="skeleton-line skeleton-td" v-for="j in columns" :key="j"></div>
      </div>
    </div>

    <!-- Form Skeleton -->
    <div v-else-if="type === 'form'" class="skeleton-form">
      <div class="skeleton-form-group" v-for="i in fields" :key="i">
        <div class="skeleton-line skeleton-label"></div>
        <div class="skeleton-line skeleton-input"></div>
      </div>
    </div>

    <!-- Text Skeleton (default) -->
    <div v-else class="skeleton-text-block">
      <div class="skeleton-line" v-for="i in lines" :key="i"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'text', // text, profile, card, table, form
    validator: (value) => ['text', 'profile', 'card', 'table', 'form'].includes(value)
  },
  lines: {
    type: Number,
    default: 3
  },
  columns: {
    type: Number,
    default: 3
  },
  rows: {
    type: Number,
    default: 5
  },
  fields: {
    type: Number,
    default: 4
  }
})
</script>

<style scoped>
.skeleton-container {
  padding: 1rem;
}

/* Base skeleton line */
.skeleton-line {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  height: 1rem;
  margin-bottom: 0.75rem;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Profile Skeleton */
.skeleton-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.skeleton-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  flex-shrink: 0;
}

.skeleton-profile-info {
  flex: 1;
}

.skeleton-name {
  width: 60%;
  height: 1.2rem;
}

.skeleton-email {
  width: 80%;
  height: 1rem;
}

/* Card Skeleton */
.skeleton-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.skeleton-card-header {
  margin-bottom: 1rem;
}

.skeleton-title {
  width: 40%;
  height: 1.25rem;
  margin-bottom: 1rem;
}

.skeleton-text:nth-child(1) { width: 100%; }
.skeleton-text:nth-child(2) { width: 85%; }
.skeleton-text:nth-child(3) { width: 70%; }
.skeleton-text:nth-child(4) { width: 90%; }

/* Table Skeleton */
.skeleton-table {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.skeleton-table-header {
  display: grid;
  grid-template-columns: repeat(var(--columns, 3), 1fr);
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.skeleton-th {
  height: 1rem;
  width: 80%;
}

.skeleton-table-row {
  display: grid;
  grid-template-columns: repeat(var(--columns, 3), 1fr);
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.skeleton-table-row:last-child {
  border-bottom: none;
}

.skeleton-td {
  height: 1rem;
}

.skeleton-td:nth-child(1) { width: 70%; }
.skeleton-td:nth-child(2) { width: 90%; }
.skeleton-td:nth-child(3) { width: 60%; }

/* Form Skeleton */
.skeleton-form-group {
  margin-bottom: 1.5rem;
}

.skeleton-label {
  width: 30%;
  height: 0.875rem;
  margin-bottom: 0.5rem;
}

.skeleton-input {
  width: 100%;
  height: 2.5rem;
  border-radius: 6px;
}

/* Text Block Skeleton */
.skeleton-text-block .skeleton-line:nth-child(1) { width: 100%; }
.skeleton-text-block .skeleton-line:nth-child(2) { width: 95%; }
.skeleton-text-block .skeleton-line:nth-child(3) { width: 80%; }
.skeleton-text-block .skeleton-line:nth-child(4) { width: 85%; }
.skeleton-text-block .skeleton-line:nth-child(5) { width: 70%; }

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .skeleton-line,
  .skeleton-avatar {
    background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
    background-size: 200% 100%;
  }
  
  .skeleton-card {
    border-color: #4b5563;
  }
  
  .skeleton-table {
    border-color: #4b5563;
  }
  
  .skeleton-table-header {
    background: #374151;
    border-bottom-color: #4b5563;
  }
  
  .skeleton-table-row {
    border-bottom-color: #4b5563;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .skeleton-profile {
    flex-direction: column;
    text-align: center;
  }
  
  .skeleton-avatar {
    width: 60px;
    height: 60px;
  }
  
  .skeleton-table-header,
  .skeleton-table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
</style>
