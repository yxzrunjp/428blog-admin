<template>
    <div class="layout">
        <el-container>
            <el-header class="header">
                <div class="logo">LOGO</div>
                <div class="user-info">
                    <span>欢迎回来，</span>
                    <el-dropdown>
                        <span class="el-dropdown-link">
                            <span class="nickname">{{ userInfo.nickName }}</span>
                            <el-icon class="el-icon--right">
                                <arrow-down />
                            </el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item>个人信息</el-dropdown-item>
                                <el-dropdown-item>退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                    <div class="head-img">
                        <img :src="userInfo.avatar" alt="头像" :title="'头像'">
                    </div>
                </div>
            </el-header>
            <el-container class="container">
                <el-aside class="left-aside">
                    <div>
                        <el-button class="post-btn">发布</el-button>
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
                                <li :class="currentPath === subMenu.path?'highlight':''" v-for="subMenu in menu.children" :key="subMenu.title">
                                    <router-link class="link" :to="subMenu.path"><span class="sub-menu-item">{{
                                        subMenu.title
                                    }}</span></router-link>
                                </li>
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
</template>
  

<script setup>
import { reactive, getCurrentInstance, watch, ref } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router'
import cookies from 'vue-cookies';
const route = useRoute()
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
                path: '',
            },
            {
                title: '博客成员',
                path: '',
            },
            {
                title: '系统设置',
                path: '',
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
                path: '',
            },
        ]
    },

])

let userInfo = {}
// 用户信息
const init = () => {
    userInfo = reactive(cookies.get('userInfo'))
    userInfo.avatar = proxy.globalInfo.imageUrl + userInfo.avatar
}
init()

const handleMenu = (menu) => {
    menu.open = !menu.open
}

const currentPath = ref('')
watch(route,(newV,oldV)=>{
    currentPath.value = newV.path
    console.log(currentPath.value);
},{immediate:true,deep:true})
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

                    .highlight{
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
</style>