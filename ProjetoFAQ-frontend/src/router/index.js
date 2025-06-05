import { createRouter, createWebHistory } from 'vue-router'
import ProductDetailsView from '@/views/ProductDetailsView.vue'
import FAQView from '@/views/FAQView.vue'
import LoginView from '../views/LoginView.vue'
import ProdutosView from '@/views/ProdutosView.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: ProdutosView
    },
    {
        path: '/faq',
        name: 'faq',
        component: FAQView
    },
    {
        path: '/produto/:id',
        name: 'product-details',
        component: ProductDetailsView
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

export default router 