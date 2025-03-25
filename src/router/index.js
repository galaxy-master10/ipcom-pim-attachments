import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component:  () => import('../views/DashboardView.vue')
    }
];


const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes

})

export default router