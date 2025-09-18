import { createDirectus, authentication, rest } from '@directus/sdk'

// Initialize Directus client
const directus = createDirectus(import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055')
  .with(authentication('json'))
  .with(rest())

export default directus
