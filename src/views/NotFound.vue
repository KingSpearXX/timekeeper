<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <!-- 404 Icon -->
      <div class="not-found-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <div class="error-code">404</div>
      </div>

      <!-- Content -->
      <div class="not-found-content">
        <h1 class="not-found-title">Page Not Found</h1>
        <p class="not-found-message">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        
        <!-- Navigation Options -->
        <div class="not-found-actions">
          <button @click="goBack" class="action-btn secondary">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Go Back
          </button>
          
          <router-link to="/dashboard" class="action-btn primary">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            Go to Dashboard
          </router-link>
        </div>

        <!-- Quick Links -->
        <div class="quick-links">
          <h3>Quick Links</h3>
          <div class="links-grid">
            <router-link to="/dashboard" class="quick-link">
              <svg class="link-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
              <span>Dashboard</span>
            </router-link>
            
            <router-link to="/profile" class="quick-link">
              <svg class="link-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span>Profile</span>
            </router-link>
            
            <a href="mailto:support@misterprintph.com" class="quick-link">
              <svg class="link-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <span>Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.not-found-page {
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
}

.not-found-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.not-found-icon {
  margin-bottom: 2rem;
}

.not-found-icon svg {
  width: 80px;
  height: 80px;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.error-code {
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.not-found-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.not-found-message {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.not-found-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  font-size: 0.925rem;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.action-btn.primary:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.action-btn.secondary:hover {
  background: #e5e7eb;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.quick-links {
  border-top: 1px solid #e5e7eb;
  padding-top: 2rem;
}

.quick-links h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: #6b7280;
  transition: all 0.2s;
  border: 1px solid #e5e7eb;
}

.quick-link:hover {
  background: #f9fafb;
  color: #667eea;
  border-color: #667eea;
}

.link-icon {
  width: 24px;
  height: 24px;
}

.quick-link span {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .not-found-container {
    padding: 2rem;
    margin: 1rem;
  }

  .error-code {
    font-size: 3rem;
  }

  .not-found-title {
    font-size: 1.5rem;
  }

  .not-found-actions {
    flex-direction: column;
    align-items: center;
  }

  .action-btn {
    width: 100%;
    max-width: 200px;
    justify-content: center;
  }

  .links-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
