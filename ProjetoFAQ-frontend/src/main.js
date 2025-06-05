import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/tailwind.css'
import { faqPlugin } from './store/faq'
import Swal from 'sweetalert2'

const app = createApp(App)

// Configurar plugins
app.use(router)
app.use(faqPlugin)

// Configurar SweetAlert2 globalmente
app.config.globalProperties.$swal = Swal

// Montar a aplicação após garantir que o DOM está pronto
window.addEventListener('load', () => {
    app.mount('#app')
})
