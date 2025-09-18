import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// Hide initial HTML loader
const hideInitialLoader = () => {
  const initialLoader = document.getElementById('initial-loader')
  if (initialLoader) {
    document.body.classList.add('app-loaded')
    setTimeout(() => {
      initialLoader.remove()
    }, 500)
  }
}

// Create and mount app
const app = createApp(App)
app.use(router)

// Mount after hiding initial loader
setTimeout(() => {
  hideInitialLoader()
  app.mount('#app')
}, 200)

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
