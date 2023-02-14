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
                    <div v-if="row.type === 1">
                        <div>类型：转载</div>
                        <div>转载地址：{{ row.reprintUrl }}</div>
                    </div>
                    <div v-else-if="row.type === 0">
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
        <BlogEdit ref="blogEditRef" :blogCategory="blogCategory.list" @closeWindow="handleCloseWindow"></BlogEdit>
    </div>
</template>

<script setup>
import { reactive, getCurrentInstance, ref, nextTick, } from 'vue';
import BlogEdit from '@/components/BlogEdit.vue'

const { proxy } = getCurrentInstance()
const api = {
    loadAllCategory: '/category/loadAllCategory4Blog',
    loadBlog: '/blog/loadBlog',
    recoveryBlog: '/blog/recoveryBlog',
}

// 编辑博客的组件
const blogEditRef = ref(null)
const handleCloseWindow = () => {
    loadDataList()
}

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
    blogEditRef.value.showWindow()
    nextTick(() => {
        if (type === 'update') {
            blogEditRef.value.getBlogInfo(data.blogId)
        } else {

        }
    })

}
// 删除博客
const handleDelete = ({ blogId, title }) => {
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
const handlePreview = ({ blogId }) => {
    blogEditRef.value.lookBlog(blogId)
}

// ==================================
// 初始化
const init = async () => {
    // 加载博客分类
    await loadCategory()
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