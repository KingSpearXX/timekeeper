import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Lazy load components for better performance
const Login = () => import('@/views/Login.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const TimeEntry = () => import('@/views/TimeEntry.vue')
const Profile = () => import('@/views/Profile.vue')
const NotFound = () => import('@/views/NotFound.vue')

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/time-entry',
    name: 'TimeEntry',
    component: TimeEntry,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if user is authenticated (only if we don't have a user already)
  if (!authStore.isAuthenticated.value) {
    const isAuthenticated = await authStore.checkAuth()
    
    // If token check failed and we're going to a protected route
    if (!isAuthenticated && to.matched.some(record => record.meta.requiresAuth)) {
      return next('/login')
    }
  }
  
  const isAuthenticated = authStore.isAuthenticated.value
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  
  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if not authenticated
    next('/login')
  } else if (requiresGuest && isAuthenticated) {
    // Redirect to dashboard if already authenticated
    next('/dashboard')
  } else {
    next()
  }
})

export default router
