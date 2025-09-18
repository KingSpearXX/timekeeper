import { ref, reactive } from 'vue'

// Global loading state
const globalLoading = ref(false)
const loadingStates = reactive({})

export function useLoading(key = 'default') {
  // Create or get loading state for this key
  if (!loadingStates[key]) {
    loadingStates[key] = ref(false)
  }

  const isLoading = loadingStates[key]

  const startLoading = (text = '') => {
    isLoading.value = true
    if (text) {
      loadingStates[`${key}_text`] = ref(text)
    }
  }

  const stopLoading = () => {
    isLoading.value = false
    if (loadingStates[`${key}_text`]) {
      loadingStates[`${key}_text`].value = ''
    }
  }

  const withLoading = async (asyncFunction, loadingText = '') => {
    try {
      startLoading(loadingText)
      const result = await asyncFunction()
      return result
    } catch (error) {
      throw error
    } finally {
      stopLoading()
    }
  }

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
    loadingText: loadingStates[`${key}_text`] || ref('')
  }
}

// Global loading functions
export function useGlobalLoading() {
  const startGlobalLoading = () => {
    globalLoading.value = true
  }

  const stopGlobalLoading = () => {
    globalLoading.value = false
  }

  return {
    isGlobalLoading: globalLoading,
    startGlobalLoading,
    stopGlobalLoading
  }
}

// Route loading state
const routeLoading = ref(false)

export function useRouteLoading() {
  const startRouteLoading = () => {
    routeLoading.value = true
  }

  const stopRouteLoading = () => {
    routeLoading.value = false
  }

  return {
    isRouteLoading: routeLoading,
    startRouteLoading,
    stopRouteLoading
  }
}
