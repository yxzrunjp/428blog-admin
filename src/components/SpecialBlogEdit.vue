<template>
    <Window v-if="windowConfig.show" :buttons="windowConfig.buttons">
        <div class="md-box">
            <el-form :model="blogFormData" :rules="blogRules" ref="blogFormRef">
                <el-form-item prop="title">
                    <el-input placeholder="请输入标题" v-model="blogFormData.title" />
                </el-form-item>
                <el-form-item v-if="editorType === 1" prop="markdownContent">
                    <EditorMarkdown v-model="blogFormData.markdownContent" :editorHeight="height"
                        @htmlContentChange="htmlContentChange">
                    </EditorMarkdown>
                </el-form-item>
                <el-form-item v-else prop="content">
                    <EditorHtml v-model="blogFormData.content" :editorHeight="height">
                    </EditorHtml>
                </el-form-item>
            </el-form>
        </div>
    </Window>

    <!-- 预览博客组件 -->
    <BlogDetail ref="blogDetailRef"></BlogDetail>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, watch, onUnmounted } from 'vue'
import BlogDetail from '@/components/BlogDetail.vue'
const { proxy } = getCurrentInstance()
// 接口地址
const api = {
    getUserInfo: '/getUserInfo',
    getBlogById: '/blog/getBlogById',
    autoSaveBlog: '/blog/autoSaveBlog4Special',
    saveBlogSpecial: '/blog/saveBlog4Special'
}
const props = defineProps({
    blogCategory: {
        type: Array,
        default: () => {
            return []
        }
    },
})
const emit = defineEmits(['closeWindow'])
const editorType = ref(0) //编辑器类型
const editType = ref('add') //当前是新增博客add或是修改博客update

const userInfo = reactive({}) //用户信息
const getUserInfo = async () => {
    const result = await proxy.Request({
        url: api.getUserInfo,
    })
    if (!result) {
        return
    }
    Object.assign(userInfo, result.data)
    editorType.value = result.data.editorType
}
// 初始化
const init = async () => {
    await getUserInfo()
}
init()

// ============= 新增-编辑 博客 =============
const blogId = ref('')//博客ID，修改传入，新增不传
const categoryId = ref('')//专题分类ID

let currentBlogInfo = ref({})// 当前修改的博客信息
const blogFormData = reactive({
    title: '',//标题
    content: '',//html内容
    markdownContent: '',//markdown内容,markdown编辑器必传
})
const blogRules = reactive({
    title: [{ required: true, message: "请输入标题" }],
    content: [{ required: true, message: '请输入正文' }],//html内容
    markdownContent: [{ required: true, message: '请输入正文' }],//markdown内容
})
const blogFormRef = ref()
const height = window.innerHeight - 220
const windowConfig = reactive({
    show: false,
    buttons: [
        {
            text: '取消',
            type: 'danger',
            click: (e) => {
                // 重置blog表单
                let tempCid = categoryId.value
                resetBlog()
                // 隐藏窗口
                nextTick(() => {
                    hiddenWindow()
                    emit('closeWindow',tempCid)
                })
            }
        },
        {
            text: '确认',
            type: 'primary',
            click: (e) => {
                blogFormRef.value.validate((v) => {
                    if (!v) {
                        return
                    }
                    // 提交信息
                    submitInfo()
                })
            }
        },
    ],
})
// 显示博客编辑组件
const showWindow = () => {
    windowConfig.show = true
}
// 隐藏博客编辑组件
const hiddenWindow = () => {
    windowConfig.show = false
}

const htmlContentChange = (html) => {
    blogFormData.content = html
}
const resetBlog = () => {
    blogFormRef.value.resetFields()
    editType.value = 'add'
    blogId.value = ''
    categoryId.value = ''
    editorType.value = userInfo.editorType
    currentBlogInfo = reactive({})
}

const setBlogId = (type, bId,cId) => {
    editType.value = type
    blogId.value = bId
    categoryId.value = cId
}

// 获取博客信息
const getBlogInfo = async () => {
    const result = await proxy.Request({
        url: api.getBlogById,
        params: { blogId: blogId.value }
    })
    if (!result) {
        return
    }
    Object.assign(currentBlogInfo, result.data)
    setBlogContent()
}

const setBlogContent = () => {
    editorType.value = currentBlogInfo.editorType
    for (const key in blogFormData) {
        blogFormData[key] = currentBlogInfo[key]
    }
}

// 提交博客信息
const submitInfo = async () => {
    const params = {}
    Object.assign(params, blogFormData)
    if (editType.value === 'update') {
        // 修改,带blogID
        params.blogId = blogId.value
    }else if(editType.value === 'add'){
        params.pBlogId = blogId.value
    }
    params.editorType = editorType.value
    params.categoryId = categoryId.value
    console.log(params);
    const result = await proxy.Request({
        url: api.saveBlogSpecial,
        params
    })
    if (!result) {
        return
    }
    // 重置博客数据
    const cid = categoryId.value
    resetBlog()
    nextTick(()=>{
        // 隐藏窗口
        hiddenWindow()
        proxy.Message.success('保存成功')
        // 触发关闭事件，父组件刷新数据
        emit('closeWindow',cid)
    })
}
// 自动保存
let timer = null
const autoSaveBlog = async () => {
    const params = {}
    Object.assign(params, blogFormData)
    params.editorType = editorType.value
    params.categoryId = categoryId.value
    if (editType.value === 'update') {
        params.blogId = blogId.value
    }else if(editType.value ==='add'){
        params.pBlogId = blogId.value
    }
    const result = await proxy.Request({
        url: api.autoSaveBlog,
        showLoading: false,
        params,
    })
    if (!result) {
        return
    }
    blogId.value = result.data
    editType.value = 'update'
}
const clearTimer = () => {
    if (timer) {
        window.clearInterval(timer)
    }
}
watch(() => windowConfig.show, (newV) => {
    if (newV) {
        timer = window.setInterval(async () => {
            // 标题内容为空，或者博客配置弹框已弹出，不进行自动保存
            if (blogFormData.title === '' || blogFormData.content === '') {
                return
            }
            await autoSaveBlog()
        }, 5000)
    } else {
        clearTimer()
    }
})
onUnmounted(() => {
    clearTimer()
})

// 预览博客
const blogDetailRef = ref(null)
const lookBlog = (blogId) => {
    blogDetailRef.value.showDetail(blogId)
}


defineExpose({
    showWindow,//显示窗口
    hiddenWindow,//隐藏窗口
    getBlogInfo,//获取博客信息
    lookBlog,//预览博客
    setBlogId,
})

</script>

<style lang="scss" scoped>

</style>