import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './assets/styles/global.css'
import { initTheme } from './utils/theme.js'

initTheme()
createApp(App).use(router).mount('#app')
