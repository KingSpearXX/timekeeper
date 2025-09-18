# TimeKeeper - Employee Time Tracking System

A modern, minimalist Vue 3 single-page application for employee time tracking with Directus as the backend.

## Features

- 🔐 **Secure Authentication** - Login with Directus authentication
- ⏰ **Time Tracking** - Clock in/out functionality with real-time display
- 📊 **Dashboard** - Daily summaries and quick actions
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- ⚡ **Real-time Updates** - Reactive interface with live time display
- 🎨 **Modern UI** - Clean, minimalist design with smooth animations

## Tech Stack

- **Frontend**: Vue 3 (Composition API), Vue Router 4
- **Backend**: Directus CMS
- **Build Tool**: Vite
- **Styling**: Modern CSS with responsive design
- **State Management**: Vue 3 reactive APIs

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Directus instance running (local or remote)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd timekeeper
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```
Edit `.env` and set your Directus URL:
```
VITE_DIRECTUS_URL=http://localhost:8055
```

4. Start the development server:
```bash
npm run dev
```

### Directus Setup

Make sure your Directus instance has the following collections configured:

- `users` - Built-in user collection for authentication
- `time_entries` - For storing clock in/out records
- `time_sessions` - For work session tracking

## Project Structure

```
src/
├── components/          # Reusable UI components
├── views/              # Page components
│   ├── Login.vue       # Authentication page
│   ├── Dashboard.vue   # Main dashboard
│   └── TimeEntry.vue   # Time tracking page
├── stores/             # State management
│   └── auth.js         # Authentication store
├── services/           # API services
│   └── directus.js     # Directus client
├── router/             # Vue Router config
│   └── index.js        # Routes and guards
└── composables/        # Reusable composition functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Authentication

The app uses Directus authentication with JWT tokens stored in localStorage. Protected routes are automatically guarded and redirect to login when necessary.

## Design Philosophy

TimeKeeper follows a modern, minimalist design approach:

- **Clean Interface**: Uncluttered layouts focusing on essential information
- **Responsive**: Mobile-first design that adapts to all screen sizes
- **Accessible**: Semantic HTML and proper ARIA labels
- **Performance**: Optimized for fast loading and smooth interactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
