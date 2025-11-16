import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
// Importar authService para registrar interceptores de axios
import '@/services/authService.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
