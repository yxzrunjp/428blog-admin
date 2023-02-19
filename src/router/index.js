import { createRouter, createWebHistory } from 'vue-router'
import cookies from 'vue-cookies'
const routes = [
    {
        name: "Layout",
        path: '/',
        component: () => import('../views/Layout.vue'),
        redirect: '/blog/list',
        children: [
            {
                // name: "",
                path: '/blog/list',
                component: () => import('../views/Blog/BlogList.vue')
            },
            {
                // name: "",
                path: '/blog/category',
                component: () => import('../views/Blog/BlogCategory.vue')
            },
            {
                // name: "",
                path: '/blog/test',
                component: () => import('../views/Blog/Test.vue')
            },
            {
                // name: "",
                path: '/special/list',
                component: () => import('../views/Special/SpecialList.vue')
            },
            {
                // name: "",
                path: '/settings/myinfo',
                component: () => import('../views/Settings/MyInfo.vue')
            },
            {
                path: '/settings/user',
                component: () => import('../views/Settings/User.vue')
            },
            {
                path: '/settings/sysinfo',
                component: () => import('../views/Settings/SysInfo.vue')
            },
        ]
    },
    {
        name: "Login",
        path: "/login",
        component: () => import('../views/Login.vue'),
    }
]

const router = createRouter({
    routes,
    history: createWebHistory()
})

router.beforeEach((to, from, next) => {
    if (to.path !== '/login') {
        const cookiesUserInfo = cookies.get('userInfo')
        if (cookiesUserInfo) {
            next()
        } else {
            router.replace('/login')
        }
    } else {
        next()
    }
})
export default router