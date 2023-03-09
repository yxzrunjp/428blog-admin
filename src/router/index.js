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
                meta: {
                    name: "博客管理"
                },
                path: '/blog/list',
                component: () => import('../views/Blog/BlogList.vue')

            },
            {
                meta: {
                    name: "分类管理"
                },
                path: '/blog/category',
                component: () => import('../views/Blog/BlogCategory.vue')
            },
            {
                meta: {
                    name: "专题管理"
                },
                path: '/special/list',
                component: () => import('../views/Special/SpecialList.vue')
            },
            {
                meta: {
                    name: "个人信息"
                },
                path: '/settings/myinfo',
                component: () => import('../views/Settings/MyInfo.vue')
            },
            {
                meta: {
                    name: "博客成员"
                },
                path: '/settings/user',
                component: () => import('../views/Settings/User.vue')
            },
            {
                meta: {
                    name: "系统设置"
                },
                path: '/settings/sysinfo',
                component: () => import('../views/Settings/SysInfo.vue')
            },
            {
                meta: {
                    name: "回收站"
                },
                path: '/recover/list',
                component: () => import('../views/Recover/RecoveryList.vue')
            },
        ]
    },
    {
        name: "Login",
        path: "/login",
        meta: {
            name: "登录"
        },
        component: () => import('../views/Login.vue'),
    }
]

const router = createRouter({
    routes,
    history: createWebHistory()
})

router.beforeEach((to, from, next) => {
    document.title = to.meta.name || 'blog'
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