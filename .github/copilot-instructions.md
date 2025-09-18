<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# TimeKeeper - Employee Time Tracking Application

This is a Vue 3 single-page application (SPA) for employee time tracking with the following characteristics:

## Tech Stack
- **Frontend**: Vue 3 (Composition API), Vue Router 4
- **Backend**: Directus CMS/Headless CMS
- **Build Tool**: Vite
- **Styling**: Vanilla CSS with modern design principles
- **API Client**: Directus SDK

## Design Philosophy
- **Modern & Minimalist**: Clean, uncluttered interface with focus on usability
- **Responsive**: Mobile-first design that works on all device sizes
- **Reactive**: Real-time updates and reactive state management
- **Compact**: Efficient use of screen space without overwhelming users

## Project Structure
- `/src/views/` - Page components (Login, Dashboard, TimeEntry)
- `/src/components/` - Reusable UI components
- `/src/stores/` - State management (auth store using Vue's reactive API)
- `/src/services/` - API services (Directus client)
- `/src/router/` - Vue Router configuration with auth guards
- `/src/composables/` - Reusable composition functions

## Key Features
- Authentication with Directus
- Router guards for protected routes
- Employee time clock in/out functionality
- Dashboard with time summaries
- Responsive design for mobile and desktop

## Coding Guidelines
- Use Vue 3 Composition API with `<script setup>`
- Prefer reactive() and ref() over Vuex for state management
- Use modern ES6+ JavaScript features
- Follow Vue.js style guide for component naming and structure
- Implement proper error handling for API calls
- Use CSS Grid and Flexbox for layouts
- Maintain accessibility standards (ARIA labels, semantic HTML)

## API Integration
- All API calls should go through the Directus SDK
- Handle authentication tokens properly with localStorage
- Implement proper error handling and loading states
- Use environment variables for configuration

## Directus Collections Needed
- `users` - Employee accounts (built-in)
- `time_entries` - Clock in/out records
- `time_sessions` - Work sessions with start/end times

When suggesting code improvements or new features, prioritize:
1. User experience and interface simplicity
2. Performance and responsiveness
3. Security best practices
4. Code maintainability
