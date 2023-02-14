<template>
    <div class="blog-list">
        <div class="top-panel">
            <!-- label-width="60px" :gutter="10"-->
            <el-form :model="searchFormData">
                <el-row :gutter="10">
                    <el-col :span="5">
                        <el-form-item prop="titleFuzzy" label="标题">
                            <el-input placeholder="请输入标题" v-model="searchFormData.titleFuzzy" clearable>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="5">
                        <el-form-item prop="status" label="状态">
                            <el-select v-model="searchFormData.status" clearable placeholder="请选择状态">
                                <el-option v-for="item in blogStatus" :value="item.value" :label="item.label"
                                    :key="item.label"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="5">
                        <el-form-item prop="categoryId" label="分类">
                            <el-select v-model="searchFormData.categoryId" clearable placeholder="请选择分类">
                                <el-option v-for="item in blogCategory.list" :value="item.categoryId"
                                    :label="item.categoryName" :key="item.categoryId"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="9">
                        <el-button type="primary" @click="loadDataList">搜索</el-button>
                        <el-button type="primary" @click="showWindow('add')">新增博客</el-button>
                    </el-col>
                </el-row>
            </el-form>
        </div>
        <div class="table-box">
            <Table :dataSource="tableData" :columns="columns" :showPagination="true" :fetch="loadDataList"
                :options="tableOptions">
                <template #cover="{ index, row }">
                    <Cover :src="row.cover"></Cover>
                </template>
                <template #blogInfo="{ index, row }">
                    <div>标题：{{ row.title }}</div>
                    <div>分类：{{ row.categoryName }}</div>
                    <div>作者：{{ row.nickName }}</div>
                </template>
                <template #typeName="{ index, row }">
                    <div v-if="row.type===1">
                        <div>类型：转载</div>
                        <div>转载地址：{{ row.reprintUrl }}</div>
                    </div>
                    <div v-else-if="row.type===0">
                        <div>类型：原创</div>
                    </div>
                </template>
                <template #status="{ index, row }">
                    <span :style="{ color: 'red' }" v-if="row.status === 0">{{ row.statusName }}</span>
                    <span :style="{ color: 'skyblue' }" v-else>{{ row.statusName }}</span>
                </template>
                <template #time="{ index, row }">
                    <div>创建时间：{{ row.createTime }}</div>
                    <div>更新时间：{{ row.lastUpdateTime }}</div>
                </template>
                <template #op="{ index, row }">
                    <div class="op">
                        <span class="item" @click="showWindow('update', row)">修改</span>
                        <el-divider direction="vertical"></el-divider>
                        <span class="item" @click="handleDelete(row)">删除</span>
                        <el-divider direction="vertical"></el-divider>
                        <span class="item" @click="handlePreview(row)">预览</span>
                    </div>
                </template>
            </Table>
        </div>
        <!-- :show="windowConfig.show" v-if="windowConfig.show" -->
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

        <Dialog :width="'700px'" :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons"
            @close="dialogClose">
            <el-form label-width="80px" :model="dialogFormData" :rules="dialogRules" ref="dialogFormRef">
                <el-form-item prop="categoryId" label="博客分类">
                    <el-select v-model="dialogFormData.categoryId" clearable placeholder="请选择分类">
                        <el-option v-for="item in blogCategory.list" :value="item.categoryId" :label="item.categoryName"
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
                    <!-- <span :style="{ fontSize: '12px' }">添加标签更容易被搜索引擎收录</span> -->
                    <el-tag :style="{ marginRight: '10px' }" v-for="t, idx in dialogFormData.tag" :key="t" closable
                        @close="removeTag(idx)">
                        {{ t }}
                    </el-tag>
                    <el-input v-if="showTagInput" :style="{ width: '150px' }" ref="InputRef" v-model="tagName"
                        size="small" @keyup.enter="hiddenInput" @blur="hiddenInput" placeholder="请输入标签" />
                    <el-button v-else size="small" @click="addTag">
                        添加标签
                    </el-button>
                </el-form-item>

            </el-form>
        </Dialog>

        <!-- 预览博客组件 -->
        <BlogDetail ref="blogDetailRef"></BlogDetail>
    </div>
</template>

<script setup>
import { reactive, getCurrentInstance, ref, nextTick, watch, onUnmounted } from 'vue';
// import BlogEdit from '@/components/BlogEdit.vue'
import BlogDetail from '@/components/BlogDetail.vue'
const { proxy } = getCurrentInstance()
const api = {
    loadAllCategory: '/category/loadAllCategory4Blog',
    loadBlog: '/blog/loadBlog',
    saveBlog: '/blog/saveBlog',
    getUserInfo: '/getUserInfo',
    getBlogById: '/blog/getBlogById',
    recoveryBlog: '/blog/recoveryBlog',
    autoSaveBlog:'/blog/autoSaveBlog',
}

const editorType = ref(0)
const userInfo = reactive({})

// =========搜索表单===============
const searchFormData = reactive({})
const blogStatus = reactive([
    {
        value: 0,
        label: '草稿',
    },
    {
        value: 1,
        label: '已发布',
    },
])
const blogCategory = reactive({
    list: []
})
const loadCategory = async () => {
    const result = await proxy.Request({
        url: api.loadAllCategory,
    })
    if (!result) {
        return
    }
    blogCategory.list = result.data
}


// ===========博客列表=============
const columns = [
    {
        label: '封面',
        prop: 'cover',
        width: 100,
        scopedSlots: 'cover',
    },
    {
        label: '文章信息',
        prop: 'blogInfo',
        scopedSlots: 'blogInfo',
    },
    {
        label: '编辑器',
        prop: 'editorTypeName',
        width: 100,
    },
    {
        label: '类型',
        prop: 'typeName',
        width: 200,
        scopedSlots: 'typeName',
    },
    {
        label: '评论',
        prop: 'allowCommentTypeName',
        width: 70,
    },
    {
        label: '状态',
        prop: 'status',
        width: 70,
        scopedSlots: 'status',
    },
    {
        label: '时间',
        prop: 'time',
        width: 240,
        scopedSlots: 'time',
    },
    {
        label: '操作',
        prop: 'op',
        width: 200,
        scopedSlots: 'op',
    },
]
const tableData = reactive({
    list: [],
    pageNo: 1,
    pageSize: 15,
    pageTotal: 0,
    totalCount: 0,
})
const tableOptions = {
    extHeight: 50,
}
const blogDetailRef = ref(null)
const loadDataList = async () => {
    const params = {
        pageNo: tableData.pageNo,
        pageSize: tableData.pageSize,
    }
    Object.assign(params, searchFormData)
    const result = await proxy.Request({
        url: api.loadBlog,
        params,
    })
    if (!result) {
        return
    }
    Object.assign(tableData, result.data)
}
// 显示博客编辑
const showWindow = (type, data) => {
    windowConfig.show = true;
    nextTick(() => {
        if (type === 'update') {
            getBlogInfo(data.blogId)
        } else {

        }
    })

}
// 删除博客
const handleDelete = ({ blogId,title }) => {
    proxy.Confirm(`确定删除'${title}'?`, async () => {
        await deleteBlog(blogId)
        loadDataList()
    })
}
const deleteBlog = async (blogId) => {
    const result = await proxy.Request({
        url: api.recoveryBlog,
        params: { blogId },
    })
    if (!result) {
        return
    }
}
// 预览博客
const handlePreview = ({blogId})=>{
    blogDetailRef.value.showDetail(blogId)
}

// ============= 新增-编辑 博客 =============
const blogId = ref('')//博客ID，修改传入，新增不传
const currentBlogInfo = ref({})//当前修改的博客信息
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
                // // 重置dialog表单->重置blog表单
                // resetDialogForm()

                resetBlog()
                nextTick(() => {
                    windowConfig.show = false
                    // 重新加载列表
                    loadDataList()
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
const htmlContentChange = (html) => {
    blogFormData.content = html
}
const resetBlog = () => {
    blogFormRef.value.resetFields()
    blogId.value = ''
    editorType.value = userInfo.editorType
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
    Object.assign(params,blogFormData)
    params.editorType = editorType.value
    if (blogId.value) {
        params.blogId = blogId.value
    }
    const result = await proxy.Request({
        url:api.autoSaveBlog,
        showLoading:false,
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
            if(blogFormData.title===''&&blogFormData.content===''||dialogConfig.show){
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
                dialogClose()
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
    dialogFormRef.value.resetFields()
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

        let result = await proxy.Request({
            url: api.saveBlog,
            params,
        })
        if (!result) {
            return
        }
        // 重置dialog表单->关闭dialog->重置blog表单->关闭window组件
        resetDialogForm()
        dialogClose()
        resetBlog()
        proxy.Message.success('保存成功')

        nextTick(() => {
            windowConfig.show = false
            // 重新加载列表
            loadDataList()
        })

    })
}


// 初始化
const getUserInfo = async () => {
    const result = await proxy.Request({
        url: api.getUserInfo,
    })
    if (!result) {
        return
    }
    Object.assign(userInfo,result.data)
    editorType.value = result.data.editorType
}
const init = async () => {
    // 加载博客分类
    await loadCategory()
    // 获取用户信息
    await getUserInfo()
}
init()


</script>

<style lang="scss" scoped>

.md-box {
    // :deep(.el-input){
    //     .el-input__wrapper{
    //         box-shadow: none;
    //     }
    // }
}
</style>