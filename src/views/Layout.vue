<template>
    <div class="layout">
        <el-container>
            <el-header class="header">
                <div class="logo">LOGO</div>
                <div class="user-info">
                    <span>欢迎回来，</span>
                    <el-dropdown>
                        <span class="el-dropdown-link">
                            <span class="nickname">{{ store.nickName }}</span>
                            <el-icon class="el-icon--right">
                                <arrow-down />
                            </el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <router-link to='/settings/myinfo'>
                                    <el-dropdown-item>个人信息</el-dropdown-item>
                                </router-link>
                                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                    <div class="head-img">
                        <img :src="proxy.globalInfo.imageUrl + store.avatar" alt="头像" :title="'头像'">
                    </div>
                </div>
            </el-header>
            <el-container class="container">
                <el-aside class="left-aside">
                    <div>
                        <el-button @click="handleRelease" class="post-btn">发布</el-button>
                    </div>
                    <ul class="menu-panel">
                        <!-- 一级标题 -->
                        <li v-for="menu in menuList" :key="menu.title">
                            <span class="menu-title-container" @click="handleMenu(menu)">
                                <span :class="['iconfont', menu.icon]"></span>
                                <span class="menu-title">{{ menu.title }}</span>
                                <span :class="['iconfont', menu.open ? 'icon-account' : 'icon-Password']"></span>
                            </span>
                            <ul class="sub-menu" v-show="menu.open">
                                <!-- 二级标题 -->
                                <template v-for="subMenu in menu.children">
                                    <template v-if="subMenu.roleType === undefined || subMenu.roleType === store.roleType">
                                        <li :class="currentPath === subMenu.path ? 'highlight' : ''" :key="subMenu.title">
                                            <router-link class="link" :to="subMenu.path"><span class="sub-menu-item">{{
                                                subMenu.title
                                            }}</span></router-link>
                                        </li>
                                    </template>
                                </template>

                                <!-- <li v-for="subMenu in menu.children" :key="subMenu.title">
                                                                                                                                                    <span class="sub-menu-item">{{ subMenu.title }}</span>
                                                                                                                                                </li> -->
                            </ul>
                        </li>
                    </ul>
                </el-aside>
                <el-main class="right-main">
                    <RouterView />
                </el-main>
            </el-container>
        </el-container>
    </div>

    <Dialog :width="'500px'" :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons"
        @close="dialogClose">
        <div class="process-box">
            <el-progress :width="250" type="dashboard" :percentage="releaseResult.progress" :color="colors" />
            <div :style="{ marginTop: '10px' }" v-if="releaseResult.result === 0">
                <div>生成页面出错了：{{ releaseResult.errorMsg }}</div>
                <div class="info">具体错误请查看服务器日志</div>
            </div>
            <div :style="{ marginTop: '10px' }" class="releace-success"
                v-if="releaseResult.result === 1 && releaseResult.progress === 100">
                发布成功
            </div>
            <el-button :style="{ marginTop: '20px' }" type="primary" @click="handleClose">关闭</el-button>
        </div>
    </Dialog>
</template>
  

<script setup>
import { reactive, getCurrentInstance, watch, ref, nextTick } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router'
import cookies from 'vue-cookies';
import { useUserInfoStore } from '@/store/userInfoStore'
const store = useUserInfoStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()
const menuList = reactive([
    {
        title: '博客',
        icon: 'icon-account',
        open: true,
        children: [
            {
                title: '博客管理',
                path: '/blog/list',
            },
            {
                title: '分类管理',
                path: '/blog/category',
            }
        ]
    },
    {
        title: '专题',
        icon: 'icon-account',
        open: false,
        children: [
            {
                title: '专题管理',
                path: '/special/list',
            },
        ]
    },
    {
        title: '设置',
        icon: 'icon-account',
        open: false,
        children: [
            {
                title: '个人信息设置',
                path: '/settings/myinfo',
            },
            {
                title: '博客成员',
                path: '/settings/user',
            },
            {
                title: '系统设置',
                path: '/settings/sysinfo',
                roleType: 1,
            },
        ]
    },
    {
        title: '回收站',
        icon: 'icon-account',
        open: false,
        children: [
            {
                title: '回收站',
                path: '/recover/list',
            },
        ]
    },

])

const api = {
    getUserInfo: '/getUserInfo',
    logout: '/logout',
    createHtml: '/createHtml',
    checkProgress: '/checkProgress',
}

// 用户信息
const getUserInfo = async () => {
    const result = await proxy.Request({
        url: api.getUserInfo
    })
    if (!result)
        return
    const data = result.data
    store.$patch({
        ...data
    })
}
const handleMenu = (menu) => {
    menu.open = !menu.open
}

// 退出登录
const handleLogout = () => {
    logout()

}
const logout = async () => {
    const result = await proxy.Request({
        url: api.logout
    })
    if (!result) {
        return
    }
    cookies.remove('userInfo')
    cookies.remove('loginInfo')
    store.$reset()
    router.push('/login')
}

// 发布
const handleRelease = () => {
    createHtml()
}
const createHtml = async () => {
    const result = await proxy.Request({
        url: api.createHtml,
    })
    if (!result)
        return
    dialogShow()
    checkProgress()
}
const releaseResult = reactive({
    result: 0,
    progress: 0,
    errorMsg: ""
})
const checkProgress = async () => {
    const result = await proxy.Request({
        url: api.checkProgress,
        showLoading: false,
    })
    if (!result)
        return
    Object.assign(releaseResult, result.data)

    if (releaseResult.progress !== 100) {
        setTimeout(() => {
            checkProgress()
        }, 1000)
    }
}

// 弹窗相关
const dialogConfig = reactive({
    show: false,
    title: '发布',//标题
    buttons: [
    ],//按钮集合

})
const dialogClose = () => {
    dialogConfig.show = false
}
const dialogShow = () => {
    dialogConfig.show = true
}
// 关闭弹窗
const handleClose = () => {
    dialogClose()
    nextTick(() => {
        releaseResult.result = 0
        releaseResult.progress = 0
        releaseResult.errorMsg = ""
    })
}

// 进度条
const colors = [
    { color: '#f56c6c', percentage: 20 },
    { color: '#e6a23c', percentage: 40 },
    { color: '#5cb87a', percentage: 60 },
    { color: '#1989fa', percentage: 80 },
    { color: '#6f7ad3', percentage: 100 },
]

const currentPath = ref('')
watch(route, (newV, oldV) => {
    currentPath.value = newV.path
    console.log(currentPath.value);
}, { immediate: true, deep: true })

const init = async () => {
    // todo 请求接口获取用户信息
    await getUserInfo()
}
init()
</script>

<style lang="scss" scoped>
.layout {
    .header {
        border-bottom: 1px solid gray;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .logo {
            font-size: 30px;
        }

        .user-info {
            display: flex;
            justify-content: flex-start;
            align-items: center;

            .el-dropdown {
                height: 21px;
                line-height: 21px;

                .nickname {
                    color: orange;
                    cursor: pointer;
                }
            }

            .head-img {
                margin-left: 10px;
                font-size: 0px;
                border-radius: 50%;
                overflow: hidden;

                img {
                    width: 40px;
                    height: 40px;
                }
            }

            // .example-showcase .el-dropdown-link {
            //     cursor: pointer;
            //     color: var(--el-color-primary);
            //     display: flex;
            //     align-items: center;
            // }
        }
    }

    .container {
        padding-top: 10px;
        height: calc(100vh - 60px);
        background-color: #f5f6f7;

        .left-aside {
            width: 250px;
            padding: 0 15px;

            .post-btn {
                background-color: orange;
                color: white;
                height: 40px;
                width: 100%;
                margin-bottom: 16px;
            }

            .menu-panel {
                .menu-title-container {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    border-radius: 4px;
                    height: 40px;
                    padding: 0 10px;
                    transition: all .3s;

                    &:hover {
                        background-color: #fff;
                    }

                    .menu-title {
                        margin-left: 8px;
                        flex: 1;
                    }
                }

                .sub-menu {
                    font-size: 14px;
                    color: rgb(85, 82, 82);

                    li {
                        // padding-left: 32px;
                        // display: flex;
                        // align-items: center;
                        line-height: 30px;
                        height: 30px;
                        border-radius: 4px;
                        cursor: pointer;
                        transition: all .3s;

                        .link {
                            // width:100%;
                            padding-left: 32px;
                            display: block;
                        }

                        &:hover {
                            background-color: antiquewhite;
                        }

                        .sub-menu-item {
                            // line-height: 30px;
                        }
                    }

                    .highlight {
                        background-color: rgb(137, 147, 147);
                    }

                }

                li {
                    padding: 0;
                    margin: 0;
                    list-style: none;
                }
            }

        }

        .right-main {
            background-color: #fff;
            margin-right: 15px;
            padding: 10px;
            position: relative;
        }
    }


}

.process-box {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .info {
        font-size: 12px;
        color: brown;
    }

    .releace-success {
        color: #13a04e
    }
}
</style>