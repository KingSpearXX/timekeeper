<template>
  <div class="login-container">
    <!-- Desktop Layout: Split design -->
    <div class="login-split">
      <!-- Left side: Big typography (desktop only) -->
      <div class="login-hero">
        <div class="hero-content">
          <h1 class="hero-title">TimeKeeper</h1>
          <p class="hero-subtitle">Track your time, elevate your productivity</p>
          <div class="hero-features">
            <div class="feature-item">
              <svg class="feature-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
              </svg>
              <span class="feature-text">Easy time tracking</span>
            </div>
            <div class="feature-item">
              <svg class="feature-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
              <span class="feature-text">Detailed reports</span>
            </div>
            <div class="feature-item">
              <svg class="feature-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H7V4h10v16z"/>
              </svg>
              <span class="feature-text">Mobile friendly</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right side: Login form -->
      <div class="login-form-section">
        <div class="login-card">
          <!-- Mobile header (only visible on mobile) -->
          <div class="mobile-header">
            <h1 class="mobile-title">TimeKeeper</h1>
            <p class="mobile-subtitle">Sign in to your account</p>
          </div>
          
          <!-- Desktop header -->
          <div class="desktop-header">
            <h2 class="form-title">Welcome back</h2>
            <p class="form-subtitle">Sign in to your account</p>
          </div>
          
          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-input"
                :class="{ 
                  'error': errors.email, 
                  'has-content': form.email.length > 0,
                  'valid': form.email.length > 0 && isValidEmail(form.email)
                }"
                placeholder="Enter your email"
                required
                @blur="validateEmail"
              />
              <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <div class="password-input-wrapper">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input password-input"
                  :class="{ 
                    'error': errors.password, 
                    'has-content': form.password.length > 0,
                    'valid': form.password.length >= 6
                  }"
                  placeholder="Enter your password"
                  required
                  @blur="validatePassword"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                >
                  <svg v-if="showPassword" class="password-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                  </svg>
                  <svg v-else class="password-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                </button>
              </div>
              <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
            </div>
            
            <!-- Keep me signed in checkbox -->
            <div class="form-group checkbox-group">
              <label class="checkbox-wrapper">
                <input
                  id="rememberMe"
                  v-model="form.rememberMe"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">Keep me signed in</span>
              </label>
            </div>
            
            <div v-if="authStore.error.value" class="alert alert-error">
              {{ authStore.error.value }}
            </div>
            
            <button
              type="submit"
              class="login-button"
              :disabled="authStore.loading.value"
            >
              <span v-if="authStore.loading.value" class="loading-spinner"></span>
              {{ authStore.loading.value ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { testDirectusConnection } from '@/utils/directus-test'

const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const errors = ref({})
const showPassword = ref(false)

// Test Directus connection on component mount
onMounted(async () => {
  if (import.meta.env.DEV) {
    await testDirectusConnection()
  }
})

const validateForm = () => {
  errors.value = {}
  
  // Email validation
  if (!form.email) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.value.email = 'Please enter a valid email address'
  }
  
  // Password validation
  if (!form.password) {
    errors.value.password = 'Password is required'
  } else if (form.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
  }
  
  return Object.keys(errors.value).length === 0
}

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const validateEmail = () => {
  if (form.email && !isValidEmail(form.email)) {
    errors.value.email = 'Please enter a valid email address'
  } else if (errors.value.email && isValidEmail(form.email)) {
    delete errors.value.email
  }
}

const validatePassword = () => {
  if (form.password && form.password.length > 0 && form.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
  } else if (errors.value.password && form.password.length >= 6) {
    delete errors.value.password
  }
}

const handleLogin = async () => {
  if (!validateForm()) return
  
  try {
    console.log('Attempting login with:', form.email, 'Remember me:', form.rememberMe)
    await authStore.login(form.email, form.password, form.rememberMe)
    console.log('Login successful')
  } catch (error) {
    console.error('Login failed:', error)
    // Error is already handled in the store
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 0;
  padding: 0;
  position: relative;
}

.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  background: 
    radial-gradient(ellipse 120% 80% at 20% 10%, rgba(120, 119, 198, 0.4), transparent 50%),
    radial-gradient(ellipse 100% 120% at 80% 90%, rgba(255, 119, 198, 0.3), transparent 60%),
    radial-gradient(ellipse 80% 100% at 10% 60%, rgba(120, 255, 198, 0.35), transparent 50%),
    radial-gradient(ellipse 90% 70% at 90% 20%, rgba(198, 120, 255, 0.25), transparent 55%);
  animation: aurora 12s ease-in-out infinite;
  z-index: 0;
}

@keyframes aurora {
  0% {
    transform: rotate(0deg) scale(1) translate(0%, 0%);
    opacity: 0.6;
  }
  25% {
    transform: rotate(0.5deg) scale(1.05) translate(2%, -1%);
    opacity: 0.8;
  }
  50% {
    transform: rotate(-0.3deg) scale(0.95) translate(-1%, 2%);
    opacity: 0.7;
  }
  75% {
    transform: rotate(0.8deg) scale(1.02) translate(1%, -2%);
    opacity: 0.9;
  }
  100% {
    transform: rotate(0deg) scale(1) translate(0%, 0%);
    opacity: 0.6;
  }
}

.login-split {
  height: 100vh;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  margin: 0;
  padding: 0;
  position: relative;
  z-index: 1;
}

/* Desktop Layout: Split design */
@media (min-width: 768px) {
  .login-split {
    grid-template-columns: 1fr 1fr;
  }
}

/* Left side: Hero section (desktop only) */
.login-hero {
  display: none;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(30px);
  border-right: 1px solid rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
}

.login-hero::before {
  content: '';
  position: absolute;
  top: -20%;
  left: -20%;
  right: -20%;
  bottom: -20%;
  background: 
    radial-gradient(ellipse 60% 40% at 30% 20%, rgba(255, 255, 255, 0.1), transparent 40%),
    radial-gradient(ellipse 40% 60% at 70% 80%, rgba(255, 255, 255, 0.08), transparent 45%),
    radial-gradient(ellipse 50% 50% at 20% 70%, rgba(255, 255, 255, 0.06), transparent 35%);
  animation: heroAurora 15s ease-in-out infinite reverse;
  z-index: 0;
}

@keyframes heroAurora {
  0% {
    transform: rotate(0deg) scale(1) translate(0%, 0%);
    opacity: 0.4;
  }
  30% {
    transform: rotate(-0.3deg) scale(1.02) translate(-1%, 1%);
    opacity: 0.6;
  }
  60% {
    transform: rotate(0.4deg) scale(0.98) translate(1%, -1%);
    opacity: 0.5;
  }
  100% {
    transform: rotate(0deg) scale(1) translate(0%, 0%);
    opacity: 0.4;
  }
}

@media (min-width: 768px) {
  .login-hero {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: left;
  color: white;
  max-width: 100%;
  width: 100%;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  background: linear-gradient(45deg, #ffffff, #f0f9ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  line-height: 1.1;
  word-break: keep-all;
  overflow-wrap: normal;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin: 0 0 2.5rem 0;
  opacity: 0.9;
  line-height: 1.5;
}

.hero-features {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  position: relative;
}

.feature-icon {
  width: 24px;
  height: 24px;
  color: rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}

.feature-text {
  font-size: 1rem;
  font-weight: 500;
}

/* Right side: Form section */
.login-form-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  position: relative;
  height: 100vh;
  width: 100%;
}

@media (min-width: 768px) {
  .login-form-section {
    background: white;
    padding: 2rem;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }
  
  .login-form-section::before {
    content: '';
    position: absolute;
    top: -30%;
    left: -30%;
    right: -30%;
    bottom: -30%;
    background: 
      radial-gradient(ellipse 40% 30% at 20% 80%, rgba(102, 126, 234, 0.05), transparent 50%),
      radial-gradient(ellipse 30% 40% at 80% 20%, rgba(118, 75, 162, 0.04), transparent 45%);
    animation: formAurora 18s ease-in-out infinite;
    z-index: 0;
    pointer-events: none;
  }
}

@keyframes formAurora {
  0% {
    transform: rotate(0deg) scale(1) translate(0%, 0%);
    opacity: 0.3;
  }
  40% {
    transform: rotate(0.2deg) scale(1.01) translate(0.5%, -0.5%);
    opacity: 0.5;
  }
  80% {
    transform: rotate(-0.1deg) scale(0.99) translate(-0.3%, 0.8%);
    opacity: 0.4;
  }
  100% {
    transform: rotate(0deg) scale(1) translate(0%, 0%);
    opacity: 0.3;
  }
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 2rem;
  width: 100%;
  height: auto;
  max-width: none;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

@media (min-width: 768px) {
  .login-card {
    background: transparent;
    backdrop-filter: none;
    border: none;
    box-shadow: none;
    border-radius: 0;
    padding: 0;
    max-width: 400px;
    height: auto;
    position: relative;
    z-index: 1;
  }
}

/* Mobile header (only visible on mobile) */
.mobile-header {
  text-align: center;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .mobile-header {
    display: none;
  }
}

.mobile-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mobile-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
}

/* Desktop header */
.desktop-header {
  display: none;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .desktop-header {
    display: block;
  }
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.form-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #6b7280;
  transition: color 0.2s;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle:hover {
  color: #374151;
}

.password-toggle:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
  border-radius: 4px;
}

.password-icon {
  width: 20px;
  height: 20px;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
  margin-bottom: 0.25rem;
}

.form-input {
  padding: 1rem 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  outline: none;
  background: white;
  color: #1f2937;
  width: 100%;
  box-sizing: border-box;
}

.form-input.has-content {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-input.valid {
  border-color: #764ba2;
  box-shadow: 0 0 0 4px rgba(118, 75, 162, 0.1);
}

.password-input {
  padding-right: 3rem;
}

.form-input::placeholder {
  color: #9ca3af;
  opacity: 1;
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.error-text {
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 0.25rem;
}

.alert {
  padding: 1rem 1.25rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.alert-error {
  background-color: #fef2f2;
  color: #dc2626;
  border: 2px solid #fecaca;
}

/* Checkbox styles */
.checkbox-group {
  margin: 0.5rem 0;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 0.75rem;
  padding: 0.5rem 0;
  position: relative;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-custom {
  position: relative;
  height: 20px;
  width: 20px;
  background-color: white;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.checkbox-custom::after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-input:checked + .checkbox-custom {
  background-color: #667eea;
  border-color: #667eea;
}

.checkbox-input:checked + .checkbox-custom::after {
  display: block;
}

.checkbox-wrapper:hover .checkbox-custom {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.checkbox-input:focus + .checkbox-custom {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.checkbox-label {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
  user-select: none;
}

.login-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.3);
}

.login-button:hover:not(:disabled)::before {
  left: 100%;
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .login-container {
    padding: 0;
    margin: 0;
  }
  
  .login-form-section {
    padding: 2rem;
    height: 100vh;
  }
  
  .login-card {
    max-width: none;
    margin: 0;
    padding: 2.5rem;
    border-radius: 24px;
    height: auto;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
  
  .mobile-title {
    font-size: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: none;
  }
  
  .mobile-subtitle {
    color: #4b5563;
    font-weight: 500;
  }
  
  .form-label {
    color: #374151;
    font-weight: 600;
  }
  
  .form-input {
    padding: 0.875rem 1rem;
    font-size: 16px; /* Prevents zoom on iOS */
    background: white;
    border: 2px solid rgba(229, 231, 235, 0.8);
    color: #1f2937;
  }
  
  .password-input {
    padding-right: 3rem;
  }
  
  .form-input:focus {
    background: white;
    border-color: #667eea;
    color: #1f2937;
  }
  
  .form-input.has-content {
    background: white;
    border-color: #667eea;
    color: #1f2937;
  }
  
  .form-input.valid {
    background: white;
    border-color: #764ba2;
    color: #1f2937;
  }
}

/* Large desktop optimizations */
@media (min-width: 1200px) {
  .hero-title {
    font-size: 4.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.375rem;
  }
  
  .login-form-section {
    padding: 4rem;
  }
  
  .login-hero {
    padding: 3rem;
  }
}
</style>
