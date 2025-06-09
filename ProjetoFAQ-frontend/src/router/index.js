import { createRouter, createWebHistory } from 'vue-router'
import ProductDetailsView from '@/views/ProductDetailsView.vue'
import FAQView from '@/views/FAQView.vue'
import LoginView from '../views/LoginView.vue'
import ProdutosView from '@/views/ProdutosView.vue'
import { isAuthenticated } from '@/services/auth'

const routes = [
    {
        path: '/',
        redirect: '/produtos'
    },
    {
        path: '/produtos',
        name: 'produtos',
        component: ProdutosView,
        meta: { requiresAuth: true }
    },
    {
        path: '/faq',
        name: 'faq',
        component: FAQView,
        meta: { requiresAuth: true }
    },
    {
        path: '/produto/:id',
        name: 'product-details',
        component: ProductDetailsView,
        meta: { requiresAuth: true }
    },
    {
        path: '/login',
        name: 'login',
        component: LoginView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation guard para verificar autenticação
router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !isAuthenticated()) {
        next('/login')
    } else {
        next()
    }
})

export default router 