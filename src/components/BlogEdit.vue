<template>
    <Window v-if="windowConfig.show" :buttons="windowConfig.buttons">
        <div class="md-box">
            <el-form :model="blogFormData" :rules="blogRules" ref="blogFormRef">
                <el-form-item prop="title">
                    <el-input placeholder="请输入标题" v-model="blogFormData.title" />
                </el-form-item>
                <template v-if="editorType === 1">
                    <el-form-item prop="markdownContent">
                        <EditorMarkdown v-model="blogFormData.markdownContent" :editorHeight="height"
                            @htmlContentChange="htmlContentChange">
                        </EditorMarkdown>
                    </el-form-item>
                </template>
                <template v-else>
                    <el-form-item prop="content">
                        <EditorHtml v-model="blogFormData.content" :editorHeight="height">
                        </EditorHtml>
                    </el-form-item>
                </template>
            </el-form>
        </div>
    </Window>

    <Dialog :width="'700px'" :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons"
        @close="dialogClose">
        <el-form label-width="80px" :model="dialogFormData" :rules="dialogRules" ref="dialogFormRef">
            <el-form-item prop="categoryId" label="博客分类">
                <el-select v-model="dialogFormData.categoryId" clearable placeholder="请选择分类">
                    <el-option v-for="item in blogCategory" :value="item.categoryId" :label="item.categoryName"
                        :key="item.categoryId"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item prop="cover" label="封面">
                <CoverUpload v-model="dialogFormData.cover"></CoverUpload>
            </el-form-item>

            <el-form-item prop="type" label="博客类型">
                <el-radio-group v-model="dialogFormData.type">
                    <el-radio :label="0">原创</el-radio>
                    <el-radio :label="1">转载</el-radio>
                </el-radio-group>
            </el-form-item>

            <el-form-item prop="reprintUrl" label="原文地址" v-if="dialogFormData.type === 1">
                <el-input v-model="dialogFormData.reprintUrl" placeholder="请输入原文地址"></el-input>
            </el-form-item>

            <el-form-item prop="allowComment" label="评论">
                <el-radio-group v-model="dialogFormData.allowComment">
                    <el-radio :label="1" size="large">允许</el-radio>
                    <el-radio :style="{ marginRight: '10px' }" :label="0" size="large">不允许</el-radio>
                    <span :style="{ fontSize: '12px' }">请先在评论设置里设置好相应参数,评论才会生效</span>
                </el-radio-group>
            </el-form-item>

            <el-form-item prop="summary" label="博客摘要">
                <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 4 }" placeholder="请输入博客摘要"
                    v-model="dialogFormData.summary">
                </el-input>
            </el-form-item>

            <el-form-item prop="tag" label="博客标签">
                <el-tag :style="{ marginRight: '10px' }" v-for="t, idx in dialogFormData.tag" :key="t" closable
                    @close="removeTag(idx)">
                    {{ t }}
                </el-tag>
                <el-input v-if="showTagInput" :style="{ width: '150px' }" ref="InputRef" v-model="tagName" size="small"
                    @keyup.enter="hiddenInput" @blur="hiddenInput" placeholder="请输入标签" />
                <el-button v-else size="small" @click="addTag">
                    添加标签
                </el-button>
            </el-form-item>

        </el-form>
    </Dialog>

    <!-- 预览博客组件 -->
    <BlogDetail ref="blogDetailRef"></BlogDetail>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, watch, onUnmounted, onMounted } from 'vue'
import BlogDetail from '@/components/BlogDetail.vue'
import { useUserInfoStore } from '@/store/userInfoStore'
const store = useUserInfoStore()
const { proxy } = getCurrentInstance()
// 接口地址
const api = {
    getBlogById: '/blog/getBlogById',
    saveBlog: '/blog/saveBlog',
    autoSaveBlog: '/blog/autoSaveBlog',
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

const getUserEditorType = () => {
    editorType.value = store.editorType
}
// store获得数据后，获取最新的editorType
store.$subscribe(() => {
    getUserEditorType()
})

// ============= 新增-编辑 博客 =============
const blogId = ref('')//博客ID，修改传入，新增不传
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
const blogFormRef = ref(null)
const height = window.innerHeight - 220
const windowConfig = reactive({
    show: false,
    buttons: [
        {
            text: '取消',
            type: 'danger',
            click: (e) => {
                // 重置dialog表单->重置blog表单
                resetDialogForm()
                resetBlog()
                nextTick(() => {
                    hiddenWindow()
                    emit('closeWindow')
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
                    dialogConfig.show = true
                    nextTick(() => {
                        setDialogInfo()
                    })
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
    blogFormData.content = ''
    blogFormData.markdownContent = ''
    blogId.value = ''
    editorType.value = store.editorType
    currentBlogInfo = reactive({})
}
// 获取博客信息
const getBlogInfo = async (id) => {
    const result = await proxy.Request({
        url: api.getBlogById,
        params: { blogId: id }
    })
    if (!result) {
        return
    }
    Object.assign(currentBlogInfo, result.data)
    setBlogContent()
}
const setBlogContent = () => {
    blogId.value = currentBlogInfo.blogId
    editorType.value = currentBlogInfo.editorType
    for (const key in blogFormData) {
        blogFormData[key] = currentBlogInfo[key]
    }
}
// 自动保存
let timer = null
const autoSaveBlog = async () => {
    const params = {}
    Object.assign(params, blogFormData)
    params.editorType = editorType.value
    if (blogId.value) {
        params.blogId = blogId.value
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
    console.log(result);
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
            if (blogFormData.title === '' || blogFormData.content === '' || dialogConfig.show) {
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

// ===============博客设置==================
const showTagInput = ref(false)
const tagName = ref('')
const addTag = () => {
    showTagInput.value = true
}
const removeTag = (e) => {
    dialogFormData.tag.splice(e, 1)
}
const hiddenInput = (e) => {
    if (tagName.value) {
        if (!dialogFormData.tag.includes(tagName.value)) {
            dialogFormData.tag.push(tagName.value)
        }
        tagName.value = ''
    }
    showTagInput.value = false
}

const dialogFormData = reactive({
    categoryId: '',//分类ID
    cover: '',//封面
    summary: '',//简介
    tag: [],
    type: 0,//0原创，1转载
    reprintUrl: '',//转载地址，转载类型必传
    allowComment: 1,//是否允许评论
})
const dialogRules = reactive({
    categoryId: [{ required: true, message: '请选择博客分类' }],
    type: [{ required: true, message: '请选择博客类型' }],
    allowComment: [{ required: true, message: '请选择是否允许评论' }],
    reprintUrl: [{ required: true, message: '请输入原文地址' }],
})
const dialogFormRef = ref()
const dialogConfig = reactive({
    show: false,
    title: '标题',//标题
    buttons: [
        {
            type: 'danger',
            text: '取消',
            click: (e) => {
                resetDialogForm()
                nextTick(() => {
                    dialogClose()
                })
            }
        },
        {
            type: 'primary',
            text: '确定',
            click: (e) => {
                // 提交表单
                submitBlog()
            }
        },
    ],//按钮集合
})
const dialogClose = () => {
    dialogConfig.title = ''
    dialogConfig.show = false
}
const resetDialogForm = () => {
    dialogFormRef?.value?.resetFields()
    dialogFormRef.reprintUrl = ''
}
const setDialogInfo = () => {
    if (!currentBlogInfo.categoryId) {
        return
    }
    if (currentBlogInfo.tag) {
        currentBlogInfo.tag = currentBlogInfo.tag.split('|')
    }
    for (const key in dialogFormData) {
        dialogFormData[key] = currentBlogInfo[key]
    }
}
const submitBlog = async () => {
    dialogFormRef.value.validate(async (v) => {
        if (!v) {
            return
        }
        const params = {
            editorType: editorType.value,//0:富文本,1:markdown
        }
        if (blogId.value) {
            params.blogId = blogId.value
        }
        Object.assign(params, blogFormData, dialogFormData)
        params.tag = params?.tag?.length ? params.tag.join('|') : ''
        if (params.type === 0) {
            delete params.reprintUrl
            dialogFormData.reprintUrl = ''
        }
        let result = await proxy.Request({
            url: api.saveBlog,
            params,
        })
        if (!result) {
            return
        }
        // 重置dialog表单->关闭dialog->重置blog表单->重置保存的博客信息->关闭window组件
        resetDialogForm()
        dialogClose()
        resetBlog()
        proxy.Message.success('保存成功')

        nextTick(() => {
            hiddenWindow()
            // 重新加载列表
            emit('closeWindow')
        })

    })
}

const init = () => {
    getUserEditorType()
}
init()

defineExpose({
    showWindow,
    hiddenWindow,
    getBlogInfo,
    lookBlog,
})

</script>

<style lang="scss" scoped></style>